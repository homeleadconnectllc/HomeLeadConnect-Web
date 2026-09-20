import { useEffect, useState } from "react";

type SinkCapableAudio = HTMLAudioElement & { setSinkId?: (deviceId: string) => Promise<void> };

export default function AudioDeviceCenter() {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [inputId, setInputId] = useState(() => localStorage.getItem("hlc-audio-input-id") || "");
  const [outputId, setOutputId] = useState(() => localStorage.getItem("hlc-audio-output-id") || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const supported = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.enumerateDevices);
  const outputRoutingSupported = typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype;

  async function refreshDevices(requestPermission = false) {
    if (!supported) return;
    setError("");
    let permissionStream: MediaStream | null = null;
    try {
      if (requestPermission) permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setInputs(devices.filter((device) => device.kind === "audioinput"));
      setOutputs(devices.filter((device) => device.kind === "audiooutput"));
      setStatus("Audio devices refreshed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to access audio devices.");
    } finally {
      permissionStream?.getTracks().forEach((track) => track.stop());
    }
  }

  useEffect(() => {
    if (!supported) return;
    let active = true;

    const loadSnapshot = () => {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          if (!active) return;
          setInputs(devices.filter((device) => device.kind === "audioinput"));
          setOutputs(devices.filter((device) => device.kind === "audiooutput"));
        })
        .catch(() => {
          // Device labels may remain unavailable until the user grants microphone permission.
        });
    };

    void Promise.resolve().then(loadSnapshot);
    navigator.mediaDevices.addEventListener?.("devicechange", loadSnapshot);
    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener?.("devicechange", loadSnapshot);
    };
  }, [supported]);

  function chooseInput(value: string) {
    setInputId(value);
    if (value) localStorage.setItem("hlc-audio-input-id", value); else localStorage.removeItem("hlc-audio-input-id");
  }

  function chooseOutput(value: string) {
    setOutputId(value);
    if (value) localStorage.setItem("hlc-audio-output-id", value); else localStorage.removeItem("hlc-audio-output-id");
  }

  async function testMicrophone() {
    if (!supported) return;
    setError(""); setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: inputId ? { deviceId: { exact: inputId } } : true,
      });
      const track = stream.getAudioTracks()[0];
      setStatus(`Microphone available${track?.label ? `: ${track.label}` : "."}`);
      stream.getTracks().forEach((item) => item.stop());
      await refreshDevices(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Microphone test failed.");
    }
  }

  async function testOutput() {
    setError(""); setStatus("");
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error("Audio output testing is not supported in this browser.");
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const destination = context.createMediaStreamDestination();
      gain.gain.value = 0.045;
      oscillator.frequency.value = 660;
      oscillator.connect(gain).connect(destination);
      const audio = new Audio() as SinkCapableAudio;
      audio.srcObject = destination.stream;
      if (outputId && audio.setSinkId) await audio.setSinkId(outputId);
      await audio.play();
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        audio.pause();
        audio.srcObject = null;
        void context.close();
      }, 450);
      setStatus(outputRoutingSupported ? "Output test played on the selected device." : "Output test played using the operating system's current audio route.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Output test failed.");
    }
  }

  if (!supported) return <section className="hlc-ui-card-ea9374"><h2>Audio devices</h2><p>Your current browser does not expose audio-device management. Use the operating system audio controls.</p></section>;

  return (
    <section className="hlc-ui-card-ea9374" aria-labelledby="hlc-audio-device-title">
      <div className="hlc-ui-header-d26a7f">
        <div>
          <p className="hlc-ui-eyebrow-0f6b46">Calls · agents · voice</p>
          <h2 id="hlc-audio-device-title" className="hlc-ui-margin-17a868">Audio devices</h2>
          <p className="hlc-ui-audio-device-center-de73d4">Choose and test available microphones and, where supported, speakers or headphones.</p>
        </div>
        <button type="button" onClick={() => void refreshDevices(true)}>Allow / refresh devices</button>
      </div>

      <div className="hlc-ui-grid-e24c4c">
        <label className="hlc-ui-label-31f694">Microphone
          <select value={inputId} onChange={(event) => chooseInput(event.target.value)}>
            <option value="">System default</option>
            {inputs.map((device, index) => <option key={device.deviceId || `input-${index}`} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}
          </select>
          <button type="button" onClick={() => void testMicrophone()}>Test microphone</button>
        </label>

        <label className="hlc-ui-label-31f694">Speaker / headphones
          <select value={outputId} onChange={(event) => chooseOutput(event.target.value)} disabled={!outputRoutingSupported}>
            <option value="">System default</option>
            {outputs.map((device, index) => <option key={device.deviceId || `output-${index}`} value={device.deviceId}>{device.label || `Audio output ${index + 1}`}</option>)}
          </select>
          <button type="button" onClick={() => void testOutput()}>Test output</button>
          {!outputRoutingSupported && <small className="hlc-ui-color-acc22d">This browser keeps speaker/headphone routing in the operating system audio controls.</small>}
        </label>
      </div>

      {status && <p role="status" className="hlc-ui-audio-device-center-903c4c">{status}</p>}
      {error && <p role="alert" className="hlc-ui-audio-device-center-016834">{error}</p>}
    </section>
  );
}
