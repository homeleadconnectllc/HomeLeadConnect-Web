# HLC Netlify MCP

Private, tool-only MCP server for HomeLead Connect Netlify operations.

## Purpose

This server gives ChatGPT a narrow Netlify control surface without exposing the Netlify token to the browser app. It is intentionally locked to one site through `NETLIFY_SITE_ID`.

Available tools:

- `netlify_get_site` — read configured site metadata and production branch
- `netlify_list_deploys` — read recent deploys, optionally by branch
- `netlify_get_deploy` — read one deploy's state, URL, commit, and error
- `netlify_list_deployed_branches` — read branch deployment URLs
- `netlify_trigger_branch_build` — trigger a non-production branch build
- `netlify_cancel_deploy` — cancel an explicitly identified deploy

## Safety boundary

`ALLOW_PRODUCTION_ACTIONS` defaults to false. In that mode, `netlify_trigger_branch_build` fetches the site's configured production branch and refuses to build that branch. Keep this false for normal HLC completion work.

The server does not expose tools for deleting the site, changing DNS, revealing environment variable values, restoring an old deploy to production, or publishing a deploy.

## Required secrets

Create these in the hosting platform's server-side environment settings. Do not commit them and do not put them in `VITE_*` variables.

- `NETLIFY_AUTH_TOKEN` — Netlify personal access token
- `NETLIFY_SITE_ID` — immutable site ID for the HLC site (`glittery-pavlova-0f33bd` is the project name; obtain the site ID from Netlify)
- `MCP_SHARED_SECRET` — optional bearer secret protecting `/mcp`
- `ALLOW_PRODUCTION_ACTIONS=false`

## Deploy on Vercel

Create a Vercel project with this repository and set **Root Directory** to:

`tools/netlify-mcp`

Add the required environment variables, then deploy. The MCP endpoint will be:

`https://<deployment-host>/mcp`

Health check:

`https://<deployment-host>/health`

## Connect to ChatGPT

Create a private/custom MCP app using the deployed `/mcp` endpoint. If `MCP_SHARED_SECRET` is configured, send it as `Authorization: Bearer <secret>` through the connection's supported authentication mechanism.

For write actions, keep ChatGPT approvals enabled unless you deliberately choose a broader permission mode. The server's own production-branch interlock remains independent of ChatGPT approval settings.

## Immediate HLC use case

Once connected, the intended command is equivalent to:

`Trigger a Netlify branch build for agent/functional-completion on the configured HLC site. Do not publish production.`

The MCP server will refuse the site's production branch while `ALLOW_PRODUCTION_ACTIONS=false`.

## API basis

The implementation uses Netlify's authenticated REST API for site metadata, deploys, deployed branches, branch builds, and deploy cancellation. Netlify documents branch builds through `POST /sites/{site_id}/builds?branch=...`; a non-main branch is treated as a branch deploy.
