import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function visibleFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) =>
    element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0,
  );
}

export default function MobileNavigationDialogAccessibility() {
  useEffect(() => {
    let activeDialog: HTMLElement | null = null;
    let previousFocus: HTMLElement | null = null;
    let focusFrame = 0;

    const restoreFocus = () => {
      const target = previousFocus && document.contains(previousFocus)
        ? previousFocus
        : document.querySelector<HTMLElement>(".hlc-navbar-toggle");
      activeDialog = null;
      previousFocus = null;
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => target?.focus());
    };

    const activateDialog = (dialog: HTMLElement) => {
      if (activeDialog === dialog) return;
      if (activeDialog) restoreFocus();
      activeDialog = dialog;
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (activeDialog !== dialog || !document.contains(dialog)) return;
        const [first] = visibleFocusableElements(dialog);
        (first ?? dialog).focus();
      });
    };

    const syncDialog = () => {
      const dialog = document.querySelector<HTMLElement>('.hlc-drawer-v2[role="dialog"][aria-modal="true"]');
      if (dialog) activateDialog(dialog);
      else if (activeDialog) restoreFocus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = activeDialog;
      if (!dialog || !document.contains(dialog)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        document.querySelector<HTMLElement>('.hlc-navbar-toggle[aria-expanded="true"]')?.click();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = visibleFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !dialog.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    const observer = new MutationObserver(syncDialog);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("keydown", onKeyDown, true);
    syncDialog();

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKeyDown, true);
      cancelAnimationFrame(focusFrame);
      if (activeDialog) restoreFocus();
    };
  }, []);

  return null;
}
