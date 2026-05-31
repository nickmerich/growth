import { useEffect, useState } from 'react';
import QR from 'qrcode';

// Renders a QR code as a PNG data URL and offers a download.
export function QRCode({ value, size = 240, className = '', downloadName = 'igryt-qr.png' }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    QR.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: '#0A0A0A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-white/5 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gryt-mute">generating…</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <img
        src={dataUrl}
        width={size}
        height={size}
        alt="Event QR code"
        className="rounded-2xl bg-white p-3 shadow-lg shadow-black/40"
      />
      <a href={dataUrl} download={downloadName} className="gryt-btn-secondary text-xs">
        Download QR (PNG)
      </a>
    </div>
  );
}
