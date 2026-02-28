---
phase: 6
plan: fix-mcp-server-context
wave: 1
gap_closure: true
---

# Fix Plan: MCP Server Context Error

## Problem
Currently, J1 and J3 headless services (`lead-service.ts`, `credit-service.ts`) invoke `getInsforgeServer()` which relies on the `@insforge/nextjs` adapter mapped to Next.js `headers()` and `cookies()`. When the MCP server (`src/mcp/server.ts`) executes in a standalone `stdio` Node process, accessing Next.js headers throws an `ERR_PACKAGE_PATH_NOT_EXPORTED` error, crashing the MCP server.

## Tasks

<task type="auto">
  <name>Refactor Services to use Client Context</name>
  <files>src/services/lead-service.ts, src/services/credit-service.ts</files>
  <action>
    - Replace `getInsforgeServer()` with `insforge` from `@/lib/insforge-client` inside both service files.
    - Since Auth/RBAC logic is deferred, the `anon` key used by the client is completely sufficient for all backend operations (due to allow-all RLS).
  </action>
  <verify>grep -q "lib/insforge-client" src/services/lead-service.ts</verify>
  <done>No service relies on `next/headers`</done>
</task>

<task type="auto">
  <name>Verify Server Startup</name>
  <files>src/mcp/server.ts</files>
  <action>
    - Run `npx tsx src/mcp/server.ts` to ensure it boots on `stdio` without throwing context or export path errors.
  </action>
  <verify>npx tsx src/mcp/server.ts</verify>
  <done>Server runs cleanly</done>
</task>
