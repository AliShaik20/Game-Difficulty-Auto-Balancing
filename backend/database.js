const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const dbPath = path.join(dataDirectory, "game.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ended_at TEXT,
        final_score INTEGER DEFAULT 0,
        final_hits INTEGER DEFAULT 0,
        final_misses INTEGER DEFAULT 0,
        final_accuracy REAL DEFAULT 0,
        final_difficulty INTEGER DEFAULT 1,

        FOREIGN KEY (player_id)
        REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS performance_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        hits INTEGER DEFAULT 0,
        misses INTEGER DEFAULT 0,
        accuracy REAL DEFAULT 0,
        reaction_time REAL DEFAULT 0,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (player_id)
        REFERENCES players(id),

        FOREIGN KEY (session_id)
        REFERENCES game_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS difficulty_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        session_id INTEGER,
        old_level INTEGER NOT NULL,
        new_level INTEGER NOT NULL,
        prediction INTEGER NOT NULL,
        confidence REAL NOT NULL,
        reason TEXT,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (player_id)
        REFERENCES players(id),

        FOREIGN KEY (session_id)
        REFERENCES game_sessions(id)
    );
`);

console.log("DATABASE READY");
console.log(`Database: ${dbPath}`);

module.exports = db;