import { useEffect, useState, type FormEvent } from "react";
import {
  defaultCommunicationActionPolicy,
  getCommunicationActionPolicy,
  saveCommunicationActionPolicy,
} from "../../api/communicationPolicies";
import { errorMessage } from "../../lib/errorMessage";

const days = [
  [1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"], [0, "Sun"],
] as const;

type Props = { workspaceId: string; canManage: boolean };

export default function CommunicationPolicySettings({ workspaceId, canManage }: Props) {
  const [policy, setPolicy] = useState(defaultCommunicationActionPolicy);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCommunicationActionPolicy(workspaceId)
      .then((value) => {
        if (!active || !value) return;
        setPolicy({
          timezone: value.timezone,
          business_days: value.business_days,
          business_start: value.business_start.slice(0, 5),
          business_end: value.business_end.slice(0, 5),
          quiet_start: value.quiet_start.slice(0, 5),
          quiet_end: value.quiet_end.slice(0, 5),
        });
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Communication policy is not available in this environment.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workspaceId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!canManage) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await saveCommunicationActionPolicy(policy);
      setMessage("Communication hours saved. Every outbound attempt will evaluate this policy again at action time.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save communication hours."));
    } finally { setBusy(false); }
  }

  function toggleDay(day: number) {
    setPolicy((current) => ({
      ...current,
      business_days: current.business_days.includes(day)
        ? current.business_days.filter((value) => value !== day)
        : [...current.business_days, day].sort(),
    }));
  }

  return <form onSubmit={save} className="hlc-settings-section" aria-labelledby="communication-policy-heading">
    <div className="hlc-account-section-head"><div><span>ORGANIZATION</span><h2 id="communication-policy-heading">Communication hours</h2></div><small>Server enforced</small></div>
    <p>These workspace rules are checked when an outbound provider attempt starts—not only when it is drafted or queued. Personal preferences cannot weaken them.</p>
    {loading && <p role="status">Loading communication policy…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}
    {message && <p role="status" className="hlc-account-status is-success">{message}</p>}
    {!loading && !error && <>
      <div className="hlc-account-field-grid">
        <label>Policy timezone<input value={policy.timezone} onChange={(event) => setPolicy({ ...policy, timezone: event.target.value })} disabled={!canManage} /></label>
        <label>Business start<input type="time" value={policy.business_start} onChange={(event) => setPolicy({ ...policy, business_start: event.target.value })} disabled={!canManage} /></label>
        <label>Business end<input type="time" value={policy.business_end} onChange={(event) => setPolicy({ ...policy, business_end: event.target.value })} disabled={!canManage} /></label>
        <label>Quiet hours start<input type="time" value={policy.quiet_start} onChange={(event) => setPolicy({ ...policy, quiet_start: event.target.value })} disabled={!canManage} /></label>
        <label>Quiet hours end<input type="time" value={policy.quiet_end} onChange={(event) => setPolicy({ ...policy, quiet_end: event.target.value })} disabled={!canManage} /></label>
      </div>
      <fieldset><legend>Business days</legend><div className="hlc-account-inline-links">{days.map(([value, label]) => <label key={value}><input type="checkbox" checked={policy.business_days.includes(value)} onChange={() => toggleDay(value)} disabled={!canManage} /> {label}</label>)}</div></fieldset>
      <div className="hlc-account-form-actions"><span>{canManage ? "Owner/manager controlled. Quiet hours block; non-marketing work outside business hours requires review." : "Only an owner or manager can change organization communication hours."}</span>{canManage && <button disabled={busy || policy.business_days.length === 0} type="submit">{busy ? "Saving…" : "Save communication hours"}</button>}</div>
    </>}
  </form>;
}
