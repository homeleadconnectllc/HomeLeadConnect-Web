import { useEffect, useMemo, useState } from "react";

type EditableField = HTMLInputElement | HTMLTextAreaElement;

const BASE_SUGGESTIONS = [
  "Thank you for the update.",
  "I’ll follow up with the next step.",
  "Please let me know what time works best.",
];

const ROUTE_SUGGESTIONS: Array<{ match: RegExp; suggestions: string[] }> = [
  { match: /messages|manual-communications|call-center/, suggestions: ["Thanks for speaking with me today.", "I’m following up on your HomeLead Connect request.", "What time works best for a quick follow-up?"] },
  { match: /leads|estimator|matching/, suggestions: ["The next step is to confirm the service details.", "I’m reviewing the information we have so far.", "Please share any photos or details that may help."] },
  { match: /calendar|follow-ups/, suggestions: ["I’m confirming the appointment details.", "Please confirm that this time still works for you.", "I’ll follow up again if anything changes."] },
  { match: /jobs|contractor|provider/, suggestions: ["The job record has been updated.", "Please confirm the next operational step.", "I’ll keep the job history updated as we proceed."] },
  { match: /community|review|referral/, suggestions: ["Thank you for sharing your experience.", "We appreciate the feedback.", "Please let us know if there is anything else we can help with."] },
];

function isEligibleField(target: EventTarget | null): target is EditableField {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
  if (target.disabled || target.readOnly) return false;
  if (target.closest("[data-smart-compose='off'], [role='dialog'][data-smart-compose='off']")) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  const type = (target.type || "text").toLowerCase();
  return type === "text";
}

function suggestionsFor(pathname: string, value: string) {
  const route = ROUTE_SUGGESTIONS.find((entry) => entry.match.test(pathname));
  const suggestions = route?.suggestions ?? BASE_SUGGESTIONS;
  const normalized = value.trim().toLowerCase();
  return suggestions.filter((suggestion) => !normalized.endsWith(suggestion.toLowerCase())).slice(0, 3);
}

function setFieldValue(field: EditableField, value: string) {
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.focus();
}

export default function GlobalSmartCompose() {
  const [field, setField] = useState<EditableField | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      if (!isEligibleField(event.target)) {
        setField(null);
        return;
      }
      setField(event.target);
      setValue(event.target.value);
    };
    const onInput = (event: Event) => {
      if (!isEligibleField(event.target)) return;
      setField(event.target);
      setValue(event.target.value);
    };
    const onBlur = (event: FocusEvent) => {
      if (!isEligibleField(event.target)) return;
      window.setTimeout(() => {
        const active = document.activeElement;
        if (!active?.closest?.(".hlc-smart-compose")) setField(null);
      }, 120);
    };

    document.addEventListener("focusin", onFocus);
    document.addEventListener("input", onInput);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("input", onInput);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  const suggestions = useMemo(() => suggestionsFor(window.location.pathname, value), [value]);
  if (!field || suggestions.length === 0) return null;

  function applySuggestion(suggestion: string) {
    if (!field) return;
    const current = field.value.trimEnd();
    const separator = current.length === 0 ? "" : /[.!?]$/.test(current) ? " " : ". ";
    setFieldValue(field, `${current}${separator}${suggestion}`);
    setValue(field.value);
  }

  return (
    <aside className="hlc-smart-compose" aria-label="HLC Smart Compose suggestions" data-hlc-smart-compose="global">
      <span className="hlc-smart-compose__label">Smart Compose</span>
      <div className="hlc-smart-compose__suggestions">
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} onMouseDown={(event) => event.preventDefault()} onClick={() => applySuggestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </aside>
  );
}
