import { useEffect, useRef, useState } from "react";

const TRIGGER_DISTANCE = 88;
const MAX_PULL_DISTANCE = 132;

function hasIndependentScroll(target: EventTarget | null) {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const canScroll = (overflowY === "auto" || overflowY === "scroll") && element.scrollHeight > element.clientHeight;
    if (canScroll && element.scrollTop > 0) return true;
    element = element.parentElement;
  }

  return false;
}

function shouldIgnoreGesture(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [data-pull-refresh-ignore='true']"));
}

export default function GlobalPullToRefresh() {
  const startY = useRef<number | null>(null);
  const eligible = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || refreshing) return;
      if (window.scrollY > 1 || document.documentElement.scrollTop > 1) return;
      if (shouldIgnoreGesture(event.target) || hasIndependentScroll(event.target)) return;

      startY.current = event.touches[0].clientY;
      eligible.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!eligible.current || startY.current === null || event.touches.length !== 1) return;
      if (window.scrollY > 1 || document.documentElement.scrollTop > 1) {
        eligible.current = false;
        setPullDistance(0);
        return;
      }

      const rawDistance = event.touches[0].clientY - startY.current;
      if (rawDistance <= 0) {
        setPullDistance(0);
        return;
      }

      // Resistance keeps the gesture feeling native instead of tracking the finger 1:1.
      const resistedDistance = Math.min(MAX_PULL_DISTANCE, rawDistance * 0.55);
      setPullDistance(resistedDistance);
    };

    const finishGesture = () => {
      if (!eligible.current) {
        startY.current = null;
        return;
      }

      eligible.current = false;
      startY.current = null;

      if (pullDistance >= TRIGGER_DISTANCE) {
        setRefreshing(true);
        setPullDistance(TRIGGER_DISTANCE);
        window.setTimeout(() => window.location.reload(), 160);
        return;
      }

      setPullDistance(0);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", finishGesture, { passive: true });
    window.addEventListener("touchcancel", finishGesture, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finishGesture);
      window.removeEventListener("touchcancel", finishGesture);
    };
  }, [pullDistance, refreshing]);

  const progress = Math.min(1, pullDistance / TRIGGER_DISTANCE);
  const visible = pullDistance > 3 || refreshing;

  return (
    <div
      className={`hlc-pull-refresh${visible ? " is-visible" : ""}${refreshing ? " is-refreshing" : ""}`}
      aria-hidden="true"
      data-hlc-pull-refresh="global"
      style={{
        "--hlc-pull-distance": `${pullDistance}px`,
        "--hlc-pull-progress": progress,
      } as React.CSSProperties}
    >
      <span className="hlc-pull-refresh__spinner" />
      <span className="hlc-pull-refresh__label">
        {refreshing ? "Refreshing HLC…" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
      </span>
    </div>
  );
}
