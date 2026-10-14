const express = require("express");

const db = require("../database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

/* =====================================================
   DIFFICULTY HISTORY TABLE
===================================================== */

db.exec(`
    CREATE TABLE IF NOT EXISTS difficulty_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        session_id INTEGER,
        old_difficulty INTEGER NOT NULL,
        new_difficulty INTEGER NOT NULL,
        prediction INTEGER,
        confidence REAL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


/* =====================================================
   START GAME SESSION
   POST /api/gameplay/session/start
===================================================== */

router.post(
    "/session/start",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const result = db
                .prepare(`
                    INSERT INTO game_sessions
                    (
                        player_id,
                        final_score,
                        final_hits,
                        final_misses,
                        final_accuracy,
                        final_difficulty
                    )
                    VALUES (?, 0, 0, 0, 0, 1)
                `)
                .run(playerId);


            const sessionId =
                Number(result.lastInsertRowid);


            /* Record SESSION_START telemetry */

            db.prepare(`
                INSERT INTO performance_events
                (
                    player_id,
                    session_id,
                    event_type,
                    difficulty,
                    score,
                    hits,
                    misses,
                    accuracy,
                    reaction_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                playerId,
                sessionId,
                "SESSION_START",
                1,
                0,
                0,
                0,
                0,
                0
            );


            res.status(201).json({

                success: true,

                message:
                    "Game session started",

                sessionId

            });


        } catch (error) {

            console.error(
                "SESSION START ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to start game session"

            });

        }

    }
);


/* =====================================================
   RECORD GAMEPLAY EVENT
   POST /api/gameplay/event
===================================================== */

router.post(
    "/event",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const {
                sessionId,
                eventType,
                difficulty,
                score,
                hits,
                misses,
                accuracy,
                reactionTime
            } = req.body;


            /* Validate required fields */

            if (
                !sessionId ||
                !eventType ||
                difficulty === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "sessionId, eventType and difficulty are required"

                });

            }


            /* Check session ownership */

            const session =
                db
                    .prepare(`
                        SELECT id
                        FROM game_sessions
                        WHERE id = ?
                        AND player_id = ?
                    `)
                    .get(
                        sessionId,
                        playerId
                    );


            if (!session) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Game session not found"

                });

            }


            /* Insert telemetry */

            const result =
                db
                    .prepare(`
                        INSERT INTO performance_events
                        (
                            player_id,
                            session_id,
                            event_type,
                            difficulty,
                            score,
                            hits,
                            misses,
                            accuracy,
                            reaction_time
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `)
                    .run(

                        playerId,

                        sessionId,

                        eventType,

                        Number(difficulty),

                        Number(score) || 0,

                        Number(hits) || 0,

                        Number(misses) || 0,

                        Number(accuracy) || 0,

                        Number(reactionTime) || 0

                    );


            res.status(201).json({

                success: true,

                message:
                    "Gameplay event recorded",

                eventId:
                    Number(result.lastInsertRowid)

            });


        } catch (error) {

            console.error(
                "GAMEPLAY EVENT ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to record gameplay event"

            });

        }

    }
);


/* =====================================================
   RECORD DIFFICULTY CHANGE
   POST /api/gameplay/difficulty-history
===================================================== */

router.post(
    "/difficulty-history",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const {
                sessionId,
                oldDifficulty,
                newDifficulty,
                prediction,
                confidence,
                reason
            } = req.body;


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                oldDifficulty === undefined ||
                newDifficulty === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "oldDifficulty and newDifficulty are required"

                });

            }


            /* -----------------------------------------
               INSERT DIFFICULTY HISTORY
            ----------------------------------------- */

            const result =
                db.prepare(`
                    INSERT INTO difficulty_history
(
    player_id,
    session_id,
    old_level,
    new_level,
    prediction,
    confidence,
    reason
)
VALUES (?, ?, ?, ?, ?, ?, ?)
                `)
                .run(

                    playerId,

                    sessionId || null,

                    Number(oldDifficulty),

                    Number(newDifficulty),

                    prediction !== undefined
                        ? Number(prediction)
                        : null,

                    confidence !== undefined
                        ? Number(confidence)
                        : null,

                    reason || "UNKNOWN"

                );


            res.status(201).json({

                success: true,

                message:
                    "Difficulty change recorded",

                historyId:
                    Number(result.lastInsertRowid)

            });


        } catch (error) {

            console.error(
                "DIFFICULTY HISTORY ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to record difficulty history"

            });

        }

    }
);


/* =====================================================
   GET DIFFICULTY HISTORY
   GET /api/gameplay/difficulty-history
===================================================== */

