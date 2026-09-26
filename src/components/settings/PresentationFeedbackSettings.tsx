import { useState } from "react";
import {
  defaultPresentationFeedbackPreferences,
  loadPresentationFeedbackPreferences,
  savePresentationFeedbackPreferences,
  type PresentationFeedbackPreferences,
} from "../../lib/presentationFeedback";

export default function PresentationFeedbackSettings() {
  const [preferences, setPreferences] = useState<PresentationFeedbackPreferences>(() => loadPresentationFeedbackPreferences());
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<PresentationFeedbackPreferences>) {
    setSaved(false);
    setPreferences((current) => ({ ...current, ...patch }));
  }

  function save() {
    savePresentationFeedbackPreferences(preferences);
    setSaved(true);
  }

  return <div className="hlc-presentation-feedback-settings">
    <label className="hlc-setting-toggle"><input type="checkbox" checked={preferences.enabled} onChange={(event) => update({ enabled: event.target.checked })}/><span><strong>Interface sounds</strong><small>Play short feedback tones after the app reports progress, success, attention, or failure. Sounds never determine or replace workflow state.</small></span></label>
    <label className="hlc-setting-toggle"><input type="checkbox" checked={preferences.quietHoursEnabled} onChange={(event) => update({ quietHoursEnabled: event.target.checked })}/><span><strong>Quiet hours</strong><small>Silence presentation sounds during the device-local window below. Communication business-hour rules remain separate workflow policy.</small></span></label>
    <div className="hlc-setting-time-grid">
      <label>Quiet hours start<input type="time" value={preferences.quietHoursStart} disabled={!preferences.quietHoursEnabled} onChange={(event) => update({ quietHoursStart: event.target.value })}/></label>
      <label>Quiet hours end<input type="time" value={preferences.quietHoursEnd} disabled={!preferences.quietHoursEnabled} onChange={(event) => update({ quietHoursEnd: event.target.value })}/></label>
    </div>
    <div className="hlc-account-form-actions"><button type="button" onClick={save}>Save sound preferences</button><button type="button" onClick={() => update(defaultPresentationFeedbackPreferences)}>Restore defaults</button></div>
    {saved && <p role="status" data-tone="success">Sound preferences saved.</p>}
  </div>;
}
