import { BaseDriver } from './BaseDriver';
import fs from 'fs';
import path from 'path';
export class SqliteDriver extends BaseDriver {
    constructor(SQLite, options) {
        super();
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "SQLite", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.SQLite = SQLite;
        this.options = options;
    }
    async initialize() {
        // Ensure directory exists
        const dir = path.dirname(this.options.path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Initialize database
        this.db = new this.SQLite(this.options.path);
        // Create tables if they don't exist
        if (this.db) {
            this.db.exec(`
        -- Users table
        CREATE TABLE IF NOT EXISTS premium_users (
          id TEXT PRIMARY KEY,
          tier TEXT NOT NULL,
          expires_at INTEGER,
          metadata TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        -- Gift codes table
        CREATE TABLE IF NOT EXISTS premium_gift_codes (
          code TEXT PRIMARY KEY,
          tier TEXT NOT NULL,
          duration TEXT,
          max_uses INTEGER NOT NULL DEFAULT 1,
          used_count INTEGER NOT NULL DEFAULT 0,
          disabled INTEGER NOT NULL DEFAULT 0,
          expires_at INTEGER,
          metadata TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
        }
    }
    async shutdown() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    // User methods
    async getUser(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM premium_users WHERE id = ?
    `);
        const row = stmt.get(userId);
        if (!row)
            return null;
        return this._parseUserRow(row);
    }
    async setUser(userId, data) {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = Date.now();
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO premium_users (id, tier, expires_at, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        // Get existing user to preserve created_at if it exists
        const existingUser = await this.getUser(userId);
        const createdAt = existingUser?.createdAt?.getTime() || now;
        stmt.run(userId, data.tier, data.expiresAt ? data.expiresAt.getTime() : null, data.metadata ? JSON.stringify(data.metadata) : null, createdAt, now);
    }
    async removeUser(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      DELETE FROM premium_users WHERE id = ?
    `);
        stmt.run(userId);
    }
    async getAllUsers() {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM premium_users
    `);
        const rows = stmt.all();
        return rows.map((row) => this._parseUserRow(row));
    }
    async getUsersByTier(tier) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM premium_users WHERE tier = ?
    `);
        const rows = stmt.all(tier);
        return rows.map((row) => this._parseUserRow(row));
    }
    async getExpiredUsers() {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = Date.now();
        const stmt = this.db.prepare(`
      SELECT * FROM premium_users
      WHERE expires_at IS NOT NULL
      AND expires_at < ?
    `);
        const rows = stmt.all(now);
        return rows.map((row) => this._parseUserRow(row));
    }
    // Gift code methods
    async createGiftCode(data) {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = Date.now();
        const stmt = this.db.prepare(`
      INSERT INTO premium_gift_codes (
        code, tier, duration, max_uses, used_count, disabled, expires_at, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(data.code, data.tier, data.duration, data.maxUses, data.usedCount, data.disabled ? 1 : 0, data.expiresAt ? data.expiresAt.getTime() : null, data.metadata ? JSON.stringify(data.metadata) : null, now, now);
        return data.code;
    }
    async getGiftCode(code) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM premium_gift_codes WHERE code = ?
    `);
        const row = stmt.get(code);
        if (!row)
            return null;
        return this._parseGiftCodeRow(row);
    }
    async useGiftCode(code) {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = Date.now();
        const stmt = this.db.prepare(`
      UPDATE premium_gift_codes
      SET used_count = used_count + 1, updated_at = ?
      WHERE code = ?
    `);
        stmt.run(now, code);
    }
    async disableGiftCode(code) {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = Date.now();
        const stmt = this.db.prepare(`
      UPDATE premium_gift_codes
      SET disabled = 1, updated_at = ?
      WHERE code = ?
    `);
        stmt.run(now, code);
    }
    async listGiftCodes(filter) {
        if (!this.db)
            throw new Error('Database not initialized');
        let query = 'SELECT * FROM premium_gift_codes';
        const params = [];
        if (filter) {
            const conditions = [];
            for (const [key, value] of Object.entries(filter)) {
                let dbKey = key;
                // Convert camelCase to snake_case
                if (key === 'maxUses')
                    dbKey = 'max_uses';
                if (key === 'usedCount')
                    dbKey = 'used_count';
                if (key === 'expiresAt')
                    dbKey = 'expires_at';
                conditions.push(`${dbKey} = ?`);
                params.push(value);
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
        }
        const stmt = this.db.prepare(query);
        const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
        return rows.map((row) => this._parseGiftCodeRow(row));
    }
    // Helper methods
    _parseUserRow(row) {
        return {
            id: row.id,
            tier: row.tier,
            expiresAt: row.expires_at ? new Date(row.expires_at) : null,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
    _parseGiftCodeRow(row) {
        return {
            code: row.code,
            tier: row.tier,
            duration: row.duration,
            maxUses: row.max_uses,
            usedCount: row.used_count,
            disabled: !!row.disabled,
            expiresAt: row.expires_at ? new Date(row.expires_at) : null,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
//# sourceMappingURL=SqliteDriver.js.map