import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export type Diagnostic = {
  code: string;
  severity: 'error' | 'warning';
  file: string;
  message: string;
};

export type ValidationReport = {
  valid: boolean;
  files: string[];
  diagnostics: Diagnostic[];
};

type XmlNode = Record<string, unknown>;
const MAX_FILES = 64;
const MAX_BYTES = 2 * 1024 * 1024;
const nodes = (value: unknown): XmlNode[] =>
  (Array.isArray(value) ? value : value === undefined ? [] : [value])
    .filter((item): item is XmlNode => !!item && typeof item === 'object');

function references(node: unknown, result: string[] = []): string[] {
  if (!node || typeof node !== 'object') return result;
  if (Array.isArray(node)) {
    for (const child of node) references(child, result);
    return result;
  }
  const obj = node as XmlNode;
  for (const [key, child] of Object.entries(obj)) {
    const tag = key.split(':').at(-1);
    if (tag === 'import' || tag === 'include' || tag === 'redefine' || tag === 'override') {
      for (const item of nodes(child)) {
        const location = item['@_schemaLocation'] ?? item['@_location'];
        if (typeof location === 'string') result.push(location);
      }
    }
    if (!key.startsWith('@_')) references(child, result);
  }
  return result;
}

/**
 * Preliminary local contract validation, not a full WSDL/XSD semantic validator.
 * Imports are traversed within a canonical root directory only, with size/count caps.
 * No URL fetching, XML entity expansion, or SOAP invocation occurs.
 */
export async function validateLocalContract(entry: string, rootDirectory = dirname(resolve(entry))): Promise<ValidationReport> {
  const diagnostics: Diagnostic[] = [];
  const files: string[] = [];
  const root = await realpath(rootDirectory);
  const seen = new Set<string>();
  const report = (): ValidationReport => ({
    valid: !diagnostics.some(d => d.severity === 'error'),
    files,
    diagnostics
  });
  const error = (code: string, file: string, message: string): void => {
    diagnostics.push({ code, severity: 'error', file, message });
  };

  async function visit(filename: string, isEntry: boolean): Promise<void> {
    let canonical: string;
    try {
      canonical = await realpath(filename);
    } catch {
      error('FILE_NOT_FOUND', filename, 'Referenced contract file does not exist or cannot be accessed');
      return;
    }
    const rel = relative(root, canonical);
    if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) {
      error('OUTSIDE_ROOT', filename, 'Contract reference escapes the allowed root directory');
      return;
    }
    if (seen.has(canonical)) return;
    if (seen.size >= MAX_FILES) {
      error('FILE_LIMIT', filename, `Maximum of ${MAX_FILES} contract files exceeded`);
      return;
    }
    seen.add(canonical);
    files.push(canonical);
    try {
      const info = await stat(canonical);
      if (info.size > MAX_BYTES) {
        error('SIZE_LIMIT', canonical, `Contract file exceeds ${MAX_BYTES} bytes`);
        return;
      }
      const xml = await readFile(canonical, 'utf8');
      if (/<!DOCTYPE\b|<!ENTITY\b/i.test(xml)) {
        error('DTD_NOT_ALLOWED', canonical, 'DOCTYPE and entity declarations are not allowed');
        return;
      }
      const checked = XMLValidator.validate(xml);
      if (checked !== true) {
        error('INVALID_XML', canonical, checked.err.msg);
        return;
      }
      const doc = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        processEntities: false,
        trimValues: true
      }).parse(xml) as XmlNode;
      if (isEntry && !Object.keys(doc).some(key => key.split(':').at(-1) === 'definitions')) {
        error('NOT_WSDL_11', canonical, 'Expected a WSDL 1.1 definitions root');
      }
      for (const location of references(doc)) {
        if (/^[a-z][a-z\d+.-]*:/i.test(location) || location.startsWith('//')) {
          error('REMOTE_REFERENCE', canonical, `Remote import is disabled: ${location}`);
          continue;
        }
        if (!location || location.includes('#') || location.includes('?')) {
          error('INVALID_REFERENCE', canonical, `Unsupported import location: ${location}`);
          continue;
        }
        await visit(resolve(dirname(canonical), location), false);
      }
    } catch (cause) {
      error('READ_ERROR', canonical, cause instanceof Error ? cause.message : String(cause));
    }
  }

  await visit(resolve(entry), true);
  diagnostics.push({
    code: 'PARTIAL_VALIDATION',
    severity: 'warning',
    file: resolve(entry),
    message: 'Import and XML checks only. Schema types, namespace bindings, SOAP semantics and WS-Security are not yet validated.'
  });
  return report();
}
