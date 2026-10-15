# Security requirements

## Trust boundaries

Treat WSDL documents, imported XSDs, endpoint addresses and SOAP responses as untrusted input.

- Offline by default. Disable arbitrary URL fetches, external entities and DTD processing; bound file size, recursion and dependency count.
- Resolve local references only within configured permitted roots; reject path traversal and symlink escapes.
- If remote fetching is explicitly enabled: require protocol and hostname allowlists, reject loopback/private targets where unsuitable, restrict redirects, enforce response size and timeouts, and prevent SSRF.
- Generated MCP tools should use a deny-by-default operation policy. Distinguish read-only claims from verified non-mutating behavior.
- Demand explicit approval for operations with side effects. Do not infer authorization from a WSDL operation name.
- Keep SOAP credentials in runtime-provided secrets; redact authentication material and sensitive request/response payloads from logs.
- Support TLS verification, reasonable timeouts, retries only for explicitly idempotent operations, and fault normalization.
- Preserve upstream authorization. An MCP adapter must not expand privileges beyond the original service account.
- Include a threat-model review before enabling network calls or shipping an executable generator.

The current preview inspector does not resolve references or initiate network operations. Full XML parser hardening and resource limits remain necessary before processing untrusted contracts at scale.
