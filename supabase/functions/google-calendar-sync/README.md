# Google Calendar appointment bridge

HLC `appointments` remains authoritative. This function creates or updates the
corresponding event in the existing Google `APPOINTMENTS` calendar and stores the
provider mapping, sync state, failure, and idempotency key in
`calendar_event_mappings`.

Required server-only secrets:

- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`

Deploy with JWT verification enabled. Until all four values are configured the
function returns `Google Calendar Setup Required` and does not create a second
scheduling truth.
