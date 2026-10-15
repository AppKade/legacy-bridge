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
