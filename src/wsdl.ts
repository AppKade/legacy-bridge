import { parseContractXml, documentRoot, children, WSDL_11, WSDL_20 } from './xml.js';

export type WsdlOperation = { name: string; input?: string; output?: string };
export type WsdlMessage = {name:string; parts:{name:string; element?:string; type?:string}[]};
export type WsdlInspection = {
  service: string | null;
  targetNamespace: string | null;
  portTypes: { name: string; operations: WsdlOperation[] }[];
  messages: WsdlMessage[];
  warnings: string[];
};

/**
 * Contract inventory only. Does not resolve WSDL imports or generate executable adapters.
 * External entities and remote schemas are deliberately not fetched.
 */
export function inspectWsdl(xml: string): WsdlInspection {
  const parsed = parseContractXml(xml);
  const document = documentRoot(parsed);
  const is11 = document.name === 'definitions' && document.namespace === WSDL_11;
  const is20 = document.name === 'description' && document.namespace === WSDL_20;
  if (!is11 && !is20) throw new Error('Expected a namespace-qualified WSDL definitions or description root element');
  const root = document.node;
  const ports = children(root, 'portType', root);
  const portTypes = ports.map(port => ({
    name: String(port['@_name'] ?? 'unnamed'),
    operations: children(port, 'operation', root).map(op => {
      const input = children(op, 'input', {...root, ...port})[0];
      const output = children(op, 'output', {...root, ...port})[0];
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
  if (is20) warnings.push('WSDL 2.0 detected: operation extraction is not implemented.');
  if (portTypes.length === 0) warnings.push('No WSDL 1.1 portType elements found.');
  return {
    service: children(root, 'service', root)
      .map(x => x['@_name']).filter(Boolean).map(String)[0] ?? null,
    targetNamespace: root['@_targetNamespace'] ? String(root['@_targetNamespace']) : null,
    portTypes,
    messages:children(root, 'message', root).map(message => ({
      name:String(message['@_name'] ?? 'unnamed'),
      parts:children(message, 'part', root).map(part => ({
        name:String(part['@_name'] ?? 'unnamed'),
        ...(part['@_element'] ? {element:String(part['@_element'])} : {}),
        ...(part['@_type'] ? {type:String(part['@_type'])} : {}),
      })),
    })),
    warnings
  };
}
