import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import {
  cancelDeploy,
  getDeploy,
  getSite,
  listDeployedBranches,
  listDeploys,
  triggerBranchBuild,
} from "../src/netlify.js";

type VercelRequest = IncomingMessage & { body?: unknown; method?: string; headers: IncomingMessage["headers"] };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (body: unknown) => void };

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function buildServer() {
  const server = new McpServer({
    name: "hlc-netlify-control",
    version: "0.1.0",
  });

  server.tool(
    "netlify_get_site",
    "Use this when you need the configured HomeLead Connect Netlify site's identity, URLs, repository, or production branch. Read-only.",
    {},
    async () => text(await getSite()),
  );

  server.tool(
    "netlify_list_deploys",
    "Use this when you need recent Netlify deploys for the configured HLC site, optionally filtered by branch. Read-only.",
    {
      branch: z.string().min(1).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    async ({ branch, limit }) => text(await listDeploys(branch, limit ?? 10)),
  );

  server.tool(
    "netlify_get_deploy",
    "Use this when you need the exact state, URL, branch, commit, or error for one HLC Netlify deploy. Read-only.",
    { deployId: z.string().min(1) },
    async ({ deployId }) => text(await getDeploy(deployId)),
  );

  server.tool(
    "netlify_list_deployed_branches",
    "Use this when you need the currently deployed branch URLs for the configured HLC site. Read-only.",
    {},
    async () => text(await listDeployedBranches()),
  );

  server.tool(
    "netlify_trigger_branch_build",
    "Use this when an explicitly requested non-production HLC branch needs a Netlify branch build. The server refuses the site's production branch unless ALLOW_PRODUCTION_ACTIONS=true is deliberately configured.",
    {
      branch: z.string().min(1),
      clearCache: z.boolean().optional(),
    },
    async ({ branch, clearCache }) => text(await triggerBranchBuild(branch, clearCache ?? false)),
  );

  server.tool(
    "netlify_cancel_deploy",
    "Use this when the user explicitly asks to stop a specific in-progress HLC Netlify deploy. This changes deploy state but does not publish production.",
    { deployId: z.string().min(1) },
    async ({ deployId }) => text(await cancelDeploy(deployId)),
  );

  return server;
}

function authorized(req: VercelRequest): boolean {
  const secret = process.env.MCP_SHARED_SECRET?.trim();
  if (!secret) return true;
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET" && req.url?.endsWith("/health")) {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, service: "hlc-netlify-control" }));
    return;
  }

  if (!authorized(req)) {
    res.statusCode = 401;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "unauthorized" }));
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
