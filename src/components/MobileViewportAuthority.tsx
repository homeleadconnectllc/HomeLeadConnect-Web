import { useEffect } from "react";
import { stopAgentSpeech } from "../lib/agentVoice";

function isEditable(element: Element | null) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.matches("input, textarea, select, [contenteditable='true']")) {
    if (element instanceof HTMLInputElement && ["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"].includes(element.type)) return false;
    return !element.hasAttribute("disabled") && element.getAttribute("aria-disabled") !== "true";
  }
  return false;
}

type NativeFallbackProfile = {
  rate: number;
  pitch: number;
  preferredNames: string[];
};

const nativeFallbackProfiles: Record<"kendrell" | "dion" | "diamond", NativeFallbackProfile> = {
  kendrell: { rate: 0.9, pitch: 0.86, preferredNames: ["Aaron", "Daniel", "Alex", "Arthur", "Fred", "Ralph"] },
  dion: { rate: 1.02, pitch: 0.94, preferredNames: ["Evan", "Tom", "Nathan", "Oliver", "Reed", "Albert"] },
  diamond: { rate: 0.97, pitch: 1.08, preferredNames: ["Samantha", "Ava", "Serena", "Karen", "Victoria", "Tessa"] },
};

function resolveAgentId(dock: Element) {
  const heading = dock.querySelector(".hlc-ai-chat h2")?.textContent?.trim().toLowerCase();
  if (heading === "dion" || heading === "diamond" || heading === "kendrell") return heading;
  return "kendrell";
}

function pronunciationSafeText(text: string) {
  return text
    .replace(/\bDiamond\b/gi, "Die-Men")
    .replace(/\bDion\b/gi, "Dee-Yon")
    .replace(/\bKendrell\b/gi, "Ken-Drayl");
}

function speakNativeFallback(dock: Element, text: string) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;
  const agentId = resolveAgentId(dock);
  const profile = nativeFallbackProfiles[agentId];
  const utterance = new SpeechSynthesisUtterance(pronunciationSafeText(text));
  utterance.lang = document.documentElement.lang || navigator.language || "en-US";
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = profile.preferredNames.map((name) => name.toLowerCase());
  const language = utterance.lang.toLowerCase().split("-")[0];
  const candidates = voices.filter((voice) => voice.lang.toLowerCase().startsWith(language));
  const voicePool = candidates.length ? candidates : voices;
  const selected = voicePool.find((voice) => preferred.some((name) => voice.name.toLowerCase().includes(name)))
    ?? voicePool.find((voice) => voice.default)
    ?? voicePool[0];
  if (selected) utterance.voice = selected;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export default function MobileViewportAuthority() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const viewport = window.visualViewport;
    const fallbackReplayAttempted = new WeakSet<HTMLButtonElement>();
    const nativeFallbackAttempted = new WeakSet<HTMLButtonElement>();
    const preparingTimers = new WeakMap<HTMLButtonElement, number>();
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

    const maybeSpeakVerifiedFallback = () => {
      const dock = document.querySelector(".hlc-agent-dock.is-open");
      if (!dock) return;
      const voiceChecks = Array.from(dock.querySelectorAll<HTMLInputElement>('.hlc-ai-settings input[type="checkbox"]'));
      const voiceEnabled = Boolean(voiceChecks[0]?.checked);
      const autoSpeakEnabled = Boolean(voiceChecks[1]?.checked);
      if (!voiceEnabled || !autoSpeakEnabled) return;
      const alert = dock.querySelector<HTMLElement>(".hlc-ai-error");
      if (!alert?.textContent?.toLowerCase().includes("verified hlc fallback guidance")) return;
      const replayButtons = dock.querySelectorAll<HTMLButtonElement>(".hlc-ai-message.is-model .hlc-ai-replay");
      const replay = replayButtons.item(replayButtons.length - 1);
      if (!replay || replay.disabled || fallbackReplayAttempted.has(replay)) return;
      fallbackReplayAttempted.add(replay);
      replay.click();
    };

    const enforceFreeVoiceFailover = () => {
      if (!compactViewport()) return;
      const dock = document.querySelector(".hlc-agent-dock.is-open");
      if (!dock) return;
      const replayButtons = dock.querySelectorAll<HTMLButtonElement>(".hlc-ai-message.is-model .hlc-ai-replay");
      const replay = replayButtons.item(replayButtons.length - 1);
      if (!replay) return;
      const preparing = replay.disabled && replay.textContent?.trim().toLowerCase().startsWith("preparing");
      if (!preparing) {
        const existing = preparingTimers.get(replay);
        if (existing) window.clearTimeout(existing);
        return;
      }
      if (preparingTimers.has(replay) || nativeFallbackAttempted.has(replay)) return;

      const timer = window.setTimeout(() => {
        preparingTimers.delete(replay);
        if (!replay.isConnected || nativeFallbackAttempted.has(replay)) return;
        const stillPreparing = replay.disabled && replay.textContent?.trim().toLowerCase().startsWith("preparing");
        if (!stillPreparing) return;
        const text = replay.closest(".hlc-ai-message.is-model")?.querySelector("p")?.textContent?.trim();
        if (!text) return;
        nativeFallbackAttempted.add(replay);
        stopAgentSpeech();
        speakNativeFallback(dock, text);
      }, 2500);
      preparingTimers.set(replay, timer);
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
      if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    };

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(document.documentElement);
    const mutationObserver = new MutationObserver(() => {
      sync();
      window.requestAnimationFrame(() => {
        maybeSpeakVerifiedFallback();
        enforceFreeVoiceFailover();
      });
    });
    mutationObserver.observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true, attributeFilter: ["class"] });

    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", syncAfterBlur, true);
    document.addEventListener("click", handleClick, true);
    sync();
    maybeSpeakVerifiedFallback();
    enforceFreeVoiceFailover();

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
      stopAgentSpeech();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      body.classList.remove("hlc-keyboard-open", "hlc-agent-open");
    };
  }, []);

  return null;
}
