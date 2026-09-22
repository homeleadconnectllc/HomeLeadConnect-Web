import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const modalStack: HTMLElement[] = [];

function visibleFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) =>
    element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0,
  );
}

function removeFromStack(dialog: HTMLElement) {
  const index = modalStack.lastIndexOf(dialog);
  if (index >= 0) modalStack.splice(index, 1);
}

export function useModalDialogAccessibility<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
): RefObject<T | null> {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
    removeFromStack(dialog);
    modalStack.push(dialog);

    const focusFrame = window.requestAnimationFrame(() => {
      if (modalStack.at(-1) !== dialog || !document.contains(dialog)) return;
      const autofocusTarget = dialog.querySelector<HTMLElement>("[autofocus]");
      const [first] = visibleFocusableElements(dialog);
      (autofocusTarget ?? first ?? dialog).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== dialog || !document.contains(dialog)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
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

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown, true);
      removeFromStack(dialog);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        window.requestAnimationFrame(() => previouslyFocused.focus());
      }
    };
  }, [open]);

  return dialogRef;
}
