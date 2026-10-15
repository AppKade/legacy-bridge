# Roadmap

## Stage 0: Benchmark and specifications

- [ ] Evaluate existing SOAP-to-MCP and WSDL-to-OpenAPI projects against a published fixture corpus.
- [ ] Define supported WSDL versions, SOAP bindings, XSD constructs and error semantics.
- [ ] Establish security threat model and compatibility matrix.

## Stage 1: Developer toolkit MVP

- [x] CLI scaffold, README and initial local WSDL operation inventory.
- [x] Unit test scaffold and CI definition.
- [ ] Complete WSDL 1.1/XSD semantic resolver.
- [x] Preliminary local XML/import validation with structured diagnostics.
- [ ] Full WSDL/XSD semantic validation and actionable diagnostics.
- [ ] Deterministic TypeScript MCP server generation.
- [ ] Runtime SOAP client with local mock fixtures.
- [ ] Safe operation allowlisting and auth injection.
- [ ] Generator and integration test coverage, documentation, examples.
- [ ] Publish pre-release npm package after acceptance review.

## Stage 2: Extended integrations

- [ ] REST/OpenAPI output and compatibility report.
- [ ] Broader SOAP binding and WS-Security support.
- [ ] Configurable templates and deployment guides.
- [ ] Optional reviewed AI-assisted schema/tool descriptions.

## Stage 3: Production readiness

- [ ] Auth and audit integrations, observability and policy enforcement.
- [ ] Supported-version compatibility suites and release governance.
- [ ] Pilot deployments with opt-in customers and published limits.

Every milestone should be benchmarked against existing projects. Do not implement features solely to replicate mature alternatives.
