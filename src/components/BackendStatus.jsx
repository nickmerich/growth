import { Cloud, CloudOff, HardDrive, AlertTriangle } from 'lucide-react';
import {
  useBackendStatus,
  useNetworkOnline,
  STATUS_OFFLINE,
  STATUS_DEGRADED,
  STATUS_ONLINE,
} from '../lib/status.js';
import { BACKEND_LOCAL } from '../lib/backend-config.js';

// Resolves the store + browser connectivity into what the operator should see.
function describe(state, networkOnline) {
  if (state.backend === BACKEND_LOCAL) {
    // Local is the default, not a failure — but if Supabase was *asked* for and
    // we fell back, say so, because the operator's data is not going where they
    // think it is.
    if (state.configError) {
      return {
        tone: 'warn',
        Icon: AlertTriangle,
        label: 'Local only',
        detail: state.configError,
      };
    }
    return {
      tone: 'muted',
      Icon: HardDrive,
      label: 'Local',
      detail: 'Saved on this device. No account or network needed.',
    };
  }

  if (!networkOnline) {
    return {
      tone: 'error',
      Icon: CloudOff,
      label: 'Offline',
      detail: 'No network. Finish taps are saved on this device and retried.',
    };
  }
  if (state.status === STATUS_OFFLINE) {
    return {
      tone: 'error',
      Icon: CloudOff,
      label: 'Not syncing',
      detail: state.lastError
        ? `Cannot reach Supabase: ${state.lastError}. Taps are saved locally — retry them.`
        : 'Cannot reach Supabase. Taps are saved locally — retry them.',
    };
  }
  if (state.status === STATUS_DEGRADED) {
    return {
      tone: 'warn',
      Icon: AlertTriangle,
      label: 'Setup problem',
      detail: state.lastError
        ? `Supabase rejected the request: ${state.lastError}. Check the API key and that migrations were applied.`
        : 'Supabase is reachable but misconfigured. Check the API key and migrations.',
    };
  }
  return {
    tone: state.status === STATUS_ONLINE ? 'ok' : 'muted',
    Icon: Cloud,
    label: state.status === STATUS_ONLINE ? 'Synced' : 'Connecting…',
    detail:
      state.status === STATUS_ONLINE
        ? 'Writes are reaching Supabase.'
        : 'Waiting for the first Supabase response.',
  };
}

const TONES = {
  ok: 'border-green-500/30 bg-green-500/10 text-green-300',
  warn: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  error: 'border-red-500/40 bg-red-500/10 text-red-300',
  muted: 'border-gryt-line bg-white/[0.04] text-gryt-mute',
};

// Compact chip for page chrome (header bars, timing station).
export function BackendStatusChip({ className = '' }) {
  const state = useBackendStatus();
  const networkOnline = useNetworkOnline();
  const { tone, Icon, label, detail } = describe(state, networkOnline);
  return (
    <span
      title={detail}
      aria-label={`Storage status: ${label}. ${detail}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONES[tone]} ${className}`}
    >
      <Icon size={11} aria-hidden="true" />
      {label}
    </span>
  );
}

// Full-width banner, shown only when something actually needs attention, so the
// default local-mode app stays visually quiet.
export function BackendStatusBanner({ className = '' }) {
  const state = useBackendStatus();
  const networkOnline = useNetworkOnline();
  const { tone, Icon, label, detail } = describe(state, networkOnline);
  if (tone !== 'error' && tone !== 'warn') return null;
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${TONES[tone]} ${className}`}
    >
      <Icon size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold uppercase tracking-wider">{label}</strong> — {detail}
      </span>
    </div>
  );
}
