import { useEffect } from "react";
import {
  classifyPresentationFeedback,
  isInsideQuietHours,
  loadPresentationFeedbackPreferences,
  type PresentationFeedbackTone,
} from "../../lib/presentationFeedback";

type AudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

const tonePattern: Record<PresentationFeedbackTone, Array<[number, number, number]>> = {
  progress: [[440, 0, .055]],
  success: [[523, 0, .07], [659, .085, .085]],
  attention: [[392, 0, .075], [392, .11, .075]],
  error: [[330, 0, .09], [247, .11, .12]],
};

export default function PresentationSoundFeedback() {
  useEffect(() => {
    let armed = false;
    let context: AudioContext | null = null;
    let lastPlayedAt = 0;
    const announced = new WeakMap<HTMLElement, string>();

    const arm = () => { armed = true; };
    const play = (tone: PresentationFeedbackTone) => {
      const preferences = loadPresentationFeedbackPreferences();
      if (!armed || !preferences.enabled || isInsideQuietHours(preferences)) return;
      const now = Date.now();
      if (now - lastPlayedAt < 350) return;
      const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      if (!AudioContextClass) return;
      context ||= new AudioContextClass();
      if (context.state === "suspended") void context.resume();
      const startAt = context.currentTime + .015;
      for (const [frequency, offset, duration] of tonePattern[tone]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt + offset);
        gain.gain.setValueAtTime(.0001, startAt + offset);
        gain.gain.exponentialRampToValueAtTime(.045, startAt + offset + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, startAt + offset + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(startAt + offset);
        oscillator.stop(startAt + offset + duration + .01);
      }
      lastPlayedAt = now;
    };

    const inspect = (element: HTMLElement) => {
      if (!element.matches('[role="status"], [role="alert"], [data-tone], .hlc-account-status')) return;
      const text = element.textContent?.trim() || "";
      if (!text || announced.get(element) === text) return;
      announced.set(element, text);
      const tone = classifyPresentationFeedback(element);
      if (tone) play(tone);
    };

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const target = record.target instanceof HTMLElement ? record.target : record.target.parentElement;
        const liveTarget = target?.closest<HTMLElement>('[role="status"], [role="alert"], [data-tone], .hlc-account-status');
        if (liveTarget) inspect(liveTarget);
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          inspect(node);
          node.querySelectorAll<HTMLElement>('[role="status"], [role="alert"], [data-tone], .hlc-account-status').forEach(inspect);
        }
      }
    });

    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", arm);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
      if (context) void context.close();
    };
  }, []);

  return null;
}
