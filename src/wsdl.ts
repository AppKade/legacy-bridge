import { XMLParser, XMLValidator } from 'fast-xml-parser';

export type WsdlOperation = { name: string; input?: string; output?: string };
export type WsdlInspection = {
  service: string | null;
  targetNamespace: string | null;
  portTypes: { name: string; operations: WsdlOperation[] }[];
  warnings: string[];
};

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * Contract inventory only. Does not resolve WSDL imports or generate executable adapters.
 * External entities and remote schemas are deliberately not fetched.
 */
export function inspectWsdl(xml: string): WsdlInspection {
  const result = XMLValidator.validate(xml);
  if (result !== true) throw new Error(`Invalid XML: ${result.err.msg}`);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    processEntities: false,
    trimValues: true
  });
  const parsed = parser.parse(xml) as Record<string, unknown>;
  const root = (parsed.definitions ?? parsed.description) as Record<string, unknown> | undefined;
  if (!root || typeof root !== 'object') {
    throw new Error('Expected a WSDL definitions or description root element');
  }
  const ports = asArray(root.portType as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const portTypes = ports.map(port => ({
    name: String(port['@_name'] ?? 'unnamed'),
    operations: asArray(port.operation as Record<string, unknown> | Record<string, unknown>[] | undefined).map(op => {
      const input = op.input as Record<string, unknown> | undefined;
      const output = op.output as Record<string, unknown> | undefined;
      return {
        name: String(op['@_name'] ?? 'unnamed'),
        ...(input?.['@_message'] ? { input: String(input['@_message']) } : {}),
        ...(output?.['@_message'] ? { output: String(output['@_message']) } : {})
      };
    })
  }));
  const warnings = [
    'Preview inventory only: imports, type resolution, SOAP bindings and security policies are not validated.'
  ];
  if (parsed.description) warnings.push('WSDL 2.0 detected: operation extraction is not implemented.');
  if (portTypes.length === 0) warnings.push('No WSDL 1.1 portType elements found.');
  return {
    service: asArray(root.service as Record<string, unknown> | Record<string, unknown>[] | undefined)
      .map(x => x['@_name']).filter(Boolean).map(String)[0] ?? null,
    targetNamespace: root['@_targetNamespace'] ? String(root['@_targetNamespace']) : null,
    portTypes,
    warnings
  };
}
