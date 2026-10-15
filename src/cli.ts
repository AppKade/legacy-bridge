#!/usr/bin/env node
import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inspectWsdl } from './wsdl.js';

const program = new Command();
program.name('legacy-bridge').description('Inspect legacy service contracts and prepare modern adapters')
  .version('0.1.0');

program.command('inspect')
  .description('Inspect a local WSDL document without accessing the network')
  .argument('<file>', 'Local .wsdl file')
  .option('--json', 'Print machine-readable JSON')
  .action(async (file: string, options: { json?: boolean }) => {
    try {
      const result = inspectWsdl(await readFile(resolve(file), 'utf8'));
      if (options.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`Service: ${result.service ?? '(unknown)'}`);
        console.log(`Namespace: ${result.targetNamespace ?? '(unknown)'}`);
        for (const port of result.portTypes) {
          console.log(`Port type: ${port.name}`);
          for (const op of port.operations) console.log(`  - ${op.name}`);
        }
        for (const warning of result.warnings) console.warn(`Warning: ${warning}`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
