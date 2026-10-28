/**
 * JSON.stringify for injection into <script type="application/ld+json">.
 *
 * JSON.stringify does NOT escape '<' — an authored title/author containing
 * "</script><img src=x onerror=...>" would break out of the script element
 * (stored-XSS surface via CMS content). Escaping '<' as the < escape
 * sequence keeps the JSON valid while making the breakout impossible.
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
