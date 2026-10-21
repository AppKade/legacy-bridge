import { describe, expect, it } from 'vitest';
import { inspectWsdl } from '../src/wsdl.js';

const sample = `<?xml version="1.0"?>
<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" name="Inventory" targetNamespace="urn:inventory">
  <wsdl:portType name="InventoryPort">
    <wsdl:operation name="GetItem"><wsdl:input message="tns:GetItemRequest"/><wsdl:output message="tns:GetItemResponse"/></wsdl:operation>
  </wsdl:portType>
  <wsdl:service name="InventoryService" />
</wsdl:definitions>`;

describe('inspectWsdl', () => {
  it('lists WSDL 1.1 operations', () => {
    const result = inspectWsdl(sample);
    expect(result.service).toBe('InventoryService');
    expect(result.portTypes[0].operations[0].name).toBe('GetItem');
  });
  it('rejects non-WSDL documents', () => expect(() => inspectWsdl('<hello/>')).toThrow());
  it('rejects malformed XML', () => expect(() => inspectWsdl('<')).toThrow());
});

it('applies the same DTD and size policy as validation', () => {
  expect(() => inspectWsdl('<!DOCTYPE definitions><definitions/>')).toThrow(/DOCTYPE/);
  expect(() => inspectWsdl(' '.repeat(2 * 1024 * 1024 + 1))).toThrow(/2 MiB/);
});
it('checks namespaces without confusing extension elements with WSDL operations', () => {
  expect(() => inspectWsdl('<definitions xmlns="urn:other"/>')).toThrow(/WSDL/);
  expect(() => inspectWsdl('<definitions/>')).toThrow(/WSDL/);
  const xml = sample.replace('<wsdl:operation name="GetItem">', '<wsdl:operation name="GetItem">')
    .replace('</wsdl:portType>', '<ext:operation xmlns:ext="urn:extension" name="NotAnOperation"/></wsdl:portType>');
  expect(inspectWsdl(xml).portTypes[0].operations.map(o => o.name)).toEqual(['GetItem']);
});

it('inventories message parts without claiming type resolution', () => {
  const xml=sample.replace('<wsdl:portType', '<wsdl:message name="Request"><wsdl:part name="body" element="tns:Item"/><wsdl:part name="count" type="xsd:int"/></wsdl:message><wsdl:portType');
  expect(inspectWsdl(xml).messages).toEqual([{name:'Request',parts:[{name:'body',element:'tns:Item'},{name:'count',type:'xsd:int'}]}]);
});
