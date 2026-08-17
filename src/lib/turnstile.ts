export const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
const configuredCaptchaRequirement = (import.meta.env.VITE_AUTH_CAPTCHA_REQUIRED || "").trim().toLowerCase();
export const authCaptchaRequired = configuredCaptchaRequirement
  ? configuredCaptchaRequirement === "true"
  : import.meta.env.PROD;
export const authCaptchaReady = !authCaptchaRequired || Boolean(turnstileSiteKey);
export const turnstileEnabled = authCaptchaRequired || Boolean(turnstileSiteKey);
export const authCaptchaConfigMessage = "Bot protection is temporarily unavailable on this deployment. Please try again after HomeLead Connect finishes updating the site.";
