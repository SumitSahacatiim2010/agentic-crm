---
phase: 6
plan: 2
wave: 2
---

# Plan 6.2: MCP Tools Server Layer

## Objective
Expose the headless microservices from Plan 6.1 as a set of standardized tools via the Model Context Protocol (MCP) so that AI agents (developed in Phase 7) can reason about and execute J1/J2/J3 journey steps.

## Context
- `src/services/` (Created in Plan 6.1)
- MCP SDK documentation

## Tasks

<task type="auto">
  <name>Build the MCP Server Harness</name>
  <files>src/mcp/server.ts, src/mcp/manifest.json</files>
  <action>
    - Initialize a local MCP server setup in `src/mcp/` using `@modelcontextprotocol/sdk`.
    - Create a structured `manifest.json` describing the capabilities of the J1/J2/J3 toolkit.
    - Set up the basic express or standardized IO transport layer that agents will connect to.
  </action>
  <verify>test -f src/mcp/server.ts && echo "Server harness exists"</verify>
  <done>An MCP server instance can be started that hosts the tools</done>
</task>

<task type="auto">
  <name>Expose Journey Operations as MCP Tools</name>
  <files>src/mcp/tools.ts, src/mcp/server.ts</files>
  <action>
    - Define JSON schemas (Zod or plain JSON Schema) for tool inputs (e.g., `IngestLeadSchema`, `SubmitCreditSchema`).
    - Register MCP tools using the SDK: `mcp_bankingcrm_ingest-lead`, `mcp_bankingcrm_convert-opportunity`, `mcp_bankingcrm_complete-onboarding`.
    - Map each MCP tool execution directly to the corresponding service function created in 6.1.
    - Implement rigorous error handling so tool failures return descriptive errors instead of crashing the server.
  </action>
  <verify>grep -A 5 "registerTool" src/mcp/tools.ts</verify>
  <done>All core operations are registered as typed tools with predictable outputs</done>
</task>

## Success Criteria
- [ ] AI agents can invoke `.mcp_bankingcrm_ingest-lead` with appropriate parameters
- [ ] J1, J2, and J3 journeys can be executed entirely via MCP tool calls without browser automation
- [ ] Structured errors are returned for missing BANT data or invalid IDs
