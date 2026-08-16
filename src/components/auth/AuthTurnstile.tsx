import { Turnstile } from "@marsidev/react-turnstile";
import { turnstileSiteKey } from "../../lib/turnstile";

export default function AuthTurnstile({ onToken, resetSignal }: { onToken: (token: string) => void; resetSignal: number }) {
  if (!turnstileSiteKey) return null;
  return <div aria-label="Bot protection">
    <Turnstile key={resetSignal} siteKey={turnstileSiteKey} onSuccess={onToken} onExpire={() => onToken("")} onError={() => onToken("")} />
  </div>;
}
