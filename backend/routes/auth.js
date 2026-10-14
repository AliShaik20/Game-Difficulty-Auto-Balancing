const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


/* =====================================================
   REGISTER
   POST /api/auth/register
===================================================== */

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        /* Validate input */

        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters"

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        /* Check existing player */

        const existingPlayer = db
            .prepare(`
                SELECT id
                FROM players
                WHERE email = ?
            `)
            .get(normalizedEmail);


        if (existingPlayer) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered"

            });

        }


        /* Encrypt password */

        const hashedPassword =
            await bcrypt.hash(password, 10);


        /* Create player */

        const result = db
            .prepare(`
                INSERT INTO players
                (
                    name,
                    email,
                    password
                )
                VALUES (?, ?, ?)
            `)
            .run(
                name.trim(),
                normalizedEmail,
                hashedPassword
            );


        const playerId =
            Number(result.lastInsertRowid);


        /* Create JWT */

        const token = jwt.sign(

            {
                playerId: playerId,
                email: normalizedEmail
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        res.status(201).json({

            success: true,

            message:
                "Registration successful",

            token,

            player: {

                id: playerId,

                name: name.trim(),

                email: normalizedEmail

            }

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Registration failed"

        });

    }

});


/* =====================================================
   LOGIN
   POST /api/auth/login
===================================================== */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* Validate input */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        /* Find player */

        const player = db
            .prepare(`
                SELECT
                    id,
                    name,
                    email,
                    password,
                    created_at
                FROM players
                WHERE email = ?
            `)
            .get(normalizedEmail);


        if (!player) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /* Verify password */

        const passwordMatches =
            await bcrypt.compare(
                password,
                player.password
            );


        if (!passwordMatches) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /* Create JWT */

        const token = jwt.sign(

            {
                playerId: player.id,

                email: player.email

            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        res.json({

            success: true,

            message:
                "Login successful",

            token,

            player: {

                id: player.id,

                name: player.name,

                email: player.email,

                createdAt:
                    player.created_at

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Login failed"

        });

    }

});


/* =====================================================
   PROFILE
   GET /api/auth/profile
===================================================== */

router.get(
    "/profile",
    authenticateToken,
    (req, res) => {

        try {

            const player =
                db
                    .prepare(`
                        SELECT
                            id,
                            name,
                            email,
                            created_at
                        FROM players
                        WHERE id = ?
                    `)
                    .get(
                        req.user.playerId
                    );


            if (!player) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Player profile not found"

                });

            }


            res.json({

                success: true,

                player: {

                    id: player.id,

                    name: player.name,

                    email: player.email,

                    createdAt:
                        player.created_at

                }

            });


        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve profile"

            });

        }

    }
);


/* =====================================================
   LOGOUT
   POST /api/auth/logout
===================================================== */

router.post("/logout", authenticateToken, (req, res) => {

    /*
       JWT is stateless.

       The frontend will remove the stored token
       during logout.
    */

    res.json({

        success: true,

        message:
            "Logout successful"

    });

});
// =====================================================
// ADMIN - VIEW ALL REGISTERED USERS
// =====================================================

router.get("/admin/users", authenticateToken, (req, res) => {
    try {
        // Get logged-in user's information
        const admin = db.prepare(`
            SELECT id, name, email
            FROM players
            WHERE id = ?
        `).get(req.user.playerId);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Only the configured admin email can access this
        if (
            process.env.ADMIN_EMAIL &&
            admin.email.toLowerCase() !==
            process.env.ADMIN_EMAIL.toLowerCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "Admin access denied"
            });
        }

        // Get all registered users + gameplay statistics
        const users = db.prepare(`
            SELECT
                p.id,
                p.name,
                p.email,
                p.created_at,

                COUNT(DISTINCT gs.id) AS total_sessions,

                COALESCE(
                    SUM(gs.final_score),
                    0
                ) AS total_score,

                COALESCE(
                    SUM(gs.final_hits),
                    0
                ) AS total_hits,

                COALESCE(
                    SUM(gs.final_misses),
                    0
                ) AS total_misses,

                ROUND(
                    COALESCE(
                        AVG(gs.final_accuracy),
                        0
                    ),
                    2
                ) AS average_accuracy,

                ROUND(
                    COALESCE(
                        AVG(gs.final_difficulty),
                        0
                    ),
                    2
                ) AS average_difficulty

            FROM players p

            LEFT JOIN game_sessions gs
                ON p.id = gs.player_id

            GROUP BY
                p.id,
                p.name,
                p.email,
                p.created_at

            ORDER BY p.created_at DESC
        `).all();

        res.json({
            success: true,
            totalUsers: users.length,
            users
        });

    } catch (error) {
        console.error("ADMIN USERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve users"
        });
    }
});

module.exports = router;