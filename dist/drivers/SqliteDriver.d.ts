import { BaseDriver } from './BaseDriver';
import { GiftCodeData, UserData } from '../types';
interface SqliteOptions {
    path: string;
}
export declare class SqliteDriver extends BaseDriver {
    private db;
    private options;
    private SQLite;
    constructor(SQLite: any, options: SqliteOptions);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getUser(userId: string): Promise<UserData | null>;
    setUser(userId: string, data: UserData): Promise<void>;
    removeUser(userId: string): Promise<void>;
    getAllUsers(): Promise<UserData[]>;
    getUsersByTier(tier: string): Promise<UserData[]>;
    getExpiredUsers(): Promise<UserData[]>;
    createGiftCode(data: GiftCodeData): Promise<string>;
    getGiftCode(code: string): Promise<GiftCodeData | null>;
    useGiftCode(code: string): Promise<void>;
    disableGiftCode(code: string): Promise<void>;
    listGiftCodes(filter?: object): Promise<GiftCodeData[]>;
    private _parseUserRow;
    private _parseGiftCodeRow;
}
export {};
//# sourceMappingURL=SqliteDriver.d.ts.map