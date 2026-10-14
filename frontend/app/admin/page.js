"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==============================
    // CHECK ADMIN LOGIN
    // ==============================
    useEffect(() => {
        const token = localStorage.getItem("admin_auth_token");

        if (!token) {
            window.location.href = "/admin-login";
            return;
        }

        loadUsers();
    }, []);

    // ==============================
    // LOAD ALL USERS
    // ==============================
    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("admin_auth_token");

            if (!token) {
                window.location.href = "/admin-login";
                return;
            }

            const response = await fetch(
                `${API_URL}/api/admin/users`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load users"
                );
            }

            setUsers(data.users || []);
        } catch (err) {
            console.error(
                "ADMIN USERS ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load users"
            );

            // If admin token is invalid/expired
            if (
                err.message?.toLowerCase().includes(
                    "token"
                )
            ) {
                localStorage.removeItem(
                    "admin_auth_token"
                );

                window.location.href =
                    "/admin-login";
            }
        } finally {
            setLoading(false);
        }
    }

    // ==============================
    // LOGOUT
    // ==============================
    function handleLogout() {
        localStorage.removeItem(
            "admin_auth_token"
        );

        window.location.href =
            "/admin-login";
    }

    // ==============================
    // CALCULATE SUMMARY
    // ==============================

    const totalUsers = users.length;

    const totalSessions = users.reduce(
        (sum, user) =>
            sum +
            Number(
                user.total_sessions || 0
            ),
        0
    );

    const totalScore = users.reduce(
        (sum, user) =>
            sum +
            Number(
                user.total_score || 0
            ),
        0
    );

    const totalHits = users.reduce(
        (sum, user) =>
            sum +
            Number(
                user.total_hits || 0
            ),
        0
    );

    const totalMisses = users.reduce(
        (sum, user) =>
            sum +
            Number(
                user.total_misses || 0
            ),
        0
    );

    const averageAccuracy =
        users.length > 0
            ? users.reduce(
                (sum, user) =>
                    sum +
                    Number(
                        user.average_accuracy || 0
                    ),
                0
            ) / users.length
            : 0;

    // ==============================
    // PAGE
    // ==============================

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "radial-gradient(circle at top, #3b2413 0%, #160d08 45%, #080504 100%)",
                color: "#f5d18a",
                fontFamily:
                    "Georgia, 'Times New Roman', serif",
                padding: "30px",
            }}
        >

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                        paddingBottom: "20px",
                        borderBottom:
                            "2px solid #8c5b2b",
                    }}
                >

                    <div>
                        <div
                            style={{
                                fontSize: "34px",
                                fontWeight: "bold",
                                letterSpacing:
                                    "3px",
                                color: "#f5d18a",
                            }}
                        >
                            🏹 ADMIN DASHBOARD
                        </div>

                        <div
                            style={{
                                marginTop: "7px",
                                fontSize: "14px",
                                color: "#c9a879",
                                letterSpacing:
                                    "1.5px",
                            }}
                        >
                            GAME DIFFICULTY AUTO-BALANCING SYSTEM
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                        }}
                    >

                        {/* REFRESH */}

                        <button
                            onClick={loadUsers}
                            style={{
                                background:
                                    "linear-gradient(145deg, #3e2813, #160e08)",
                                border:
                                    "2px solid #9b6b32",
                                color: "#f5d18a",
                                borderRadius:
                                    "10px",
                                padding:
                                    "12px 18px",
                                fontFamily:
                                    "Georgia, 'Times New Roman', serif",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    "bold",
                            }}
                        >
                            🔄 REFRESH
                        </button>

                        {/* GAME */}

                        <button
                            onClick={() => {
                                window.location.href =
                                    "/";
                            }}
                            style={{
                                background:
                                    "linear-gradient(145deg, #3e2813, #160e08)",
                                border:
                                    "2px solid #9b6b32",
                                color: "#f5d18a",
                                borderRadius:
                                    "10px",
                                padding:
                                    "12px 18px",
                                fontFamily:
                                    "Georgia, 'Times New Roman', serif",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    "bold",
                            }}
                        >
                            🏹 GAME
                        </button>

                        {/* LOGOUT */}

                        <button
                            onClick={handleLogout}
                            style={{
                                background:
                                    "linear-gradient(145deg, #5a1d16, #210806)",
                                border:
                                    "2px solid #b94a3a",
                                color: "#ffd4c9",
                                borderRadius:
                                    "10px",
                                padding:
                                    "12px 18px",
                                fontFamily:
                                    "Georgia, 'Times New Roman', serif",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    "bold",
                            }}
                        >
                            🚪 LOGOUT
                        </button>

                    </div>
                </div>

                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (
                    <div
                        style={{
                            background:
                                "rgba(120,20,20,0.35)",
                            border:
                                "1px solid #b94a3a",
                            color: "#ffd4c9",
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "25px",
                            textAlign:
                                "center",
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* ================================= */}
                {/* LOADING */}
                {/* ================================= */}

                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px 20px",
                            fontSize: "22px",
                            color: "#d8b77a",
                        }}
                    >
                        ⏳ Loading registered users...
                    </div>
                ) : (
                    <>
                        {/* ================================= */}
                        {/* SUMMARY CARDS */}
                        {/* ================================= */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(190px, 1fr))",
                                gap: "18px",
                                marginBottom:
                                    "30px",
                            }}
                        >

                            {/* USERS */}

                            <SummaryCard
                                icon="👥"
                                title="REGISTERED USERS"
                                value={totalUsers}
                            />

                            {/* SESSIONS */}

                            <SummaryCard
                                icon="🎮"
                                title="TOTAL SESSIONS"
                                value={totalSessions}
                            />

                            {/* SCORE */}

                            <SummaryCard
                                icon="🏆"
                                title="TOTAL SCORE"
                                value={totalScore}
                            />

                            {/* HITS */}

                            <SummaryCard
                                icon="🎯"
                                title="TOTAL HITS"
                                value={totalHits}
                            />

                            {/* MISSES */}

                            <SummaryCard
                                icon="❌"
                                title="TOTAL MISSES"
                                value={totalMisses}
                            />

                            {/* ACCURACY */}

                            <SummaryCard
                                icon="📈"
                                title="AVG ACCURACY"
                                value={`${averageAccuracy.toFixed(
                                    2
                                )}%`}
                            />

                        </div>

                        {/* ================================= */}
                        {/* USERS TABLE */}
                        {/* ================================= */}

                        <div
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(45,27,14,.96), rgba(14,8,5,.96))",
                                border:
                                    "2px solid #8c5b2b",
                                borderRadius:
                                    "16px",
                                overflow:
                                    "hidden",
                                boxShadow:
                                    "0 10px 35px rgba(0,0,0,.45)",
                            }}
                        >

                            {/* TABLE HEADER */}

                            <div
                                style={{
                                    padding:
                                        "22px 25px",
                                    borderBottom:
                                        "1px solid #6d4724",
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                }}
                            >

                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                "22px",
                                            fontWeight:
                                                "bold",
                                            color:
                                                "#f5d18a",
                                        }}
                                    >
                                        👥 REGISTERED PLAYERS
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "12px",
                                            marginTop:
                                                "5px",
                                            color:
                                                "#b99a6a",
                                        }}
                                    >
                                        Player performance and gameplay statistics
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background:
                                            "#211309",
                                        border:
                                            "1px solid #8c5b2b",
                                        padding:
                                            "8px 14px",
                                        borderRadius:
                                            "8px",
                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    {users.length} PLAYER
                                    {users.length !== 1
                                        ? "S"
                                        : ""}
                                </div>

                            </div>

                            {/* TABLE */}

                            {users.length === 0 ? (
                                <div
                                    style={{
                                        padding:
                                            "60px 20px",
                                        textAlign:
                                            "center",
                                        color:
                                            "#b99a6a",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "45px",
                                            marginBottom:
                                                "15px",
                                        }}
                                    >
                                        👤
                                    </div>

                                    No registered players found.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        overflowX:
                                            "auto",
                                    }}
                                >

                                    <table
                                        style={{
                                            width:
                                                "100%",
                                            borderCollapse:
                                                "collapse",
                                            minWidth:
                                                "1050px",
                                        }}
                                    >

                                        <thead>
                                            <tr
                                                style={{
                                                    background:
                                                        "rgba(111,72,35,.25)",
                                                }}
                                            >

                                                <TableHeader>
                                                    #
                                                </TableHeader>

                                                <TableHeader>
                                                    PLAYER
                                                </TableHeader>

                                                <TableHeader>
                                                    EMAIL
                                                </TableHeader>

                                                <TableHeader>
                                                    SESSIONS
                                                </TableHeader>

                                                <TableHeader>
                                                    SCORE
                                                </TableHeader>

                                                <TableHeader>
                                                    HITS
                                                </TableHeader>

                                                <TableHeader>
                                                    MISSES
                                                </TableHeader>

                                                <TableHeader>
                                                    ACCURACY
                                                </TableHeader>

                                                <TableHeader>
                                                    AVG DIFFICULTY
                                                </TableHeader>

                                                <TableHeader>
                                                    REGISTERED
                                                </TableHeader>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {users.map(
                                                (
                                                    user,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            user.id
                                                        }
                                                        style={{
                                                            borderTop:
                                                                "1px solid #4e321c",
                                                        }}
                                                    >

                                                        {/* NUMBER */}

                                                        <TableCell>
                                                            {index +
                                                                1}
                                                        </TableCell>

                                                        {/* PLAYER */}

                                                        <TableCell>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "10px",
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "38px",
                                                                        height:
                                                                            "38px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        background:
                                                                            "linear-gradient(145deg, #9b6b32, #4a2d12)",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                        color:
                                                                            "#fff0c9",
                                                                        fontWeight:
                                                                            "bold",
                                                                    }}
                                                                >
                                                                    {(
                                                                        user.name ||
                                                                        "U"
                                                                    )
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#f5d18a",
                                                                            fontWeight:
                                                                                "bold",
                                                                        }}
                                                                    >
                                                                        {user.name ||
                                                                            "Unknown User"}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            color:
                                                                                "#8f7657",
                                                                        }}
                                                                    >
                                                                        ID:{" "}
                                                                        {
                                                                            user.id
                                                                        }
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </TableCell>

                                                        {/* EMAIL */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        "#d8c09a",
                                                                }}
                                                            >
                                                                {user.email ||
                                                                    "-"}
                                                            </span>
                                                        </TableCell>

                                                        {/* SESSIONS */}

                                                        <TableCell>
                                                            <StatBadge>
                                                                {
                                                                    user.total_sessions
                                                                }
                                                            </StatBadge>
                                                        </TableCell>

                                                        {/* SCORE */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        "#ffd56f",
                                                                    fontWeight:
                                                                        "bold",
                                                                    fontSize:
                                                                        "16px",
                                                                }}
                                                            >
                                                                {Number(
                                                                    user.total_score ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </span>
                                                        </TableCell>

                                                        {/* HITS */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        "#7ee58b",
                                                                    fontWeight:
                                                                        "bold",
                                                                }}
                                                            >
                                                                {Number(
                                                                    user.total_hits ||
                                                                        0
                                                                )}
                                                            </span>
                                                        </TableCell>

                                                        {/* MISSES */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        "#ff8f82",
                                                                    fontWeight:
                                                                        "bold",
                                                                }}
                                                            >
                                                                {Number(
                                                                    user.total_misses ||
                                                                        0
                                                                )}
                                                            </span>
                                                        </TableCell>

                                                        {/* ACCURACY */}

                                                        <TableCell>
                                                            <div
                                                                style={{
                                                                    minWidth:
                                                                        "110px",
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        justifyContent:
                                                                            "space-between",
                                                                        marginBottom:
                                                                            "5px",
                                                                    }}
                                                                >

                                                                    <span
                                                                        style={{
                                                                            color:
                                                                                "#f5d18a",
                                                                            fontWeight:
                                                                                "bold",
                                                                        }}
                                                                    >
                                                                        {Number(
                                                                            user.average_accuracy ||
                                                                                0
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                        %
                                                                    </span>

                                                                </div>

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "100%",
                                                                        height:
                                                                            "7px",
                                                                        background:
                                                                            "#1a1009",
                                                                        borderRadius:
                                                                            "10px",
                                                                        overflow:
                                                                            "hidden",
                                                                    }}
                                                                >

                                                                    <div
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                100,
                                                                                Math.max(
                                                                                    0,
                                                                                    Number(
                                                                                        user.average_accuracy ||
                                                                                            0
                                                                                    )
                                                                                )
                                                                            )}%`,
                                                                            height:
                                                                                "100%",
                                                                            background:
                                                                                "linear-gradient(90deg, #7a4e1d, #e0a94a)",
                                                                            borderRadius:
                                                                                "10px",
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>
                                                        </TableCell>

                                                        {/* DIFFICULTY */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-block",
                                                                    padding:
                                                                        "6px 12px",
                                                                    border:
                                                                        "1px solid #8c5b2b",
                                                                    borderRadius:
                                                                        "20px",
                                                                    background:
                                                                        "#211309",
                                                                    color:
                                                                        "#f5d18a",
                                                                    fontWeight:
                                                                        "bold",
                                                                }}
                                                            >
                                                                {Number(
                                                                    user.average_difficulty ||
                                                                        0
                                                                ).toFixed(
                                                                    1
                                                                )}
                                                            </span>
                                                        </TableCell>

                                                        {/* REGISTERED */}

                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color:
                                                                        "#b99a6a",
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    user.created_at
                                                                )}
                                                            </span>
                                                        </TableCell>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>

                        {/* ================================= */}
                        {/* FOOTER */}
                        {/* ================================= */}

                        <div
                            style={{
                                marginTop: "25px",
                                textAlign: "center",
                                color: "#80694d",
                                fontSize: "12px",
                            }}
                        >
                            ADMINISTRATOR PANEL •
                            GAME DIFFICULTY AUTO-BALANCING
                            SYSTEM
                        </div>

                    </>
                )}

            </div>
        </div>
    );
}


// ============================================
// SUMMARY CARD COMPONENT
// ============================================

function SummaryCard({
    icon,
    title,
    value,
}) {
    return (
        <div
            style={{
                background:
                    "linear-gradient(145deg, rgba(53,32,16,.95), rgba(18,10,6,.95))",
                border:
                    "2px solid #754b25",
                borderRadius:
                    "14px",
                padding:
                    "20px",
                boxShadow:
                    "0 8px 25px rgba(0,0,0,.35)",
            }}
        >

            <div
                style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    fontSize: "11px",
                    color: "#aa8a5c",
                    letterSpacing:
                        "1.5px",
                    marginBottom:
                        "7px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: "27px",
                    fontWeight: "bold",
                    color: "#f5d18a",
                }}
            >
                {value}
            </div>

        </div>
    );
}


// ============================================
// TABLE HEADER
// ============================================

function TableHeader({
    children,
}) {
    return (
        <th
            style={{
                textAlign: "left",
                padding: "15px 14px",
                color: "#c9a879",
                fontSize: "11px",
                letterSpacing:
                    "1px",
                whiteSpace:
                    "nowrap",
            }}
        >
            {children}
        </th>
    );
}


// ============================================
// TABLE CELL
// ============================================

function TableCell({
    children,
}) {
    return (
        <td
            style={{
                padding:
                    "15px 14px",
                color: "#d8c09a",
                fontSize: "13px",
                verticalAlign:
                    "middle",
            }}
        >
            {children}
        </td>
    );
}


// ============================================
// STAT BADGE
// ============================================

function StatBadge({
    children,
}) {
    return (
        <span
            style={{
                display:
                    "inline-block",
                minWidth: "35px",
                textAlign:
                    "center",
                padding:
                    "6px 10px",
                borderRadius:
                    "20px",
                background:
                    "#211309",
                border:
                    "1px solid #754b25",
                color:
                    "#f5d18a",
                fontWeight:
                    "bold",
            }}
        >
            {children}
        </span>
    );
}


// ============================================
// FORMAT DATE
// ============================================

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    try {
        const date =
            new Date(dateValue);

        if (Number.isNaN(
            date.getTime()
        )) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    } catch {
        return dateValue;
    }
}