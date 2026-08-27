import { useEffect } from "react";

function isEditableTarget(target: Element | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  return target.isContentEditable;
}

export default function MobileViewportAuthority() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const viewport = window.visualViewport;

    const update = () => {
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const offsetTop = viewport?.offsetTop ?? 0;
      const editableFocused = isEditableTarget(document.activeElement);
      const keyboardDelta = Math.max(0, window.innerHeight - height - offsetTop);
      const keyboardOpen = editableFocused && keyboardDelta > 110;

      root.style.setProperty("--hlc-visual-viewport-height", `${Math.round(height)}px`);
      root.style.setProperty("--hlc-visual-viewport-width", `${Math.round(width)}px`);
      root.style.setProperty("--hlc-visual-viewport-top", `${Math.round(offsetTop)}px`);
      root.style.setProperty("--hlc-keyboard-inset", `${Math.round(keyboardOpen ? keyboardDelta : 0)}px`);
      body.classList.toggle("hlc-keyboard-open", keyboardOpen);
    };

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      body.classList.remove("hlc-keyboard-open");
      root.style.removeProperty("--hlc-visual-viewport-height");
      root.style.removeProperty("--hlc-visual-viewport-width");
      root.style.removeProperty("--hlc-visual-viewport-top");
      root.style.removeProperty("--hlc-keyboard-inset");
    };
  }, []);

  return null;
}
