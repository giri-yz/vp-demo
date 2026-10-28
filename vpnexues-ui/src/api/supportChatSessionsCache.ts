import { listSessions } from './adminSupportChatsApi';
import type { ChatSessionDto } from './supportChatApi';

/**
 * Shared client-side cache + in-flight de-duplication for the admin live-chat
 * session list.
 *
 * The Support page warms it as soon as it mounts, so the "Live chat" tab can
 * paint from cache instead of starting a cold network request when it is
 * opened. Requests for the same status that are already running are shared, so
 * warming never costs an extra round-trip if the tab is opened while the warm
 * request is still in flight. Mutations always pass `fresh: true` and write the
 * result back through this module, so the cache never outlives a change made in
 * the UI.
 */

/** A hit younger than this is considered current enough to skip a revalidate. */
const FRESH_MS = 5_000;

const cache = new Map<string, { rows: ChatSessionDto[]; at: number }>();
const inflight = new Map<string, Promise<ChatSessionDto[]>>();

const keyOf = (status?: string) => status ?? '';

export interface CachedChatSessions {
  rows: ChatSessionDto[];
  /** True when the hit is recent enough that a revalidate can be skipped. */
  fresh: boolean;
}

/**
 * Returns the session list, reusing an in-flight request for the same status
 * when there is one. `fresh: true` bypasses that sharing and always issues a
 * new request (used after mutations, which must not read a pre-mutation
 * response).
 */
export function fetchChatSessions(
  status?: string,
  opts: { fresh?: boolean } = {},
): Promise<ChatSessionDto[]> {
  const key = keyOf(status);
  if (!opts.fresh) {
    const pending = inflight.get(key);
    if (pending) return pending;
  }

  const request = listSessions(status).then((rows) => {
    // Only the request that still owns the slot may write the cache — a
    // superseded (older) response must not overwrite fresher rows.
    if (inflight.get(key) === request) cache.set(key, { rows, at: Date.now() });
    return rows;
  });
  inflight.set(key, request);

  const release = () => {
    if (inflight.get(key) === request) inflight.delete(key);
  };
  void request.then(release, release);

  return request;
}

/** Cached rows for instant first paint, or null when there are none. */
export function getCachedChatSessions(status?: string): CachedChatSessions | null {
  const hit = cache.get(keyOf(status));
  if (!hit) return null;
  return { rows: hit.rows, fresh: Date.now() - hit.at <= FRESH_MS };
}

/** Warms the cache, sharing any request already running for the default list. */
export function prefetchChatSessions(): void {
  void fetchChatSessions().catch(() => {
    /* The tab revalidates when it opens and surfaces the error there. */
  });
}
