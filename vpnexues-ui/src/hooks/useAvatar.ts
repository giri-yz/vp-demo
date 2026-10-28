import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export type AvatarValue = string | null; // 'fas fa-carrot' or 'data:image/...' or null

/** QA-25: localStorage keys must not embed a raw phone/user id (key enumeration
 *  leak on shared devices) — hash the identifier to a short opaque token. */
function hashKey(s: string): string {
  let h = 0x811c9dc5; // FNV-1a 32-bit
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function keyFor(userId?: string, phone?: string) {
  return `vpnexues_avatar_${hashKey(userId || phone || 'guest')}`;
}

/** Pre-QA-25 builds used the raw id/phone in the key. */
function legacyKeyFor(userId?: string, phone?: string) {
  return `vpnexues_avatar_${userId || phone || 'guest'}`;
}

/** One-time move of the value from a raw-identifier key to the hashed key. */
function migrateLegacyKey(k: string, legacy: string, onChange: () => void) {
  if (k === legacy) return;
  try {
    const v = localStorage.getItem(legacy);
    if (v !== null) {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
      localStorage.removeItem(legacy);
      onChange();
    }
  } catch { /* ignore */ }
}

export function useAvatar() {
  const { user } = useAuth();
  const [avatar, setAvatarState] = useState<AvatarValue>(null);

  useEffect(() => {
    const k = keyFor(user?.id, user?.phone);
    migrateLegacyKey(k, legacyKeyFor(user?.id, user?.phone), () => {
      window.dispatchEvent(new Event('avatar:change'));
    });
    const v = localStorage.getItem(k);
    setAvatarState(v || null);
  }, [user?.id, user?.phone]);

  const setAvatar = useCallback((val: AvatarValue) => {
    const k = keyFor(user?.id, user?.phone);
    if (val) localStorage.setItem(k, val);
    else localStorage.removeItem(k);
    setAvatarState(val);
    window.dispatchEvent(new Event('avatar:change'));
  }, [user?.id, user?.phone]);

  // listen for changes from other component
  useEffect(() => {
    const h = () => {
      const k = keyFor(user?.id, user?.phone);
      setAvatarState(localStorage.getItem(k) || null);
    };
    window.addEventListener('avatar:change', h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener('avatar:change', h); window.removeEventListener('storage', h); };
  }, [user?.id, user?.phone]);

  return { avatar, setAvatar };
}

export const AVATAR_ICONS = [
  { icon: 'fas fa-carrot', color: '#ea580c', bg: '#fff7ed' },
  { icon: 'fas fa-apple-alt', color: '#dc2626', bg: '#fef2f2' },
  { icon: 'fas fa-lemon', color: '#ca8a04', bg: '#fefce8' },
  { icon: 'fas fa-pepper-hot', color: '#dc2626', bg: '#fef2f2' },
  { icon: 'fas fa-leaf', color: '#16a34a', bg: '#f0fdf4' },
  { icon: 'fas fa-seedling', color: '#059669', bg: '#ecfdf5' },
  { icon: 'fas fa-bug', color: '#16a34a', bg: '#f0fdf4' },
  { icon: 'fas fa-robot', color: '#2563eb', bg: '#eff6ff' },
  { icon: 'fas fa-ghost', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: 'fas fa-paw', color: '#d97706', bg: '#fffbeb' },
  { icon: 'fas fa-cat', color: '#444', bg: '#f3f4f6' },
  { icon: 'fas fa-dog', color: '#92400e', bg: '#fef3c7' },
] as const;
