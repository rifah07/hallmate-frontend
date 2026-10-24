'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/client-api';
import { Avatar } from './Avatar';

type Result = { valid: boolean; status: string; name: string; universityId: string; photo: string | null; room: string | null };

// Not in TypeScript's DOM types yet. Chrome on Android has it, which is
// what a guard's phone runs; elsewhere the guard types or pastes the code.
type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => Detector;
  }
}

export function CardScanner() {
  const video = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const canScan = typeof window !== 'undefined' && !!window.BarcodeDetector;

  async function verify(token: string) {
    setError('');
    setResult(null);
    try {
      setResult(await api<Result>('/id-card/verify', { method: 'POST', json: { token: token.trim() } }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    if (!scanning || !window.BarcodeDetector) return;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    let stream: MediaStream | null = null;
    let timer = 0;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (!video.current) return;
        video.current.srcObject = s;
        void video.current.play();
        const tick = async () => {
          const [code] = video.current ? await detector.detect(video.current).catch(() => []) : [];
          if (code) {
            setScanning(false);
            void verify(code.rawValue);
          } else timer = window.setTimeout(tick, 250);
        };
        void tick();
      })
      .catch(() => {
        setError('Camera permission was refused. You can type the code instead.');
        setScanning(false);
      });
    return () => {
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning]);

  return (
    <section className="card scanner">
      <h2>Check an ID card</h2>
      {scanning ? (
        <>
          <video ref={video} muted playsInline className="scanner-video" aria-label="Camera view" />
          <button type="button" className="btn btn-quiet btn-small" onClick={() => setScanning(false)}>
            Stop camera
          </button>
        </>
      ) : (
        <div className="row">
          {canScan && (
            <button type="button" className="btn" onClick={() => setScanning(true)}>
              Scan with camera
            </button>
          )}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              void verify(String(new FormData(e.currentTarget).get('token') ?? ''));
            }}
          >
            <label className="sr-only" htmlFor="card-token">
              Card code
            </label>
            <input id="card-token" name="token" placeholder="Or paste the card code" required minLength={20} style={{ width: 'auto', flex: 1 }} />
            <button type="submit" className="btn btn-quiet">
              Check
            </button>
          </form>
        </div>
      )}
      <p className="error" role="alert">
        {error}
      </p>
      {result && (
        <div className={`verdict ${result.valid ? 'verdict-ok' : 'verdict-no'}`} role="status">
          <Avatar src={result.photo} name={result.name} size={88} />
          <div>
            <b className="verdict-title">{result.valid ? 'Resident: let her in' : 'Not valid: do not let in'}</b>
            <p style={{ margin: 0 }}>
              {result.name} · {result.universityId}
              {result.room && ` · room ${result.room}`}
            </p>
            {!result.valid && <p className="small">Account status: {result.status.replace(/_/g, ' ').toLowerCase()}</p>}
            <p className="small muted">Match the face to the photo.</p>
          </div>
        </div>
      )}
    </section>
  );
}
