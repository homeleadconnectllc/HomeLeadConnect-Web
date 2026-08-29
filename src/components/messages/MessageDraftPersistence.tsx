import { useEffect } from "react";

const PREFIX = "hlc:messages:draft:";

type DraftField = HTMLTextAreaElement | HTMLInputElement;

function setNativeValue(field: DraftField, value: string) {
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

function draftKey(field: DraftField) {
  if (window.location.pathname !== "/messages") return null;
  if (field.closest(".hlc-message-quick-compose")) {
    if (field instanceof HTMLTextAreaElement) return `${PREFIX}new-body`;
    if (field.closest(".hlc-message-subject-details")) return `${PREFIX}new-subject`;
  }
  if (field.closest(".hlc-message-composer")) {
    const subject = document.querySelector(".hlc-message-thread-head h2")?.textContent?.trim() || "selected-conversation";
    return `${PREFIX}reply:${encodeURIComponent(subject)}`;
  }
  return null;
}

function isDraftField(target: EventTarget | null): target is DraftField {
  return target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && target.type === "text");
}

export default function MessageDraftPersistence() {
  useEffect(() => {
    const restore = (event: FocusEvent) => {
      if (!isDraftField(event.target) || event.target.value) return;
      const key = draftKey(event.target);
      if (!key) return;
      const saved = sessionStorage.getItem(key);
      if (saved) setNativeValue(event.target, saved);
    };

    const persist = (event: Event) => {
      if (!isDraftField(event.target)) return;
      const key = draftKey(event.target);
      if (!key) return;
      if (event.target.value) sessionStorage.setItem(key, event.target.value);
      else sessionStorage.removeItem(key);
    };

    const clearAfterSuccessfulSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.closest(".hlc-messages-workspace")) return;
      window.setTimeout(() => {
        form.querySelectorAll<DraftField>("textarea, input[type='text']").forEach((field) => {
          const key = draftKey(field);
          if (key && !field.value) sessionStorage.removeItem(key);
        });
      }, 250);
    };

    document.addEventListener("focusin", restore);
    document.addEventListener("input", persist);
    document.addEventListener("submit", clearAfterSuccessfulSubmit);
    return () => {
      document.removeEventListener("focusin", restore);
      document.removeEventListener("input", persist);
      document.removeEventListener("submit", clearAfterSuccessfulSubmit);
    };
  }, []);

  return null;
}
