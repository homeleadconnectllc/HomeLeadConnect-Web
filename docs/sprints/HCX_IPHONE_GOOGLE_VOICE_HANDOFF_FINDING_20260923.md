# iPhone manual call handoff finding — 2026-09-23

**Starting certified candidate:** `7f9c11f58b89896eca1d046253251b20c04a4fff`  
**Production:** unchanged  
**Device evidence:** owner screenshots IMG_0614–IMG_0622, captured on app.homeleadconnect.org.

The owner selected Resident Test (7175519897) in Manual Communications and saw the governed `provider_not_connected` BLOCK. The iOS prompt then offered a call to +1 (717) 288-1785, the HomeLead Connect company number, and a phone calling screen appeared. Those screenshots prove a device handoff occurred. They do **not** prove a call to Resident Test connected or that Google Voice forwarded to that contact.

## Source trace

| Stage | Candidate behavior before repair | Conclusion |
| --- | --- | --- |
| Selected lead | `LeadDetail` links to `/manual-communications?contact=lead:<id>&channel=call`; Manual Communications resolves the selected lead phone from `listLeads()`. | The chosen number is 7175519897. |
| Policy | `checkNativeDeviceAction` or `checkGoogleVoiceAction` calls `evaluate_communication_compliance`; `provider_not_connected` returns BLOCK. | Manual Communications renders no outbound call link when blocked. |
| Native device URL | After ALLOW only, `tel:${normalizeNativePhoneTarget(selected.phone)}`. | Expected URI for this lead is `tel:7175519897`. |
| Google Voice URL | After ALLOW only, `https://voice.google.com/` with no recipient query/bridge token. | HCX did not transmit the selected phone into Google Voice. The operator must enter it there. |
| Business line | `CallCenter` separately rendered `href={\`tel:${phone.phone_number}\`}` as “Use device Phone app” / “Call from this device” on the company line. | This URL dials the company number, not the selected lead. There is no HCX callback bridge or recipient association on this route. |

The exact tap that led to the iOS prompt is not visible in the screenshots. The prompt's number matches the distinct business-line `tel:` destination in Call Center, while the blocked Manual Communications screen has no call handoff control. Google Voice itself can use carrier access numbers after a call is initiated *inside Voice*, but this HCX company-line URL contains no selected contact and the blocked policy did not authorize an outbound action. Classify the HCX path as **an incorrect/misleading self-dial affordance**, not a proven Google Voice bridge.

## Candidate repair

- Removed the company-number `tel:` buttons from Call Center. Outbound actions now take the operator to contact selection and compliance check. The company number is identified as the company line, not a customer destination.
- After an ALLOW decision, Manual Communications shows the selected contact number and can copy that number for manual entry into Google Voice. Its Voice URL remains a generic carrier page, and the UI explicitly says it cannot pass the number automatically. BLOCK still exposes neither copy nor outbound link.
- The device-native URI continues to use only the selected contact number. Its normalization is shared with canonical contact-target logic.
- Updated the Call Center test and added an exact-target physical-handoff regression contract to launch verification.

**Proof boundary:** Source/contracts and CI can verify generated target and affordances. A real Google Voice call, recipient connection, and physical iPhone return flow require a new owner-controlled device check on an approved domain after the corrected candidate becomes available there. No additional external calls were placed during this repair.

## Controlled follow-up destination

Owner designated **7175854761** as the test destination; **7172881785** remains the Google Voice account number. The physical-handoff contract now requires `tel:7175854761` for the controlled contact and explicitly distinguishes it from `tel:7172881785`. No provider or account setting is changed by the test.

A rollback-only nonproduction rehearsal (`HCX_CONTROLLED_GOOGLE_VOICE_DESTINATION_PROOF.sql`) inserted a synthetic lead at 7175854761, ran the actual `evaluate_communication_compliance` RPC as an authenticated workspace member, and confirmed the resulting check referenced that lead, call channel, and Google Voice transport. It returned `BLOCK` with `provider_not_connected`; the associated lead still resolved to 7175854761. Fixture user, lead, check, and provider connection counts were all zero after rollback. This proves selection and policy association, not an outbound Google Voice call.

For the owner-controlled retest on the approved app domain, choose a contact whose saved phone is 7175854761, run the manual communication check, and proceed only on ALLOW. For the device-native path the iOS prompt should present 7175854761. For Google Voice, HomeLead Connect displays/copies 7175854761 after ALLOW, but opens only the generic Google Voice surface; the operator must enter/confirm 7175854761 in Google Voice. An iOS carrier prompt may show an access number, so that prompt alone cannot prove final recipient routing. Verify the dialed contact in Voice and independently verify the actual intended recipient before marking the full Google Voice handoff PASS. If policy BLOCKS, stop: no outbound handoff or completed-call record is authorized.
