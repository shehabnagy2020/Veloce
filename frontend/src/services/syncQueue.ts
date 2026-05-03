import { db, type SyncQueueItem } from './db';
import { apiFetch, getToken } from './api';

/**
 * Add a request to the sync queue for later execution when online.
 */
export async function enqueueSync(url: string, method: string, body?: object, headers?: Record<string, string>): Promise<void> {
  await db.syncQueue.add({
    url,
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: headers || { 'Content-Type': 'application/json' },
    created_at: Date.now(),
  });
}

/**
 * Process all items in the sync queue. Called when connectivity is restored.
 */
export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const items = await db.syncQueue.orderBy('created_at').toArray();
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        ...(item.headers || {}),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body,
      });
      await db.syncQueue.delete(item.id!);
      processed++;
    } catch {
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Setup online event listener to auto-process queue when connectivity returns.
 */
export function setupOnlineSync(): () => void {
  const handler = () => {
    processSyncQueue().catch(console.error);
  };

  window.addEventListener('online', handler);

  // Also try processing on init if already online
  if (navigator.onLine) {
    processSyncQueue().catch(console.error);
  }

  return () => window.removeEventListener('online', handler);
}