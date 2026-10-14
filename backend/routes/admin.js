const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../database");


// =====================================================
// ADMIN LOGIN
// POST /api/admin/login
// =====================================================

router.post("/login", (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        const adminEmail =
            process.env.ADMIN_EMAIL;

        const adminPassword =
            process.env.ADMIN_PASSWORD;


        if (!adminEmail || !adminPassword) {

            return res.status(500).json({
                success: false,
                message:
                    "Admin credentials are not configured"
            });

        }


        if (
            email.trim().toLowerCase() !==
            adminEmail.trim().toLowerCase()
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });

        }


        if (password !== adminPassword) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });

        }


        const token = jwt.sign(

            {
                role: "admin",
                email: adminEmail
            },

            process.env.ADMIN_JWT_SECRET,

            {
                expiresIn: "8h"
            }

        );


        res.json({

            success: true,

            message: "Admin login successful",

            token

        });


    } catch (error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to login as admin"

        });

    }

});


// =====================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateAdmin(req, res, next) {

    try {

        const header =
            req.headers.authorization;


        if (
            !header ||
            !header.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication required"

            });

        }


        const token =
            header.split(" ")[1];


        const decoded =
            jwt.verify(

                token,

                process.env.ADMIN_JWT_SECRET

            );


        if (decoded.role !== "admin") {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access denied"

            });

        }


        req.admin = decoded;

        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired admin session"

        });

    }

}


// =====================================================
// GET ALL REGISTERED USERS
// GET /api/admin/users
// =====================================================

router.get(
    "/users",
    authenticateAdmin,
    (req, res) => {

        try {

            const users = db.prepare(`

                SELECT

                    p.id,

                    p.name,

                    p.email,

                    p.created_at,

                    COUNT(
                        DISTINCT gs.id
                    ) AS total_sessions,

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

                ORDER BY
                    p.created_at DESC

            `).all();


            res.json({

                success: true,

                totalUsers:
                    users.length,

                users

            });


        } catch (error) {

            console.error(
                "ADMIN USERS ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve users"

            });

        }

    }
);


// =====================================================
// ADMIN SUMMARY
// GET /api/admin/summary
// =====================================================

router.get(
    "/summary",
    authenticateAdmin,
    (req, res) => {

        try {

            const summary =
                db.prepare(`

                    SELECT

                        (
                            SELECT COUNT(*)
                            FROM players
                        ) AS total_users,

                        (
                            SELECT COUNT(*)
                            FROM game_sessions
                        ) AS total_sessions,

                        (
                            SELECT COALESCE(
                                SUM(final_score),
                                0
                            )
                            FROM game_sessions
                        ) AS total_score,

                        (
                            SELECT COALESCE(
                                SUM(final_hits),
                                0
                            )
                            FROM game_sessions
                        ) AS total_hits,

                        (
                            SELECT COALESCE(
                                AVG(final_accuracy),
                                0
                            )
                            FROM game_sessions
                        ) AS average_accuracy

                `).get();


            res.json({

                success: true,

                summary

            });


        } catch (error) {

            console.error(
                "ADMIN SUMMARY ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve admin summary"

            });

        }

    }
);


module.exports = router;