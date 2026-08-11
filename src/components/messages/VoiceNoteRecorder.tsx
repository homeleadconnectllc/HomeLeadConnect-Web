import { useEffect, useRef, useState } from "react";

type Props = {
  busy: boolean;
  onUpload: (file: File, durationSeconds?: number) => Promise<void>;
};

export default function VoiceNoteRecorder({ busy, onUpload }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>();
  const [error, setError] = useState("");

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function clearRecording() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setRecordedFile(null);
    setDurationSeconds(undefined);
  }

  async function startRecording() {
    setError("");
    clearRecording();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Audio recording is unavailable in this browser. Select an audio file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: mimeType });
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        setRecordedFile(file);
        setDurationSeconds(duration);
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      startedAtRef.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone permission was not granted. Select an audio file instead.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }

  async function uploadRecording() {
    if (!recordedFile) return;
    await onUpload(recordedFile, durationSeconds);
    clearRecording();
  }

  async function selectFile(file: File | undefined) {
    if (!file) return;
    clearRecording();
    setError("");
    setRecordedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return <div style={{ display: "grid", gap: 10 }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {!recording
        ? <button type="button" disabled={busy} onClick={startRecording}>Record voice note</button>
        : <button type="button" disabled={busy} onClick={stopRecording}>Stop recording</button>}
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        Or select audio
        <input type="file" accept="audio/*" capture="user" disabled={busy || recording}
          onChange={(event) => selectFile(event.target.files?.[0])} />
      </label>
    </div>
    {recording && <p role="status">Recording… Select Stop recording when finished.</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {previewUrl && <div>
      <audio controls src={previewUrl}>Your browser does not support audio playback.</audio>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={busy} onClick={uploadRecording}>{busy ? "Uploading…" : "Upload voice note"}</button>
        <button type="button" disabled={busy} onClick={clearRecording}>Cancel</button>
      </div>
    </div>}
  </div>;
}
