export type PublicPageImage = {
  src: string;
  alt: string;
  position?: string;
};

/**
 * Route-specific editorial photography.
 *
 * A path may occur only once in this registry. The Four Pathways photography is
 * intentionally excluded because those assets belong exclusively to the home
 * page. Shared logos, agent portraits, and interface icons are governed by
 * their separate brand contracts.
 */
export const publicPageImagery = {
  about: {
    src: "/page-about-connected-home-help-20260916.webp",
    alt: "Black family reviewing a home-service plan with a Black service coordinator",
  },
  homeowners: {
    src: "/page-residents-request-help-20260916.webp",
    alt: "Black resident reviewing a kitchen repair request with a Black service professional",
  },
  contractors: {
    src: "/page-contractors-explicit-access-20260916.webp",
    alt: "Black service-business owner reviewing explicit provider access with a Black coordinator",
  },
  how: {
    src: "/page-how-service-journey-20260916.webp",
    alt: "Black household reviewing the connected stages of a home-service request",
  },
  leadscope: {
    src: "/page-leadscope-resident-measurements-20260916.webp",
    alt: "Black resident measuring a home project while a family member records the details",
  },
  community: {
    src: "/page-community-connected-neighbors-20260916.webp",
    alt: "Black neighbors helping a family move on a Harrisburg residential block",
  },
  services: {
    src: "/page-services-connected-journey-20260916.webp",
    alt: "Black resident coordinating several home-service professionals at one property",
  },
  pricing: {
    src: "/page-pricing-business-workspace-20260916.webp",
    alt: "Black home-service business owners reviewing a practical workspace budget",
  },
  trust: {
    src: "/page-trust-clear-roles-20260916.webp",
    alt: "Black resident, service professional, and coordinator reviewing clearly separated responsibilities",
  },
  demo: {
    src: "/page-demo-journey-walkthrough-20260916.webp",
    alt: "Black service-business owner and resident advocate viewing a guided HomeLead Connect demonstration",
  },
  professionals: {
    src: "/page-professionals-provider-presence-20260916.webp",
    alt: "Black home-service professionals coordinating work at a residential renovation",
  },
  professionalApplication: {
    src: "/page-professional-application-20260916.webp",
    alt: "Black painting contractor completing a professional application in her workshop",
  },
  partners: {
    src: "/page-partners-referral-relationships-20260916.webp",
    alt: "Black community and service partners reviewing renovation plans together",
  },
  contact: {
    src: "/page-contact-how-can-we-help-20260916.webp",
    alt: "Black HomeLead Connect support coordinator listening to a service question",
  },
  requestService: {
    src: "/page-request-service-home-needs-20260916.webp",
    alt: "Black renter using a phone to report a small kitchen faucet leak",
  },
  login: {
    src: "/page-login-welcome-back-20260916.webp",
    alt: "Black resident returning to her connected home-service account",
  },
  register: {
    src: "/page-register-company-workspace-20260916.webp",
    alt: "Black small-business owner creating a company workspace",
  },
  forgotPassword: {
    src: "/page-forgot-password-recovery-20260916.webp",
    alt: "Black resident calmly checking an account-recovery message",
  },
  resetPassword: {
    src: "/page-reset-password-new-password-20260916.webp",
    alt: "Black professional securely choosing new account credentials",
  },
  accessibility: {
    src: "/page-accessibility-devices-inputs-20260916.webp",
    alt: "Black people using adaptive computer and mobile inputs",
  },
  privacy: {
    src: "/page-privacy-built-in-20260916.webp",
    alt: "Black family members reviewing clear account privacy choices together",
  },
  terms: {
    src: "/page-terms-clear-agreement-20260916.webp",
    alt: "Black home-service business owner carefully reviewing a service agreement",
  },
  platform: {
    src: "/page-platform-distinct-roles-20260916.webp",
    alt: "Black resident, independent professional, and coordinator discussing their distinct roles",
  },
} as const satisfies Record<string, PublicPageImage>;

export type PublicPageImageKey = keyof typeof publicPageImagery;

export function pageImage(key: PublicPageImageKey): PublicPageImage {
  return publicPageImagery[key];
}
