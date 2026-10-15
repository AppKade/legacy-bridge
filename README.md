# Legacy Bridge

An open-source, offline-first toolkit for modernizing integrations with legacy service contracts. The long-term goal is to inspect SOAP/WSDL contracts, generate reviewable MCP adapters, and optionally generate REST/OpenAPI interfaces.

> **Status: early scaffold.** The only working feature today is a local WSDL 1.1 operation inventory. No MCP server, REST endpoint, SOAP runtime, or adapter generation is implemented yet.

## Why?

Existing SOAP services are often inconvenient to explore, test, and expose to newer integration clients. Legacy Bridge aims to provide transparent, local-first tooling with explicit security controls and portable generated code.

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run dev -- inspect ./examples/inventory.wsdl
npm run dev -- inspect ./examples/inventory.wsdl --json
npm run typecheck
npm test
npm run build
```

## Planned CLI interface (not implemented)

```bash
legacy-bridge validate service.wsdl
legacy-bridge generate service.wsdl --target mcp --language typescript --read-only
legacy-bridge test ./generated
```

See [requirements](docs/requirements.md), [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [security model](docs/security.md).

## Security principles

All imports and external references remain local by default. Generated tools will require explicit operation allowlists, safe credential handling, and an opt-in policy for operations with side effects. A WSDL file is untrusted input; do not assume its declared operations are safe.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT.
