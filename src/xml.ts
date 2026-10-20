import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const MAX_BYTES = 2 * 1024 * 1024;
export type XmlNode = Record<string, unknown>;
export const WSDL_11 = 'http://schemas.xmlsoap.org/wsdl/';
export const WSDL_20 = 'http://www.w3.org/ns/wsdl';
export const XSD = 'http://www.w3.org/2001/XMLSchema';

/** Shared offline parser policy for both public entry points. */
export function parseContractXml(xml: string): XmlNode {
  if (Buffer.byteLength(xml, 'utf8') > MAX_BYTES) throw new Error('Contract exceeds 2 MiB');
  if (/<!DOCTYPE\b|<!ENTITY\b/i.test(xml)) throw new Error('DOCTYPE and entity declarations are not allowed');
  const result = XMLValidator.validate(xml);
  if (result !== true) throw new Error(`Invalid XML: ${result.err.msg}`);
  return new XMLParser({ignoreAttributes:false, attributeNamePrefix:'@_', processEntities:false, trimValues:true}).parse(xml) as XmlNode;
}

export function documentRoot(doc: XmlNode): { name: string; namespace: string; node: XmlNode } {
  const entry = Object.entries(doc).find(([key]) => !key.startsWith('?') && !key.startsWith('@_'));
  if (!entry || Array.isArray(entry[1])) throw new Error('Expected an XML document element');
  const qualified = entry[0];
  const node = entry[1] && typeof entry[1] === 'object' ? entry[1] as XmlNode : {};
  const at = qualified.indexOf(':');
  const prefix = at < 0 ? '' : qualified.slice(0, at);
  return {name:qualified.slice(at + 1), namespace:String(node[prefix ? `@_xmlns:${prefix}` : '@_xmlns'] ?? ''), node};
}

/** WSDL children may use any prefix bound to the WSDL namespace. */
export function children(node: XmlNode, name: string, inherited: XmlNode): XmlNode[] {
  const result: XmlNode[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('@_') || key.split(':').at(-1) !== name) continue;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (!child || typeof child !== 'object') continue;
      const at = key.indexOf(':');
      const attribute = at < 0 ? '@_xmlns' : `@_xmlns:${key.slice(0, at)}`;
      if ((child[attribute] ?? node[attribute] ?? inherited[attribute]) === WSDL_11) result.push(child);
    }
  }
  return result;
}
