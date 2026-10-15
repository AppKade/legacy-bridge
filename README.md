<div align="center">

# Legacy Bridge

**Modernize legacy service integrations, one contract at a time.**

An offline-first, open-source developer toolkit for exploring SOAP/WSDL contracts and building toward reviewable MCP and modern API adapters.

[![CI](https://github.com/AppKade/legacy-bridge/actions/workflows/ci.yml/badge.svg)](https://github.com/AppKade/legacy-bridge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](package.json)
[![Status: Early Development](https://img.shields.io/badge/status-early%20development-orange)](docs/roadmap.md)

[Quick start](#quick-start) · [What works today](#what-works-today) · [Roadmap](#roadmap) · [Contributing](#contributing) · [Security](#security)

</div>

---

> [!IMPORTANT]
> **Early development (v0.1 scaffold).** The working command is `inspect`, which lists WSDL 1.1 services, port types and operation names from a local file. Preliminary local import checks are available, but full WSDL/XSD semantic validation, SOAP execution, and MCP/REST generation are **not implemented yet**. This is not ready for production integrations.

## Why Legacy Bridge?

SOAP-based systems are still common, yet their service contracts can be cumbersome to inspect and adapt for newer applications. Legacy Bridge aims to let developers work from an existing contract, see exactly what was discovered, review generated integrations, and control what may execute.

**Design goals**

- **Local-first:** inspect contracts without sending them to a hosted service.
- **Transparent:** prefer readable generated source code over opaque proxy layers.
- **Safe by default:** future adapters must explicitly allow operations and protect secrets.
- **Composable:** MCP is a planned output, not the only possible integration target.
- **Developer-focused:** predictable CLI commands, structured diagnostics, and testable fixtures.

## What works today

| Capability | Status |
| --- | --- |
| Local WSDL 1.1 operation inventory | ✅ Initial implementation |
| Human-readable and JSON CLI output | ✅ Initial implementation |
| Basic malformed-XML detection | ✅ Initial implementation |
| Automated tests and CI workflow | ✅ Configured; check CI results |
| Preliminary local WSDL/XML and import checks | ✅ Initial implementation |
| Complete WSDL and XSD semantic validation | 📋 Planned |
| Local import and schema resolution | 📋 Planned |
| SOAP binding and type analysis | 📋 Planned |
| Generated TypeScript MCP server | 📋 Planned |
| REST/OpenAPI generation | 📋 Later phase |

The inspector and validator are deliberately limited. Validation currently checks XML well-formedness, file boundaries, blocked remote references, and recursive local imports. It does not verify WSDL type semantics. The inspector is deliberately limited. It does not resolve imports, validate SOAP bindings, classify operations by side effect, or contact SOAP endpoints.

## Quick start

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/AppKade/legacy-bridge.git
cd legacy-bridge
npm install
```

Inspect the included sample WSDL:

```bash
npm run dev -- inspect examples/inventory.wsdl
```

Example output:

```text
Service: InventoryService
Namespace: urn:inventory
Port type: InventoryPort
  - GetItem
Warning: Preview inventory only: imports, type resolution, SOAP bindings and security policies are not validated.
```

Get machine-readable JSON:

```bash
npm run dev -- inspect examples/inventory.wsdl --json
npm run dev -- validate examples/inventory.wsdl --json
```

Run local checks:

```bash
npm run typecheck
npm test
npm run build
```

The CLI is not yet published to npm. Run it from this repository using `npm run dev --` or build the project locally.

## CLI reference

### Available

| Command | Purpose |
| --- | --- |
| `inspect <file>` | Display a basic inventory of WSDL 1.1 operations |
| `inspect <file> --json` | Emit that inventory as JSON |
| `validate <file>` | Preliminary local XML/import validation |
| `validate <file> --root <dir> --json` | Restrict import traversal to a directory and emit diagnostics |
| `--help` | Show CLI usage |
| `--version` | Display the current package version |

### Proposed, not yet available

```bash
# Generate a reviewable MCP adapter
legacy-bridge generate service.wsdl --target mcp --language typescript --read-only

# Exercise generated code against test fixtures
legacy-bridge test ./generated
```

Command syntax above is a proposal and may change as the design matures.

## How it is intended to work

```text
       WSDL + XSD
           |
           v
  Contract parsing & validation
           |
           v
    Normalized service model
           |
           v
   Explicit operation policies
           |
           v
   Source code generation
           |
      +----+----+
      |         |
      v         v
    MCP       REST/OpenAPI
   adapter     adapter
      |         |
      +----+----+
           |
           v
  Authorized SOAP service
```

Only basic WSDL inventory is implemented. The remaining stages describe the intended architecture, not existing functionality.

## Roadmap

- **Foundation:** benchmark existing solutions, improve WSDL/XSD parsing and diagnostics, build reproducible contract fixtures.
- **MCP MVP:** generate TypeScript MCP servers, support SOAP runtime calls, require explicit operation policies and safe secret injection.
- **Extended adapters:** add REST/OpenAPI output, wider SOAP compatibility, optional assisted descriptions.
- **Production readiness:** security hardening, audit hooks, compatibility suites, and deployment guidance.

Track details in the [roadmap](docs/roadmap.md) and [requirements](docs/requirements.md).

## Documentation

| Document | Description |
| --- | --- |
| [Requirements](docs/requirements.md) | Scope, non-goals, and acceptance criteria |
| [Architecture](docs/architecture.md) | Module boundaries and proposed generation pipeline |
| [Security model](docs/security.md) | Trust boundaries and safety requirements |
| [Roadmap](docs/roadmap.md) | Phased implementation plan |
| [Contributing](CONTRIBUTING.md) | How to contribute |

## Contributing

Contributions, test fixtures, bug reports, and technical discussions are welcome.

1. Check [existing issues](https://github.com/AppKade/legacy-bridge/issues).
2. For bugs, include a **sanitized** WSDL/XSD sample, expected behavior, and actual behavior.
3. Make focused changes and run `npm run typecheck`, `npm test`, and `npm run build`.
4. Open a [pull request](https://github.com/AppKade/legacy-bridge/pulls) with the change and its tests.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes. Never publish credentials or confidential service contracts.

## Security

Service contracts and upstream endpoints must be treated as untrusted input. Legacy Bridge's target design favors offline execution, explicit allowlists, credential isolation, and deny-by-default behavior for potentially mutating operations.

The current inspector does not deliberately fetch remote imports, but it has **not** undergone a security audit and must not be treated as a hardened parser for arbitrary hostile inputs.

See [security requirements](docs/security.md). For sensitive findings, avoid public issue disclosures until a private reporting process is established.

## License

Distributed under the [MIT License](LICENSE).

---

<div align="center">

Built and maintained by <a href="https://github.com/AppKade">AppKade</a> and contributors.

⭐ If you find the direction useful, star the project and help shape its roadmap.

</div>
