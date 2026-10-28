/* Guaranteed WhatsApp handoff — page first, WhatsApp second (every browser).
 *
 * Product rule (client-confirmed): the customer must SEE the confirmation
 * first (Order Success page / B2B "inquiry received" popup); WhatsApp may
 * only appear AFTER that — 3 seconds later.
 *
 * v3 — desktop now behaves EXACTLY like mobile (client feedback):
 *   The v1/v2 approach (create a hidden popup window during the click) was
 *   rejected: Chrome clamps off-screen window coordinates to the screen
 *   corner, so a placeholder window visibly appeared at the click.
 *   Now NOTHING is created or shown at the click — no window, no focus
 *   change, no tab. The confirmation appears first, then:
 *
 *   deliverWhatsAppPopup(url)  (confirmation seen, +3 s)
 *     - window.open WITHOUT 'noopener' (a real null = blocked).
 *       Verified against Chrome: a trusted click grants popup permission
 *       for the next ~5 s, so a timer at +3 s IS allowed to open a new
 *       tab/window; the same call with no recent click is blocked.
 *     - blocked anyway -> same-tab location.href (never blocked, WhatsApp
 *       still opens — this is also how mobile browsers typically behave).
 *
 *   The call can also fire directly from a trusted click (manual
 *   "Continue on WhatsApp" buttons) — a fresh gesture always opens.
 */
export function deliverWhatsAppPopup(
  url: string,
  opts?: { sameTabFallback?: boolean },
): 'opened' | 'same-tab' | 'blocked' {
  // Fresh popup WITHOUT 'noopener': with noopener the API returns null even
  // on success, so we could never tell "blocked" from "opened".
  try {
    const o = window.open(url, '_blank');
    if (o) {
      try {
        o.opener = null; // don't let WhatsApp script back into our page
      } catch {
        /* best-effort hardening */
      }
      return 'opened';
    }
  } catch {
    /* blocked -> last resort */
  }

  // AUTO-HANDOFF (timer-driven, no trusted click): a blocked popup means the
  // browser said no — NEVER hijack the customer's tab with a same-tab
  // redirect. They came here to read the order confirmation; they stay there.
  // The visible "Continue on WhatsApp" button keeps the same-tab fallback
  // (its click is trusted, so window.open succeeds and this path is rare).
  if (opts?.sameTabFallback === false) return 'blocked';

  // Same-tab navigation is never popup-blocked — WhatsApp still opens.
  window.location.href = url;
  return 'same-tab';
}
