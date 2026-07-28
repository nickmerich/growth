import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsyncStore } from './hooks.js';

describe('useAsyncStore', () => {
  it('starts loading then resolves with data', async () => {
    const { result } = renderHook(() => useAsyncStore(() => Promise.resolve([1, 2, 3]), []));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.error).toBeNull();
  });

  it('represents a not-found record as null', async () => {
    const { result } = renderHook(() => useAsyncStore(() => Promise.resolve(null), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('captures a rejected fetch as an error', async () => {
    const boom = new Error('nope');
    const { result } = renderHook(() => useAsyncStore(() => Promise.reject(boom), []));
    await waitFor(() => expect(result.current.error).toBe(boom));
    expect(result.current.loading).toBe(false);
  });

  it('refetches when a subscription fires', async () => {
    let value = 'first';
    let trigger;
    const subscribe = (cb) => {
      trigger = cb;
      return () => {};
    };
    const { result } = renderHook(() =>
      useAsyncStore(() => Promise.resolve(value), [], { subscribe })
    );
    await waitFor(() => expect(result.current.data).toBe('first'));

    value = 'second';
    await act(async () => {
      trigger();
    });
    await waitFor(() => expect(result.current.data).toBe('second'));
  });

  it('unsubscribes on unmount', async () => {
    const unsub = vi.fn();
    const subscribe = vi.fn(() => unsub);
    const { unmount, result } = renderHook(() =>
      useAsyncStore(() => Promise.resolve(1), [], { subscribe })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    unmount();
    expect(unsub).toHaveBeenCalled();
  });
});
