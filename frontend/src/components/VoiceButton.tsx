"use client";

import { useEffect, useRef, useState } from "react";

// Minimal SpeechRecognition interface - not in all TypeScript DOM libs
interface SR {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SRConstructor {
  new (): SR;
}

interface Props {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onResult, disabled }: Props) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SR | null>(null);

  useEffect(() => {
    const SRClass =
      (window as Window & { SpeechRecognition?: SRConstructor }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: SRConstructor }).webkitSpeechRecognition;
    setSupported(!!SRClass);
  }, []);

  const toggle = () => {
    const SRClass =
      (window as Window & { SpeechRecognition?: SRConstructor }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: SRConstructor }).webkitSpeechRecognition;

    if (!SRClass) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new SRClass();
    recognition.lang = "pt-MZ";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) onResult(transcript);
    };

    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={recording ? "Parar gravação" : "Ativar entrada por voz"}
      title={recording ? "Parar gravação" : "Falar em vez de escrever"}
      className={[
        "w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
        recording
          ? "bg-red-100 animate-pulse"
          : "bg-[var(--primary-light)] hover:bg-[var(--primary-muted)]",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {recording ? (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="var(--primary-dark)"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
}
