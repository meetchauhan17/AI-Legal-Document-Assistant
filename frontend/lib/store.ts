/**
 * @fileoverview In-memory document session store for Next.js Serverless API routes.
 *
 * Maintains a bounded LRU-style Map of uploaded documents keyed by UUID.
 * Documents are automatically evicted when the store exceeds MAX_SESSIONS,
 * preventing unbounded memory growth in long-running serverless instances.
 *
 * Note: This store is process-local. In multi-instance deployments each
 * Vercel serverless function has its own isolated memory; for cross-replica
 * persistence use an external store such as Upstash Redis.
 */

/** Maximum number of concurrent document sessions held in memory. */
const MAX_SESSIONS = 50;

/** Shape of a stored document entry. */
interface StoredDoc {
  /** Unique document session identifier (UUID v4). */
  id: string;
  /** Full extracted text of the uploaded document. */
  text: string;
  /** Truncated preview of the first 500 characters. */
  preview: string;
  /** Unix epoch timestamp (ms) of when the document was stored. */
  timestamp: number;
}

/** Module-level singleton store. Shared across requests within one function instance. */
const docStore = new Map<string, StoredDoc>();

/**
 * Stores a document in the session cache.
 *
 * If the store already holds MAX_SESSIONS entries, the oldest entry is evicted
 * before inserting the new one (LRU-style eviction by insertion order).
 *
 * @param id   - Unique document session ID (UUID v4).
 * @param text - Full extracted document text.
 */
export function storeDocument(id: string, text: string): void {
  if (docStore.size >= MAX_SESSIONS) {
    const oldestKey = docStore.keys().next().value;
    if (oldestKey !== undefined) {
      docStore.delete(oldestKey);
    }
  }

  docStore.set(id, {
    id,
    text,
    preview: text.slice(0, 500),
    timestamp: Date.now(),
  });
}

/**
 * Retrieves a stored document by session ID.
 *
 * @param id - The document session ID to look up.
 * @returns The stored document, or `undefined` if not found / already evicted.
 */
export function getDocument(id: string): StoredDoc | undefined {
  return docStore.get(id);
}

/**
 * Returns the number of documents currently held in the session store.
 * Useful for health-check and diagnostics endpoints.
 */
export function getSessionCount(): number {
  return docStore.size;
}
