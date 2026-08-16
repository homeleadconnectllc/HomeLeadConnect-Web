export const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
export const turnstileEnabled = Boolean(turnstileSiteKey);
export const authCaptchaRequired = import.meta.env.PROD;
export const authCaptchaReady = !authCaptchaRequired || turnstileEnabled;
export const authCaptchaConfigMessage = "Bot protection is temporarily unavailable on this deployment. Please try again after HomeLead Connect finishes updating the site.";
