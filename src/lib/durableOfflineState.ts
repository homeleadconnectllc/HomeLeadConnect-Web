export type SafeQueuedOperationKind = "message-draft" | "note-draft" | "form-draft" | "event-draft";

export type DurableDraft<T = unknown> = {
  key: string;
  kind: SafeQueuedOperationKind;
  value: T;
  updatedAt: string;
};

const DB_NAME = "homelead-connect-durable-state";
const DB_VERSION = 1;
const DRAFTS = "drafts";

function scopedKey(userId: string, key: string) {
  return `${userId.trim()}::${key.trim()}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFTS)) db.createObjectStore(DRAFTS, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open durable state"));
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(DRAFTS, mode);
      const request = run(tx.objectStore(DRAFTS));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Durable state operation failed"));
    });
  } finally {
    db.close();
  }
}

export async function saveDurableDraft<T>(userId: string, draft: Omit<DurableDraft<T>, "updatedAt">) {
  if (!userId.trim() || !draft.key.trim()) throw new Error("A user and draft key are required");
  const record: DurableDraft<T> = { ...draft, key: scopedKey(userId, draft.key), updatedAt: new Date().toISOString() };
  await withStore("readwrite", store => store.put(record));
  return record;
}

export async function loadDurableDraft<T>(userId: string, key: string): Promise<DurableDraft<T> | null> {
  if (!userId.trim() || !key.trim()) return null;
  const record = await withStore<DurableDraft<T> | undefined>("readonly", store => store.get(scopedKey(userId, key)));
  return record ?? null;
}

export async function removeDurableDraft(userId: string, key: string) {
  if (!userId.trim() || !key.trim()) return;
  await withStore("readwrite", store => store.delete(scopedKey(userId, key)));
}
