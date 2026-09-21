export type SettingControlClass = "personal_preference" | "personal_operating" | "personal_privacy" | "controlled_rule";
export type SettingOwner = "personal" | "organization" | "hcx";
export type SettingScope = "device" | "personal_account" | "portal" | "organization" | "workspace" | "system";

export type SettingConstraint<T> = {
  value: T;
  reason?: string;
};

export type EffectiveSettingInput<T> = {
  key: string;
  controlClass: SettingControlClass;
  scope: SettingScope;
  system?: SettingConstraint<T>;
  organization?: SettingConstraint<T>;
  roleAllowed: boolean;
  entitlementAllowed: boolean;
  contextAllowed: boolean;
  personal?: T;
  defaultValue: T;
};

export type EffectiveSetting<T> = {
  key: string;
  value: T;
  source: "system" | "organization" | "personal" | "default";
  owner: SettingOwner;
  editable: boolean;
  reason: string | null;
  scope: SettingScope;
  controlClass: SettingControlClass;
};

export function resolveEffectiveSetting<T>(input: EffectiveSettingInput<T>): EffectiveSetting<T> {
  const base = { key: input.key, scope: input.scope, controlClass: input.controlClass };

  if (input.system) return { ...base, value: input.system.value, source: "system", owner: "hcx", editable: false, reason: input.system.reason || "Managed by HomeLead Connect." };
  if (input.organization) return { ...base, value: input.organization.value, source: "organization", owner: "organization", editable: false, reason: input.organization.reason || "Managed by your organization." };

  if (!input.roleAllowed) return { ...base, value: input.defaultValue, source: "default", owner: "hcx", editable: false, reason: "Your role does not allow this setting." };
  if (!input.entitlementAllowed) return { ...base, value: input.defaultValue, source: "default", owner: "hcx", editable: false, reason: "This setting is not included in the current entitlement." };
  if (!input.contextAllowed) return { ...base, value: input.defaultValue, source: "default", owner: "hcx", editable: false, reason: "This setting is unavailable in the current portal or workspace." };
  if (input.controlClass === "controlled_rule") return { ...base, value: input.defaultValue, source: "default", owner: "hcx", editable: false, reason: "This setting is controlled by HomeLead Connect policy." };

  if (input.personal !== undefined) return { ...base, value: input.personal, source: "personal", owner: "personal", editable: true, reason: null };
  return { ...base, value: input.defaultValue, source: "default", owner: "personal", editable: true, reason: null };
}
