# Base44 visual lab → HCX application map

Source inspected: published `HomeLead Connect Lab (Copy)` at `home-lead-connect-lab-copy-5fb11255.base44.app`. The free plan did not expose direct source files. This map uses the rendered pages as visual reference. The HCX repository remains the one codebase; the production Supabase project remains the live backend.

| Base44 page | HCX route and source | Visual treatment | Boundary |
| --- | --- | --- | --- |
| Home | `/`, `src/standalonePublicHome.ts` | Four-stage journey and alternating resident/professional image sections adapted in `base44-story-adaptation-20260927.css` | Keep existing dark background, HQ imagery, four-pathway links and real destinations. Do not copy lab metrics. |
| About | `/about`, `src/pages/About.tsx` | Centered story introduction before founder, platform, and memorial sections | Preserve founder/brand credits and dedicated memorial link. |
| Residents | `/homeowners` (`/residents` alias), `PathwayPage.tsx` | Shared family hero, four-step story, green accents | Keep request submission separate from assignment and pricing. |
| Professionals | `/professionals`, `PathwayPage.tsx` | Shared family hero, process and professional feature, cyan/blue accents | CTA routes to `/professional-application`; no fictional lead scores, work volume, vetting status, or guarantees. |
| Partners | `/partners`, `PathwayPage.tsx` | Shared family hero/story, gold accents | No invented partner entitlements or regional routing. |
| Community | `/community`, `PathwayPage.tsx` | Shared family hero/story, purple accents | Discovery and operational assignment remain separate. |
| Services | `/services`, `PublicJourney.tsx` | Shared editorial introduction and numbered service details | Only supported categories and actual workflow claims. |
| Pricing | `/pricing`, `PublicJourney.tsx` | Shared editorial introduction and verified subscription explanation | Keep current price, trial, payment-method and service-payment disclosures. |
| How It Works | `/how-it-works`, `PublicInfo.tsx` | Shared editorial introduction and explicit stage details | Do not imply a request guarantees acceptance or booking. |
| LeadScope | `/leadscope`, `PublicInfo.tsx` | Shared editorial introduction and existing imagery | Informational estimates remain distinct from binding quotes. |
| Trust | `/trust`, `PublicJourney.tsx` | Shared editorial introduction and role/consent details | Do not import Base44's unverified four-gate vetting assertion. |
| Demo | `/demo`, `PublicJourney.tsx` | Shared editorial introduction and audience paths | Preserve review before access; no fictional customer record. |
| Contact | `/contact`, `ContactPage.tsx` | Shared editorial introduction and audience-specific paths | Preserve direct business contact and live service/application routes. |
| Request Service | `/request-service`, `RequestService.tsx` | Retain existing river/city/Capitol and transparent form design | Working form, receipt, validation and database flow are protected. |
| Professional Application | `/professional-application`, application route | Retain existing professional form design | Auth, validation, approval and evidence workflow are protected. |

Shared sources: `src/components/PublicSiteNav.tsx` governs the logo/menu, `src/components/PublicEditorialIntro.tsx` governs public story introductions, `src/styles/mockup-authority-20260924.css` and `public-owner-corrections-20260926.css` govern the existing background and family treatment. The authenticated shells and portal families remain in their own source components. Base44 is not installed as a runtime dependency or backend integration.

Exclusions: Base44's displayed 1,200+ homes, 340 professionals, 98% project completion, $2.4M routed work, fabricated example leads and fit scores, and placeholder legal links are not evidence of actual HCX operations. No values or workflows are imported from them.
