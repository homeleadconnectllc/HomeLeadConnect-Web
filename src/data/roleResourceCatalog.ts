export type ResourceAudience = "resident" | "professional" | "partner" | "internal" | "shared";
export type ResourceKind = "directory" | "script" | "guide" | "form" | "supplier" | "promotion";

export type ResourceGeography = {
  countries?: readonly string[];
  regions?: readonly string[];
  localities?: readonly string[];
  global?: boolean;
};

export type ResourceLanguage = {
  sourceLanguage: string;
  translatedLanguages?: readonly string[];
  textToSpeechReady?: boolean;
};

export type RoleResource = {
  id: string;
  audience: readonly ResourceAudience[];
  kind: ResourceKind;
  category: string;
  title: string;
  summary: string;
  website?: string;
  phone?: string;
  note?: string;
  source?: string;
  geography?: ResourceGeography;
  language?: ResourceLanguage;
};

export const ROLE_RESOURCE_CATEGORIES = {
  resident: [
    "Find housing",
    "Shelter & housing stability",
    "Rent & utility assistance",
    "Tenant help",
    "Moving & household needs",
    "Food & family support",
    "Employment & transportation",
    "Home-service help",
  ],
  professional: [
    "Suppliers & materials",
    "Business operations",
    "Opportunities & assignments",
    "Scheduling & customer communication",
    "Professional forms & documents",
    "Training & Academy",
  ],
  partner: [
    "Referral guidance",
    "Partner outreach",
    "Programs & community connections",
    "Partner forms & documents",
  ],
  internal: [
    "Opening & introductions",
    "Discovery & qualification",
    "Rebuttals & objections",
    "Appointment & scheduling",
    "Follow-up",
    "Text, email & voicemail",
    "Promotions & campaigns",
    "Customer experience",
    "Community & referral",
    "Special situations",
  ],
} as const;

export const RESIDENT_DIRECTORY_RESOURCES: readonly RoleResource[] = [
  {
    id: "zillow-rentals",
    audience: ["resident"],
    kind: "directory",
    category: "Find housing",
    title: "Zillow Rentals",
    summary: "Search current rental listings by location, price, bedrooms, and home type.",
    website: "https://www.zillow.com/homes/for_rent/",
    note: "External listing service. HomeLead Connect does not verify listing availability, pricing, landlords, or lease terms.",
    source: "Zillow official rental search",
    geography: { countries: ["US"] },
    language: { sourceLanguage: "en" },
  },
  {
    id: "forrent",
    audience: ["resident"],
    kind: "directory",
    category: "Find housing",
    title: "ForRent.com",
    summary: "Search apartments, houses, condos, townhomes, and affordable-housing listings.",
    website: "https://www.forrent.com/",
    phone: "888-658-7368",
    note: "External listing service. Confirm availability, total monthly cost, fees, application requirements, and lease terms directly with the property.",
    source: "ForRent.com official site and renter support",
    geography: { countries: ["US"] },
    language: { sourceLanguage: "en" },
  },
  {
    id: "pa211-housing",
    audience: ["resident"],
    kind: "directory",
    category: "Shelter & housing stability",
    title: "PA 211 Housing & Shelter Help",
    summary: "Find local Pennsylvania shelter, homelessness-prevention, rent-assistance, deposit-assistance, and housing-search programs.",
    website: "https://www.pa211.org/homelessness-resources/",
    phone: "211",
    note: "Pennsylvania-only resource. Dial 211 or use PA 211 to search by ZIP code. Program eligibility and availability can change.",
    source: "PA 211 official housing resources",
    geography: { countries: ["US"], regions: ["PA"] },
    language: { sourceLanguage: "en" },
  },
  {
    id: "pa211-affordable-housing",
    audience: ["resident"],
    kind: "directory",
    category: "Rent & utility assistance",
    title: "PA 211 Affordable Housing Resources",
    summary: "Search Pennsylvania programs for rent payment help, rental deposits, affordable housing, and housing-search assistance.",
    website: "https://www.pa211.org/affordable-housing-resources/",
    phone: "211",
    note: "Pennsylvania-only resource. Eligibility varies by program, location, income, household circumstances, and available funding.",
    source: "PA 211 official affordable housing resources",
    geography: { countries: ["US"], regions: ["PA"] },
    language: { sourceLanguage: "en" },
  },
];

export const HOMELEAD_SCRIPT_LIBRARY: readonly RoleResource[] = [
  {
    id: "objection-not-interested",
    audience: ["internal"],
    kind: "script",
    category: "Rebuttals & objections",
    title: "Not interested",
    summary: "Use a low-pressure response that clarifies whether the person needs help now, later, or not at all.",
    note: "Example: “Understood. Before I let you go, is it that you already have the help you need, or is the timing just not right? I can make sure HomeLead Connect follows your preference.”",
    geography: { global: true },
    language: { sourceLanguage: "en", textToSpeechReady: true },
  },
  {
    id: "objection-busy",
    audience: ["internal"],
    kind: "script",
    category: "Rebuttals & objections",
    title: "I’m busy",
    summary: "Respect the person’s time and make the next step easy.",
    note: "Example: “No problem. I can keep this quick or reconnect when it works better for you. Is later today, tomorrow, or another day easier?”",
    geography: { global: true },
    language: { sourceLanguage: "en", textToSpeechReady: true },
  },
  {
    id: "objection-no-money",
    audience: ["internal"],
    kind: "script",
    category: "Rebuttals & objections",
    title: "I don’t have money right now",
    summary: "Do not pressure a purchase. Clarify whether the person wants information, future follow-up, or no further contact.",
    note: "Example: “That makes sense. You don’t have to commit to anything. Would it help to keep the information for later, or would you rather we check back at a better time?”",
    geography: { global: true },
    language: { sourceLanguage: "en", textToSpeechReady: true },
  },
  {
    id: "objection-call-later",
    audience: ["internal"],
    kind: "script",
    category: "Follow-up",
    title: "Call me later",
    summary: "Turn a vague callback into a respectful, specific follow-up time.",
    note: "Example: “Absolutely. What day and general time works best so I don’t keep catching you at the wrong moment?”",
    geography: { global: true },
    language: { sourceLanguage: "en", textToSpeechReady: true },
  },
];

export const RESOURCE_TRUST_RULES = [
  "Show only resources appropriate to the signed-in role or portal.",
  "Filter location-specific resources by the user's relevant country, region, or locality instead of treating Pennsylvania as the default.",
  "Shared resources may be reused across roles without duplicating the underlying record.",
  "External organizations and listings are not endorsements unless HomeLead Connect explicitly says otherwise.",
  "Verify phone numbers, URLs, eligibility, service areas, and program availability before production publication.",
  "Keep resource content structured for translation and language selection instead of baking English into the data model.",
  "Where supported, important content should be compatible with text-to-speech in the user's selected language.",
  "Scripts must fit HomeLead Connect's connection, guidance, scheduling, and support role rather than pressure people into purchases.",
] as const;
