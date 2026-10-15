# Architecture (proposed)

`local contract -> parser -> dependency graph -> semantic model -> compatibility diagnostics -> policy manifest -> code generator -> MCP adapter`

The inspect command is a narrow, preliminary inventory and is **not** a complete semantic parser.

## Proposed packages

- `contracts`: WSDL 1.1, XSD import resolution, schema model and diagnostics.
- `policies`: permitted operations, endpoint allowlists, and side-effect classification.
- `generators/mcp-typescript`: deterministic source generator and runtime harness.
- `runtime/soap`: pluggable SOAP transport and fault normalization.
- `testkit`: local SOAP mock server, contract fixtures and snapshot checks.
- `cli`: command surface and structured output.

Keep a separation between **build-time contract interpretation** and **runtime SOAP execution**. Do not access target endpoints during generation except explicit, authorized test commands. Generated code must stay inspectable and maintainable without this CLI.

## Technology

Initial scaffold: Node.js 20+, TypeScript, Commander, fast-xml-parser and Vitest. Evaluate mature WSDL/XSD libraries and the official MCP TypeScript SDK before implementing code generation; lightweight XML parsing is insufficient for full WSDL semantics.
