/**
 * StorageService - IndexedDB wrapper for session history
 * Manages persistent storage of earning sessions with automatic cleanup
 */

class StorageService {
  constructor() {
    this.dbName = 'PEPETOR_Miner';
    this.storeName = 'sessions';
    this.maxSessions = 2000; // Store up to 2000 sessions
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('[StorageService] Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('[StorageService] Initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          console.log('[StorageService] Created object store');
        }
      };
    });
  }

  /**
   * Add a session record
   */
  async addSession(sessionData) {
    if (!this.initialized) await this.init();

    const session = {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      ...sessionData,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[StorageService] Session added:', session.id);
        // Cleanup old sessions if needed
        this.cleanupOldSessions();
        resolve(request.result);
      };
    });
  }

  /**
   * Get all sessions
   */
  async getAllSessions() {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  /**
   * Get sessions for a specific date
   */
  async getSessionsByDate(date) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('date');
      const request = index.getAll(date);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  /**
   * Get sessions within a date range
   */
  async getSessionsInRange(startDate, endDate) {
    if (!this.initialized) await this.init();

    const allSessions = await this.getAllSessions();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    return allSessions.filter(
      (s) => s.timestamp >= startTime && s.timestamp <= endTime
    );
  }

  /**
   * Get last N sessions
   */
  async getLastSessions(count = 30) {
    const allSessions = await this.getAllSessions();
    return allSessions.slice(-count).reverse();
  }

  /**
   * Clear all sessions
   */
  async clearAll() {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[StorageService] All sessions cleared');
        resolve();
      };
    });
  }

  /**
   * Remove old sessions if over max count
   */
  async cleanupOldSessions() {
    try {
      const allSessions = await this.getAllSessions();
      if (allSessions.length > this.maxSessions) {
        const toDelete = allSessions.length - this.maxSessions;
        const oldestSessions = allSessions.slice(0, toDelete);

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        oldestSessions.forEach((session) => {
          store.delete(session.id);
        });

        console.log('[StorageService] Cleaned up', toDelete, 'old sessions');
      }
    } catch (error) {
      console.error('[StorageService] Cleanup error:', error);
    }
  }

  /**
   * Export sessions as JSON
   */
  async exportSessions() {
    const sessions = await this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  /**
   * Get database stats
   */
  async getStats() {
    const allSessions = await this.getAllSessions();
    const totalCredits = allSessions.reduce((sum, s) => sum + (s.credits || 0), 0);
    const avgCredits = allSessions.length > 0 ? totalCredits / allSessions.length : 0;

    return {
      totalSessions: allSessions.length,
      totalCredits: Math.round(totalCredits * 100) / 100,
      avgCreditsPerSession: Math.round(avgCredits * 100) / 100,
      oldestSession: allSessions.length > 0 ? new Date(allSessions[0].timestamp).toISOString() : null,
      newestSession: allSessions.length > 0 ? new Date(allSessions[allSessions.length - 1].timestamp).toISOString() : null,
      dbSize: allSessions.length,
    };
  }
}

// Export as singleton
const storageService = new StorageService();