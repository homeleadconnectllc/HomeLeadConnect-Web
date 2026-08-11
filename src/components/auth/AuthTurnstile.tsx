import { Turnstile } from "@marsidev/react-turnstile";

export default function AuthTurnstile({ onToken, resetSignal }: { onToken: (token: string) => void; resetSignal: number }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return <div aria-label="Bot protection">
    <Turnstile key={resetSignal} siteKey={siteKey} onSuccess={onToken} onExpire={() => onToken("")} onError={() => onToken("")} />
  </div>;
}
