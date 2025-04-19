import * as SecureStore from 'expo-secure-store';
import type {SQLiteDatabase} from "expo-sqlite";

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPlayerName(): Promise<string | null> {
    return await SecureStore.getItemAsync('playerName');
}

export async function setPlayerName(playerName: string | null): Promise<void> {
    if (playerName === null) await SecureStore.deleteItemAsync('playerName');
    else await SecureStore.setItemAsync('playerName', playerName);
}

export async function getPlayerId(): Promise<number> {
    const id = await SecureStore.getItemAsync('playerId');
    if (!id) {
        return -1;
    }
    return Number(id)
}

export async function setPlayerId(playerId: number): Promise<void> {
    if (playerId > 0) await SecureStore.setItemAsync('playerId', playerId.toString());
    else await SecureStore.deleteItemAsync('playerId');
}

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
    const DATABASE_VERSION = 1;
    const current = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    let currentDbVersion = -1;

    if (current) {
        currentDbVersion = current.user_version;
    }

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    if (currentDbVersion === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            CREATE TABLE IF NOT EXISTS route_progress (
                progress_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                route_id      INTEGER NOT NULL,
                user_id       INTEGER NOT NULL,
                question_id   INTEGER NOT NULL,
                answer_id     INTEGER NOT NULL,
                answered_at   DATETIME NOT NULL DEFAULT (DATETIME('now', 'localtime'))
            );
        `);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}