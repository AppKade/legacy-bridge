# Product requirements (draft v0.1)

## Vision

Help developers understand, validate, and modernize legacy service interfaces, while retaining control over execution, authentication, and the generated source code.

## Target users

Backend engineers, platform teams, integration developers, and maintainers of SOAP-based systems. The tool is domain-neutral.

## MVP scope (Phase 1)

- R1: Inspect local WSDL 1.1 files and report services, port types, operations, messages and target namespaces.
- R2: Validate WSDL 1.1 syntax, dependencies, XSD imports and references; produce structured diagnostics with file/line context where possible.
- R3: Support multi-file local imports with explicit root directory boundaries. Remote schema resolution must be explicitly enabled with a host allowlist.
- R4: Generate an editable TypeScript MCP server with operations exposed as tools. Names and schemas should be deterministic and collision-safe.
- R5: Resolve SOAP 1.1/1.2 binding metadata and map XML types into typed input/output contracts, reporting unsupported constructs rather than silently guessing.
- R6: Provide per-operation allowlists and default-deny treatment for any operation with unverified side effects. Names like Get/Read are not proof of safety.
- R7: Read credentials from injected environment or secret stores; never embed credentials in generated code or log request secrets.
- R8: Provide local mock fixtures and generated tests, plus clear documentation and reproducible builds.
- R9: Structured CLI output and stable nonzero exit codes on errors.
- R10: Operate offline by default; never transmit schemas to third parties.

## Next phases (not MVP)

- REST/OpenAPI generator and optional GraphQL adapter.
- Authentication strategies including WS-Security, mTLS, and token-based gateways.
- Compatibility reports and golden-file regression testing for real contracts.
- Optional AI-assisted human review of generated tool names/descriptions. AI must be disabled by default.
- Safe deployment templates and enterprise audit/event hooks.

## Non-goals for the MVP

- Universal SOAP protocol support.
- Automatic access to systems without authorization.
- Guaranteed conversion of arbitrary complex XSD/WSDL contracts.
- Silent execution of state-changing operations.
- A hosted SaaS service or payment integration.

## Acceptance criteria for initial milestone

1. `inspect` extracts WSDL 1.1 port types and operation names from a valid local sample.
2. Malformed XML and documents lacking WSDL roots produce nonzero exits.
3. No network requests are made during inspection.
4. Unit tests and TypeScript checks pass in CI.
5. Documentation accurately distinguishes implemented from planned features.

## Acceptance criteria for first generator milestone

1. A WSDL 1.1 document with local XSD imports generates an MCP server that builds without manual patches.
2. Every generated tool's request arguments validate against derived schemas.
3. SOAP fault cases return safe, structured errors without exposing credentials.
4. Unapproved operations are unavailable by default.
5. Golden contract fixtures and integration tests pass for supported SOAP 1.1/1.2 bindings.
