import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateLocalContract } from '../src/validate.js';

const directories: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'legacy-bridge-'));
  directories.push(root);
  return root;
}
afterEach(async () => {
  await Promise.all(directories.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});
const wsdl = (location: string) =>
  `<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"><types><schema xmlns="http://www.w3.org/2001/XMLSchema"><import schemaLocation="${location}"/></schema></types></definitions>`;

describe('validateLocalContract', () => {
  it('accepts a local imported schema', async () => {
    const root = await fixture();
    await writeFile(join(root, 'contract.wsdl'), wsdl('types.xsd'));
    await writeFile(join(root, 'types.xsd'), '<schema xmlns="http://www.w3.org/2001/XMLSchema"/>');
    const result = await validateLocalContract(join(root, 'contract.wsdl'));
    expect(result.valid).toBe(true);
    expect(result.files).toHaveLength(2);
  });
  it('rejects remote import URLs without fetching them', async () => {
    const root = await fixture();
    await writeFile(join(root, 'contract.wsdl'), wsdl('https://example.com/types.xsd'));
    const result = await validateLocalContract(join(root, 'contract.wsdl'));
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d => d.code === 'REMOTE_REFERENCE')).toBe(true);
  });
  it('blocks imported files outside root', async () => {
    const parent = await fixture();
    const root = join(parent, 'allowed');
    await mkdir(root);
    await writeFile(join(parent, 'secret.xsd'), '<schema/>');
    await writeFile(join(root, 'contract.wsdl'), wsdl('../secret.xsd'));
    const result = await validateLocalContract(join(root, 'contract.wsdl'));
    expect(result.diagnostics.some(d => d.code === 'OUTSIDE_ROOT')).toBe(true);
  });
  it('blocks symlink escapes', async () => {
    const parent = await fixture();
    const root = join(parent, 'allowed');
    await mkdir(root);
    await writeFile(join(parent, 'secret.xsd'), '<schema/>');
    await symlink(join(parent, 'secret.xsd'), join(root, 'link.xsd'));
    await writeFile(join(root, 'contract.wsdl'), wsdl('link.xsd'));
    const result = await validateLocalContract(join(root, 'contract.wsdl'));
    expect(result.diagnostics.some(d => d.code === 'OUTSIDE_ROOT')).toBe(true);
  });
  it('rejects invalid XML and DTD declarations', async () => {
    const root = await fixture();
    const file = join(root, 'contract.wsdl');
    await writeFile(file, '<definitions>');
    expect((await validateLocalContract(file)).valid).toBe(false);
    await writeFile(file, '<!DOCTYPE definitions [<!ENTITY x "hello">]><definitions/>');
    expect((await validateLocalContract(file)).diagnostics.some(d => d.code === 'DTD_NOT_ALLOWED')).toBe(true);
  });
  it('does not recurse forever for cyclic imports', async () => {
    const root = await fixture();
    await writeFile(join(root, 'contract.wsdl'), wsdl('types.xsd'));
    await writeFile(join(root, 'types.xsd'), '<schema><include schemaLocation="contract.wsdl"/></schema>');
    const result = await validateLocalContract(join(root, 'contract.wsdl'));
    expect(result.valid).toBe(true);
    expect(result.files).toHaveLength(2);
  });
});
