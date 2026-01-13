/**
 * Système de cache local pour mode hors-ligne
 * Stocke les données entreprises dans IndexedDB pour accès hors-ligne
 */

const DB_NAME = 'pulse_cache';
const DB_VERSION = 1;
const STORE_NAME = 'entreprises';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB non disponible');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async set<T>(key: string, data: T): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cachedData, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedData<T> | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Vérifier si le cache est expiré
        if (Date.now() - result.timestamp > CACHE_DURATION) {
          // Cache expiré, supprimer
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineStorage = new OfflineStorage();
