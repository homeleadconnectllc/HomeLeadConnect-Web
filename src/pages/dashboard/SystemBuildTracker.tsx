import { useMemo, useState } from "react";
import {
  buildWorkstreamOrder,
  ownerDecisionChoices,
  systemBuildTrackerItems,
  type BuildReadiness,
  type BuildTrackerItem,
  type BuildWorkstream,
  type OwnerDecisionChoice,
} from "../../config/systemBuildTracker";

const LOCAL_DECISION_PREFIX = "hlc-build-tracker-owner-choice:";

function clampCompletion(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readinessClass(readiness: BuildReadiness) {
  return `is-${readiness.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`;
}

function localDecisionKey(id: string) {
  return `${LOCAL_DECISION_PREFIX}${id}`;
}

function readLocalDecision(id: string): OwnerDecisionChoice {
  if (typeof window === "undefined") return "Pending";
  const value = window.localStorage.getItem(localDecisionKey(id));
  return ownerDecisionChoices.includes(value as OwnerDecisionChoice)
    ? value as OwnerDecisionChoice
    : "Pending";
}

function BuildItem({ item }: { item: BuildTrackerItem }) {
  const [ownerChoice, setOwnerChoice] = useState<OwnerDecisionChoice>(() => readLocalDecision(item.id));

  function updateChoice(value: OwnerDecisionChoice) {
    setOwnerChoice(value);
    window.localStorage.setItem(localDecisionKey(item.id), value);
  }

  return (
    <article className="hlc-build-tracker-item">
      <div className="hlc-build-tracker-item-head">
        <div>
          <span>{item.workstream}</span>
          <h3>{item.title}</h3>
        </div>
        <div className="hlc-build-tracker-statuses">
          <strong>{clampCompletion(item.completion)}% complete</strong>
          <em className={readinessClass(item.readiness)}>{item.readiness}</em>
        </div>
      </div>

      <progress
        className="hlc-build-tracker-progress"
        aria-label={`${item.title} completion`}
        max={100}
        value={clampCompletion(item.completion)}
      />

      <p className="hlc-build-tracker-activity">{item.currentActivity}</p>

      <dl className="hlc-build-tracker-facts">
        {item.route && <><dt>Route</dt><dd><code>{item.route}</code></dd></>}
        {item.repository && <><dt>Repository</dt><dd>{item.repository}</dd></>}
        {item.branch && <><dt>Branch</dt><dd><code>{item.branch}</code></dd></>}
        {item.exactSha && <><dt>Exact SHA</dt><dd><code>{item.exactSha}</code></dd></>}
        {item.backend && <><dt>Backend / authority</dt><dd>{item.backend}</dd></>}
        {item.dependencies?.length && <><dt>Dependencies</dt><dd>{item.dependencies.join(" · ")}</dd></>}
        {item.evidence?.length && <><dt>Evidence</dt><dd>{item.evidence.join(" · ")}</dd></>}
        {item.remainingRisk && <><dt>Remaining risk</dt><dd>{item.remainingRisk}</dd></>}
        {item.blocker && <><dt>Blocker</dt><dd>{item.blocker}</dd></>}
        <dt>Can continue while pending</dt><dd>{item.canContinueWhilePending ? "Yes" : "No"}</dd>
        <dt>Reusable for client builds</dt><dd>{item.reusableForClientBuilds ? "Yes" : "No"}</dd>
      </dl>

      {item.decisionRequired && (
        <section className="hlc-build-tracker-decision" aria-label={`Owner decision for ${item.title}`}>
          <div className="hlc-build-tracker-decision-head">
            <div>
              <span>OWNER DECISION</span>
              <h4>Decision can be recorded without stopping unrelated work.</h4>
            </div>
            <strong>{item.canContinueWhilePending ? "Work continues while pending" : "This action is paused"}</strong>
          </div>

          {item.recommendation && <p><b>Best recommendation:</b> {item.recommendation}</p>}

          <div className="hlc-build-tracker-options">
            {item.optionA && <p><b>Option A:</b> {item.optionA}</p>}
            {item.optionB && <p><b>Option B:</b> {item.optionB}</p>}
            {item.optionC && <p><b>Option C:</b> {item.optionC}</p>}
          </div>

          <label>
            <span>Your choice</span>
            <select value={ownerChoice} onChange={(event) => updateChoice(event.target.value as OwnerDecisionChoice)}>
              {ownerDecisionChoices.map((choice) => <option value={choice} key={choice}>{choice}</option>)}
            </select>
          </label>

          <small>
            This checkpoint stores the selection only on this device as a draft. It does not merge,
            deploy, alter billing, or mutate production. Server-backed decision persistence will be
            added only after its owner-only database/RLS contract is staged and verified.
          </small>

          {item.ownerAction && <p className="hlc-build-tracker-owner-action"><b>Authority boundary:</b> {item.ownerAction}</p>}
        </section>
      )}
    </article>
  );
}

export default function SystemBuildTracker() {
  const [filter, setFilter] = useState<BuildWorkstream | "All" | "Owner Decisions">("All");

  const visibleItems = useMemo(() => {
    if (filter === "All") return systemBuildTrackerItems;
    if (filter === "Owner Decisions") return systemBuildTrackerItems.filter((item) => item.decisionRequired);
    return systemBuildTrackerItems.filter((item) => item.workstream === filter);
  }, [filter]);

  const overallCompletion = useMemo(() => {
    if (!systemBuildTrackerItems.length) return 0;
    return Math.round(systemBuildTrackerItems.reduce((sum, item) => sum + clampCompletion(item.completion), 0) / systemBuildTrackerItems.length);
  }, []);

  const releaseReadyCount = systemBuildTrackerItems.filter((item) => item.readiness === "Release Ready").length;
  const verifiedCount = systemBuildTrackerItems.filter((item) => item.readiness === "Verified").length;
  const decisionCount = systemBuildTrackerItems.filter((item) => item.decisionRequired).length;

  return (
    <main className="hlc-build-tracker">
      <header className="hlc-build-tracker-header">
        <div>
          <span className="hlc-parent-eyebrow">OWNER · SYSTEM BUILD</span>
          <h1>HCX System Build Tracker</h1>
          <p>Track the entire HomeLead Connect build without confusing implementation progress with release readiness.</p>
        </div>
      </header>

      <section className="hlc-build-tracker-summary" aria-label="Whole system progress">
        <div className="hlc-build-tracker-overall">
          <span>WHOLE SYSTEM COMPLETION</span>
          <strong>{overallCompletion}%</strong>
          <progress
            className="hlc-build-tracker-progress is-overall"
            aria-label={`${overallCompletion}% whole-system completion`}
            max={100}
            value={overallCompletion}
          />
          <small>Checklist completion only. This number does not mean production release readiness.</small>
        </div>

        <dl>
          <div><dt>Tracked areas</dt><dd>{systemBuildTrackerItems.length}</dd></div>
          <div><dt>Verified</dt><dd>{verifiedCount}</dd></div>
          <div><dt>Release ready</dt><dd>{releaseReadyCount}</dd></div>
          <div><dt>Owner decisions</dt><dd>{decisionCount}</dd></div>
        </dl>
      </section>

      <section className="hlc-build-tracker-boundary">
        <strong>Release boundary remains protected.</strong>
        <span>Owner choices recorded here do not themselves merge code, deploy production, apply migrations, or change provider billing.</span>
      </section>

      <nav className="hlc-build-tracker-filters" aria-label="Build tracker views">
        <button type="button" className={filter === "All" ? "is-active" : ""} onClick={() => setFilter("All")}>Whole System</button>
        <button type="button" className={filter === "Owner Decisions" ? "is-active" : ""} onClick={() => setFilter("Owner Decisions")}>Owner Decisions</button>
        {buildWorkstreamOrder.filter((item) => item !== "Whole System").map((workstream) => (
          <button type="button" className={filter === workstream ? "is-active" : ""} onClick={() => setFilter(workstream)} key={workstream}>{workstream}</button>
        ))}
      </nav>

      <div className="hlc-build-tracker-list">
        {visibleItems.map((item) => <BuildItem key={item.id} item={item} />)}
      </div>
    </main>
  );
}
