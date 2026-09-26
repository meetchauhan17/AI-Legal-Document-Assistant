/**
 * In-memory document session store for Next.js API Routes
 */

interface StoredDoc {
  id: string;
  text: string;
  preview: string;
  timestamp: number;
}

const docStore = new Map<string, StoredDoc>();

export function storeDocument(id: string, text: string): void {
  // Evict old sessions if more than 50
  if (docStore.size > 50) {
    const oldestKey = docStore.keys().next().value;
    if (oldestKey) docStore.delete(oldestKey);
  }
  docStore.set(id, {
    id,
    text,
    preview: text.slice(0, 500),
    timestamp: Date.now(),
  });
}

export function getDocument(id: string): StoredDoc | undefined {
  return docStore.get(id);
}
