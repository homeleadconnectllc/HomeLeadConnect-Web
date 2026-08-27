import { useEffect } from "react";

function isEditable(element: Element | null) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.matches("input, textarea, select, [contenteditable='true']")) {
    if (element instanceof HTMLInputElement && ["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"].includes(element.type)) return false;
    return !element.hasAttribute("disabled") && element.getAttribute("aria-disabled") !== "true";
  }
  return false;
}

export default function MobileViewportAuthority() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const viewport = window.visualViewport;
    let blurTimer = 0;

    const compactViewport = () => window.matchMedia("(max-width: 760px)").matches;

    const sync = () => {
      const visualHeight = viewport?.height ?? window.innerHeight;
      const visualWidth = viewport?.width ?? window.innerWidth;
      const visualTop = viewport?.offsetTop ?? 0;
      const keyboardInset = Math.max(0, window.innerHeight - visualHeight - visualTop);
      const focusedEditable = isEditable(document.activeElement);
      const viewportKeyboardEvidence = keyboardInset > 120;
      // Real iPhone Safari does not always report a stable visualViewport delta.
      // On compact screens, focused text entry is authoritative keyboard evidence;
      // visualViewport remains a secondary signal for geometry and dismissal.
      const keyboardOpen = compactViewport() && (focusedEditable || viewportKeyboardEvidence);
      const agentOpen = Boolean(document.querySelector(".hlc-agent-dock.is-open"));

      root.style.setProperty("--hlc-visual-viewport-height", `${visualHeight}px`);
      root.style.setProperty("--hlc-visual-viewport-width", `${visualWidth}px`);
      root.style.setProperty("--hlc-visual-viewport-top", `${visualTop}px`);
      root.style.setProperty("--hlc-keyboard-inset", `${keyboardInset}px`);
      body.classList.toggle("hlc-keyboard-open", keyboardOpen);
      body.classList.toggle("hlc-agent-open", agentOpen);
    };

    const syncAfterBlur = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(sync, 80);
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (compactViewport() && isEditable(event.target instanceof Element ? event.target : null)) {
        body.classList.add("hlc-keyboard-open");
      }
      sync();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const voiceSummary = target?.closest(".hlc-ai-settings > summary");
      if (!voiceSummary) return;
      const settings = voiceSummary.parentElement;
      const enable = settings?.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (enable && !enable.checked && !enable.disabled) enable.click();
    };

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(document.documentElement);
    const mutationObserver = new MutationObserver(sync);
    mutationObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });

    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", syncAfterBlur, true);
    document.addEventListener("click", handleClick, true);
    sync();

    return () => {
      window.clearTimeout(blurTimer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", syncAfterBlur, true);
      document.removeEventListener("click", handleClick, true);
      body.classList.remove("hlc-keyboard-open", "hlc-agent-open");
    };
  }, []);

  return null;
}
