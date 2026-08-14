import { useMemo, useState } from "react";
import { trackAnalyticsEvent } from "../../api/analytics";

type Capability = { label: string; ready: boolean; detail: string };

type ExperimentalWindow = Window & {
  BarcodeDetector?: unknown;
  NDEFReader?: unknown;
};

export default function FieldDeviceCenter() {
  const [locationStatus, setLocationStatus] = useState("");
  const [error, setError] = useState("");

  const capabilities = useMemo<Capability[]>(() => {
    const experimental = window as ExperimentalWindow;
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    return [
      { label: "Installable app shell", ready: "serviceWorker" in navigator, detail: standalone ? "Running as an installed/standalone HLC app." : "Browser mode; installation depends on the browser and device." },
      { label: "Background alerts", ready: "PushManager" in window && "Notification" in window, detail: "Used for HLC workflow, call, missed-call, and voicemail alerts after permission." },
      { label: "Microphone", ready: Boolean(navigator.mediaDevices?.getUserMedia), detail: "Available for agent voice input and communication workflows after permission." },
      { label: "Camera capture", ready: Boolean(navigator.mediaDevices?.getUserMedia), detail: "Browser camera APIs can support future jobsite photos, documents, and field evidence." },
      { label: "Location", ready: "geolocation" in navigator, detail: "Available only when the user explicitly grants location permission." },
      { label: "Barcode / material scanning", ready: Boolean(experimental.BarcodeDetector), detail: "Can support material/SKU capture on browsers that expose BarcodeDetector." },
      { label: "NFC-ready browser", ready: Boolean(experimental.NDEFReader), detail: "Can support future HLC job, equipment, or site tags where Web NFC is available." },
      { label: "Device share sheet", ready: Boolean(navigator.share), detail: "Allows HLC links and records to use the device's native share interface." },
      { label: "Haptic feedback", ready: "vibrate" in navigator, detail: "Can provide optional tactile feedback on supported Android-class devices." },
    ];
  }, []);

  function testLocation() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("This device does not expose browser location services.");
      return;
    }
    setLocationStatus("Requesting location permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Math.round(position.coords.accuracy);
        setLocationStatus(`Location services are available (about ${accuracy} m accuracy). Coordinates are not stored by this test.`);
        trackAnalyticsEvent("field_location_tested", { accuracy_bucket: accuracy <= 25 ? "high" : accuracy <= 100 ? "medium" : "coarse" });
      },
      (reason) => {
        setLocationStatus("");
        setError(reason.message || "Location permission was not granted.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function testShare() {
    setError("");
    if (!navigator.share) {
      setError("The native device share sheet is not available in this browser.");
      return;
    }
    try {
      await navigator.share({ title: "HomeLead Connect", text: "HomeLead Connect workspace", url: window.location.origin });
      trackAnalyticsEvent("device_share_tested");
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Unable to open the device share sheet.");
    }
  }

  return (
    <section className="hlc-field-device-center" aria-labelledby="hlc-field-device-title">
      <div className="hlc-field-device-heading">
        <div>
          <p>Device & field tools</p>
          <h2 id="hlc-field-device-title">HLC hardware readiness</h2>
          <span>Capability detection for phones, tablets, Macs, Windows PCs, jobsite devices, and future field workflows. HLC asks for hardware permission only when a feature needs it.</span>
        </div>
      </div>

      <div className="hlc-field-capability-grid">
        {capabilities.map((capability) => (
          <article key={capability.label} className={capability.ready ? "is-ready" : "is-limited"}>
            <strong>{capability.ready ? "Ready" : "Limited"}</strong>
            <h3>{capability.label}</h3>
            <p>{capability.detail}</p>
          </article>
        ))}
      </div>

      <div className="hlc-field-device-actions">
        <button type="button" onClick={testLocation}>Test location services</button>
        <button type="button" onClick={() => void testShare()}>Test device share</button>
      </div>
      {locationStatus && <p role="status">{locationStatus}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    </section>
  );
}