router.get(
    "/difficulty-history",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const history =
                db.prepare(`
                   SELECT
    id,
    session_id,
    old_level,
    new_level,
    prediction,
    confidence,
    reason,
    timestamp
FROM difficulty_history
                    WHERE player_id = ?
                    ORDER BY timestamp DESC
                `)
                .all(playerId);


            res.json({

                success: true,

                history

            });


        } catch (error) {

            console.error(
                "GET DIFFICULTY HISTORY ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve difficulty history"

            });

        }

    }
);


/* =====================================================
   END GAME SESSION
   POST /api/gameplay/session/end
===================================================== */

router.post(
    "/session/end",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const {
                sessionId,
                score,
                hits,
                misses,
                accuracy,
                difficulty
            } = req.body;


            if (!sessionId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "sessionId is required"

                });

            }


            /* Check session */

            const session =
                db
                    .prepare(`
                        SELECT id
                        FROM game_sessions
                        WHERE id = ?
                        AND player_id = ?
                    `)
                    .get(
                        sessionId,
                        playerId
                    );


            if (!session) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Game session not found"

                });

            }


            /* Update final session statistics */

            db.prepare(`
                UPDATE game_sessions
                SET
                    ended_at = CURRENT_TIMESTAMP,
                    final_score = ?,
                    final_hits = ?,
                    final_misses = ?,
                    final_accuracy = ?,
                    final_difficulty = ?
                WHERE id = ?
                AND player_id = ?
            `).run(

                Number(score) || 0,

                Number(hits) || 0,

                Number(misses) || 0,

                Number(accuracy) || 0,

                Number(difficulty) || 1,

                sessionId,

                playerId

            );


            /* Record SESSION_END */

            db.prepare(`
                INSERT INTO performance_events
                (
                    player_id,
                    session_id,
                    event_type,
                    difficulty,
                    score,
                    hits,
                    misses,
                    accuracy,
                    reaction_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(

                playerId,

                sessionId,

                "SESSION_END",

                Number(difficulty) || 1,

                Number(score) || 0,

                Number(hits) || 0,

                Number(misses) || 0,

                Number(accuracy) || 0,

                0

            );


            res.json({

                success: true,

                message:
                    "Game session completed"

            });


        } catch (error) {

            console.error(
                "SESSION END ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to end game session"

            });

        }

    }
);


/* =====================================================
   GET SESSION EVENTS
   GET /api/gameplay/session/:sessionId/events
===================================================== */

router.get(
    "/session/:sessionId/events",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const sessionId =
                Number(req.params.sessionId);


            const events =
                db
                    .prepare(`
                        SELECT
                            id,
                            event_type,
                            difficulty,
                            score,
                            hits,
                            misses,
                            accuracy,
                            reaction_time,
                            timestamp
                        FROM performance_events
                        WHERE
                            session_id = ?
                            AND player_id = ?
                        ORDER BY timestamp ASC
                    `)
                    .all(
                        sessionId,
                        playerId
                    );


            res.json({

                success: true,

                sessionId,

                events

            });


        } catch (error) {

            console.error(
                "GET EVENTS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve session events"

            });

        }

    }
);


/* =====================================================
   GET PLAYER SESSIONS
   GET /api/gameplay/sessions
===================================================== */

router.get(
    "/sessions",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            const sessions =
                db
                    .prepare(`
                        SELECT
                            id,
                            started_at,
                            ended_at,
                            final_score,
                            final_hits,
                            final_misses,
                            final_accuracy,
                            final_difficulty
                        FROM game_sessions
                        WHERE player_id = ?
                        ORDER BY started_at DESC
                    `)
                    .all(playerId);


            res.json({

                success: true,

                sessions

            });


        } catch (error) {

            console.error(
                "GET SESSIONS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve game sessions"

            });

        }

    }
);


module.exports = router;/* =====================================================
   ANALYTICS DASHBOARD
   GET /api/gameplay/analytics
===================================================== */

router.get(
    "/analytics",
    authenticateToken,
    (req, res) => {

        try {

            const playerId =
                req.user.playerId;


            /* ==============================
               SESSION SUMMARY
            ============================== */

            const sessionStats =
                db.prepare(`
                    SELECT
                        COUNT(*) AS total_sessions,

                        COALESCE(
                            SUM(final_score),
                            0
                        ) AS total_score,

                        COALESCE(
                            SUM(final_hits),
                            0
                        ) AS total_hits,

                        COALESCE(
                            SUM(final_misses),
                            0
                        ) AS total_misses,

                        COALESCE(
                            AVG(final_accuracy),
                            0
                        ) AS average_accuracy,

                        COALESCE(
                            AVG(final_difficulty),
                            0
                        ) AS average_difficulty

                    FROM game_sessions

                    WHERE player_id = ?
                `)
                .get(playerId);


            /* ==============================
               DIFFICULTY CHANGES
            ============================== */

            const difficultyStats =
                db.prepare(`
                    SELECT

                        COUNT(*) AS total_changes,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN new_level > old_level
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS increases,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN new_level < old_level
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS decreases

                    FROM difficulty_history

                    WHERE player_id = ?
                `)
                .get(playerId);


            /* ==============================
               ML STATISTICS
            ============================== */

            const mlStats =
                db.prepare(`
                    SELECT

                        COUNT(*) AS ml_decisions,

                        COALESCE(
                            AVG(confidence),
                            0
                        ) AS average_confidence,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN prediction = 1
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS ml_increases,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN prediction = -1
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS ml_decreases,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN prediction = 0
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS ml_maintains

                    FROM difficulty_history

                    WHERE
                        player_id = ?

                        AND reason LIKE 'ML_%'
                `)
                .get(playerId);


            /* ==============================
               PERFORMANCE BY DIFFICULTY
            ============================== */

            const performanceByDifficulty =
                db.prepare(`
                    SELECT

                        difficulty,

                        COUNT(*) AS events,

                        MAX(hits) AS hits,

                        MAX(misses) AS misses,

                        ROUND(
                            AVG(accuracy),
                            2
                        ) AS accuracy,

                        ROUND(
                            AVG(reaction_time),
                            2
                        ) AS reaction_time

                    FROM performance_events

                    WHERE
                        player_id = ?

                        AND event_type IN (
                            'TARGET_HIT',
                            'TARGET_MISSED'
                        )

                    GROUP BY difficulty

                    ORDER BY difficulty ASC
                `)
                .all(playerId);


            /* ==============================
               RECENT SESSIONS
            ============================== */

            const recentSessions =
                db.prepare(`
                    SELECT

                        id,

                        started_at,

                        ended_at,

                        final_score,

                        final_hits,

                        final_misses,

                        ROUND(
                            final_accuracy,
                            2
                        ) AS final_accuracy,

                        final_difficulty

                    FROM game_sessions

                    WHERE player_id = ?

                    ORDER BY started_at DESC

                    LIMIT 10
                `)
                .all(playerId);


            /* ==============================
               DIFFICULTY HISTORY
            ============================== */

            const difficultyHistory =
                db.prepare(`
                    SELECT

                        id,

                        session_id,

                        old_level,

                        new_level,

                        prediction,

                        confidence,

                        reason,

                        timestamp

                    FROM difficulty_history

                    WHERE player_id = ?

                    ORDER BY timestamp DESC

                    LIMIT 20
                `)
                .all(playerId);


            /* ==============================
               RESPONSE
            ============================== */

            res.json({

                success: true,

                summary: {

                    totalSessions:
                        Number(
                            sessionStats.total_sessions
                        ) || 0,

                    totalScore:
                        Number(
                            sessionStats.total_score
                        ) || 0,

                    totalHits:
                        Number(
                            sessionStats.total_hits
                        ) || 0,

                    totalMisses:
                        Number(
                            sessionStats.total_misses
                        ) || 0,

                    averageAccuracy:
                        Number(
                            sessionStats.average_accuracy
                        ) || 0,

                    averageDifficulty:
                        Number(
                            sessionStats.average_difficulty
                        ) || 0

                },

                difficulty: {

                    totalChanges:
                        Number(
                            difficultyStats.total_changes
                        ) || 0,

                    increases:
                        Number(
                            difficultyStats.increases
                        ) || 0,

                    decreases:
                        Number(
                            difficultyStats.decreases
                        ) || 0

                },

                ml: {

                    decisions:
                        Number(
                            mlStats.ml_decisions
                        ) || 0,

                    averageConfidence:
                        Number(
                            mlStats.average_confidence
                        ) || 0,

                    increases:
                        Number(
                            mlStats.ml_increases
                        ) || 0,

                    decreases:
                        Number(
                            mlStats.ml_decreases
                        ) || 0,

                    maintains:
                        Number(
                            mlStats.ml_maintains
                        ) || 0

                },

                performanceByDifficulty,

                recentSessions,

                difficultyHistory

            });

        } catch (error) {

            console.error(
                "ANALYTICS ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve analytics"

            });

        }

    }
);


module.exports = router;