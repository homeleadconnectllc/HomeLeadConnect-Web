# Resident intake controlled-rollout evidence — 2026-09-06

## Production baseline

- Base SHA: `74d99389128dd57af6c3cc4bde8ed70cc7e19bc7`
- Controlled rollout was intentionally paused after the first resident tester.

## Physical evidence

The tester reached `app.homeleadconnect.org/request-service`, completed and submitted the resident service request, but reported that the journey felt plain, they became lost, and they did not know what to do after sending the request.

A fresh production database check confirmed the request was actually accepted and a new `public_website` lead was created with `status = new` and `stage = new`. This classifies the failure as a resident completion/clarity defect rather than an intake persistence defect.

## Repair scope

- Keep the existing public intake RPC and request payload unchanged.
- Keep auth, RLS, rate limiting, honeypot behavior, analytics calls, and lead workflow unchanged.
- Restore a strongly branded mobile/desktop request surface that cannot be washed out by shared styles.
- Make successful completion unmistakable: `You’re done for now.`
- Explicitly tell the resident that HomeLead Connect received the request, that no additional submission is required, and that HomeLead Connect will contact them using the provided information.
- Keep provider, price, and appointment confirmation language conservative.

## Release rule

No production promotion without all required exact-head certification and physical iPhone approval of the repaired resident journey.