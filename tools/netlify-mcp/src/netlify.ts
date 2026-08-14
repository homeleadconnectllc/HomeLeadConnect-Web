const API_BASE = "https://api.netlify.com/api/v1";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function configuredSiteId(): string {
  return required("NETLIFY_SITE_ID");
}

async function netlify<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = required("NETLIFY_AUTH_TOKEN");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || `${response.status} ${response.statusText}`;
    throw new Error(`Netlify API error: ${message}`);
  }
  return payload as T;
}

export type NetlifySite = {
  id: string;
  name: string;
  url?: string;
  ssl_url?: string;
  admin_url?: string;
  build_settings?: {
    repo_branch?: string;
    repo_url?: string;
  };
};

export type NetlifyDeploy = {
  id: string;
  site_id: string;
  state: string;
  branch?: string;
  context?: string;
  commit_ref?: string;
  deploy_ssl_url?: string;
  review_url?: string;
  admin_url?: string;
  error_message?: string;
  created_at?: string;
  published_at?: string;
};

export async function getSite(): Promise<NetlifySite> {
  return netlify<NetlifySite>(`/sites/${encodeURIComponent(configuredSiteId())}`);
}

export async function listDeploys(branch?: string, perPage = 10): Promise<NetlifyDeploy[]> {
  const qs = new URLSearchParams({ per_page: String(Math.min(Math.max(perPage, 1), 50)) });
  if (branch) qs.set("branch", branch);
  return netlify<NetlifyDeploy[]>(`/sites/${encodeURIComponent(configuredSiteId())}/deploys?${qs}`);
}

export async function getDeploy(deployId: string): Promise<NetlifyDeploy> {
  return netlify<NetlifyDeploy>(`/sites/${encodeURIComponent(configuredSiteId())}/deploys/${encodeURIComponent(deployId)}`);
}

export async function listDeployedBranches(): Promise<Array<{ id: string; deploy_id: string; name: string; slug: string; url?: string; ssl_url?: string }>> {
  return netlify(`/sites/${encodeURIComponent(configuredSiteId())}/deployed-branches`);
}

export async function triggerBranchBuild(branch: string, clearCache = false): Promise<{ id: string; deploy_id: string; sha?: string; done?: boolean; error?: string }>{
  const cleanBranch = branch.trim();
  if (!cleanBranch) throw new Error("branch is required");

  const site = await getSite();
  const productionBranch = site.build_settings?.repo_branch || "main";
  const allowProduction = process.env.ALLOW_PRODUCTION_ACTIONS === "true";
  if (!allowProduction && cleanBranch === productionBranch) {
    throw new Error(`Refusing production build for '${cleanBranch}'. Set ALLOW_PRODUCTION_ACTIONS=true only for an explicitly reviewed production action.`);
  }

  const qs = new URLSearchParams({
    branch: cleanBranch,
    clear_cache: String(clearCache),
    title: `HLC MCP branch build: ${cleanBranch}`,
  });
  return netlify(`/sites/${encodeURIComponent(configuredSiteId())}/builds?${qs}`, {
    method: "POST",
  });
}

export async function cancelDeploy(deployId: string): Promise<NetlifyDeploy> {
  return netlify<NetlifyDeploy>(`/deploys/${encodeURIComponent(deployId)}/cancel`, { method: "POST" });
}
