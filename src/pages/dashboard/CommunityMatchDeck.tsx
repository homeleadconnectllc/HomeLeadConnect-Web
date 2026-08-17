import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { listContractors } from "../../api/contractors";
import {
  listProviderAvailability,
  listSavedProviderIds,
  listServiceAreas,
  setProviderSaved,
} from "../../api/ecosystemRecords";
import {
  clearCommunityPassDecisions,
  listCommunityMatchDecisions,
  setCommunityMatchDecision,
} from "../../api/communityMatching";
import { errorMessage } from "../../lib/errorMessage";
import type { Contractor } from "../../lib/types/database";

const SWIPE_THRESHOLD = 84;

export default function CommunityMatchDeck() {
  const [providers, setProviders] = useState<Contractor[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [passed, setPassed] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef<number | null>(null);

  async function load() {
    try {
      const [providerRows, areaRows, availabilityRows, savedIds, decisions] = await Promise.all([
        listContractors({}),
        listServiceAreas(),
        listProviderAvailability(),
        listSavedProviderIds(),
        listCommunityMatchDecisions(),
      ]);
      setProviders(providerRows);
      setAreas(areaRows);
      setAvailability(availabilityRows);
      setSaved(savedIds);
      setPassed(new Set(decisions.filter((row) => row.decision === "pass").map((row) => row.contractor_id)));
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load Community Matching."));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const deck = useMemo(
    () => providers.filter((provider) => !passed.has(provider.id) && !saved.has(provider.id)),
    [providers, passed, saved],
  );
  const current = deck[0] ?? null;
  const next = deck[1] ?? null;
  const likedProviders = useMemo(
    () => providers.filter((provider) => saved.has(provider.id)),
    [providers, saved],
  );

  async function like(providerId: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await setProviderSaved(providerId, true);
      await setCommunityMatchDecision(providerId, "like");
      setSaved((previous) => new Set(previous).add(providerId));
      setPassed((previous) => {
        const nextPassed = new Set(previous);
        nextPassed.delete(providerId);
        return nextPassed;
      });
      setOffsetX(0);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save this provider."));
    } finally {
      setBusy(false);
    }
  }

  async function pass(providerId: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await setCommunityMatchDecision(providerId, "pass");
      setPassed((previous) => new Set(previous).add(providerId));
      setOffsetX(0);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to record this pass."));
    } finally {
      setBusy(false);
    }
  }

  async function undoPass() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await clearCommunityPassDecisions();
      setPassed(new Set());
      setOffsetX(0);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to reset passed providers."));
    } finally {
      setBusy(false);
    }
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!current || busy) return;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (startX.current == null) return;
    setOffsetX(Math.max(-160, Math.min(160, event.clientX - startX.current)));
  }

  function onPointerUp() {
    if (!current) return;
    const providerId = current.id;
    const finalOffset = offsetX;
    startX.current = null;
    if (finalOffset >= SWIPE_THRESHOLD) {
      void like(providerId);
      return;
    }
    if (finalOffset <= -SWIPE_THRESHOLD) {
      void pass(providerId);
      return;
    }
    setOffsetX(0);
  }

  const currentAvailability = current
    ? availability.find((row: any) => row.contractor_id === current.id)
    : null;
  const currentAreas = current
    ? areas.filter((row: any) => row.contractor_id === current.id)
    : [];

  return (
    <main className="hlc-match-page">
      <header className="hlc-match-hero">
        <p className="hlc-match-eyebrow">Community · Discover</p>
        <h1>Find people and providers you want to connect with.</h1>
        <p>
          Swipe right or tap Like to save a provider. Swipe left or tap Pass to keep browsing. HLC still uses factual service-area,
          availability, and eligibility records underneath; this screen is the fun discovery layer.
        </p>
        <div className="hlc-match-hero-links">
          <Link to="/network/eligibility">Open Eligibility &amp; Fit</Link>
          <Link to="/network/saved">View saved providers</Link>
        </div>
      </header>

      {error && <p role="alert" className="hlc-match-alert">{error}</p>}

      <section className="hlc-match-shell" aria-label="Community Matching deck">
        <div className="hlc-match-deck">
          {next && <article className="hlc-match-card hlc-match-card-next" aria-hidden="true" />}

          {current ? (
            <article
              className="hlc-match-card hlc-match-card-active"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { startX.current = null; setOffsetX(0); }}
              style={{ transform: `translateX(${offsetX}px) rotate(${offsetX / 28}deg)` }}
            >
              <div className="hlc-match-visual" aria-hidden="true">
                <span>{initials(current)}</span>
              </div>
              <div className="hlc-match-card-body">
                <div className="hlc-match-card-heading">
                  <div>
                    <p className="hlc-match-kicker">{current.specialty || "HLC Network provider"}</p>
                    <h2>{displayName(current)}</h2>
                  </div>
                  <span className={`hlc-match-availability ${currentAvailability?.available ? "is-available" : ""}`}>
                    {currentAvailability ? (currentAvailability.available ? "Available" : "Unavailable") : "Availability not posted"}
                  </span>
                </div>

                <p className="hlc-match-location">
                  {[current.city, current.state, current.zip].filter(Boolean).join(", ") || "Service location not recorded"}
                </p>

                <div className="hlc-match-tags">
                  {currentAreas.slice(0, 3).map((area: any) => (
                    <span key={area.id}>{[area.city, area.state, area.zip].filter(Boolean).join(" · ") || "Service area"}</span>
                  ))}
                  {current.status && <span>{current.status}</span>}
                </div>

                <div className="hlc-match-profile-actions">
                  <Link to={`/providers/${current.id}`}>View full profile</Link>
                  {current.phone && <a href={`tel:${current.phone}`}>Call</a>}
                  {current.email && <a href={`mailto:${current.email}`}>Email</a>}
                </div>
              </div>

              {offsetX > 28 && <div className="hlc-match-swipe-stamp is-like">LIKE</div>}
              {offsetX < -28 && <div className="hlc-match-swipe-stamp is-pass">PASS</div>}
            </article>
          ) : (
            <div className="hlc-match-empty">
              <div className="hlc-match-empty-icon">✓</div>
              <h2>You reached the end of this deck.</h2>
              <p>Review your liked providers, reset passes, or return later when more provider records are available.</p>
              <div className="hlc-match-empty-actions">
                <button type="button" onClick={() => void undoPass()} disabled={busy}>{busy ? "Resetting…" : "Reset passes"}</button>
                <Link to="/network/saved">Open liked providers</Link>
              </div>
            </div>
          )}
        </div>

        {current && (
          <div className="hlc-match-controls" aria-label="Matching actions">
            <button type="button" className="hlc-match-pass" onClick={() => void pass(current.id)} disabled={busy} aria-label="Pass on this provider">
              <span aria-hidden="true">✕</span>
              <strong>Pass</strong>
            </button>
            <button type="button" className="hlc-match-like" onClick={() => void like(current.id)} disabled={busy} aria-label="Like and save this provider">
              <span aria-hidden="true">♥</span>
              <strong>{busy ? "Saving…" : "Like"}</strong>
            </button>
          </div>
        )}

        <p className="hlc-match-hint">Touch: swipe left/right · Desktop: drag the card or use Pass/Like.</p>
      </section>

      <section className="hlc-match-liked" aria-labelledby="liked-providers-heading">
        <div className="hlc-match-liked-heading">
          <div>
            <p className="hlc-match-eyebrow">Your picks</p>
            <h2 id="liked-providers-heading">Liked providers</h2>
          </div>
          <span>{likedProviders.length}</span>
        </div>
        {likedProviders.length ? (
          <div className="hlc-match-liked-grid">
            {likedProviders.map((provider) => (
              <article key={provider.id}>
                <div className="hlc-match-mini-avatar">{initials(provider)}</div>
                <div>
                  <h3>{displayName(provider)}</h3>
                  <p>{provider.specialty || "Service provider"}</p>
                  <Link to={`/providers/${provider.id}`}>View profile</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="hlc-match-muted">Tap Like or swipe right and your saved picks will appear here.</p>
        )}
      </section>
    </main>
  );
}

function displayName(provider: Contractor) {
  return provider.company_name || provider.contact_name || `Provider ${provider.id}`;
}

function initials(provider: Contractor) {
  const label = displayName(provider).trim();
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "HLC";
}
