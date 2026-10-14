"use client";

import { useState } from "react";

export default function AdminLogin() {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    async function handleLogin(event) {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Admin login failed"
                );

            }


            localStorage.setItem(
                "admin_auth_token",
                data.token
            );


            window.location.href =
                "/admin";


        } catch (error) {

            setError(
                error.message ||
                "Invalid admin credentials"
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <div
            style={{
                minHeight: "100vh",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                background:
                    "linear-gradient(135deg,#100904,#29180a,#0b0704)",

                color: "#f5d18a",

                fontFamily:
                    "Georgia, 'Times New Roman', serif"
            }}
        >

            <div
                style={{
                    width: "390px",

                    padding: "35px",

                    background:
                        "linear-gradient(145deg,#34200e,#140b05)",

                    border:
                        "2px solid #9b6b32",

                    borderRadius: "18px",

                    boxShadow:
                        "0 15px 50px rgba(0,0,0,.7)"
                }}
            >

                <div
                    style={{
                        textAlign: "center",
                        fontSize: "50px"
                    }}
                >
                    👑
                </div>


                <h1
                    style={{
                        textAlign: "center",
                        margin:
                            "10px 0",

                        fontSize: "28px"
                    }}
                >
                    ADMIN LOGIN
                </h1>


                <p
                    style={{
                        textAlign: "center",

                        color: "#c9a879",

                        fontSize: "13px",

                        marginBottom: "28px"
                    }}
                >
                    Game Difficulty Auto-Balancing
                    System
                </p>


                {error && (

                    <div
                        style={{
                            background: "#421515",

                            border:
                                "1px solid #a94442",

                            color: "#ffb5b5",

                            padding: "12px",

                            borderRadius: "8px",

                            marginBottom: "18px",

                            fontSize: "13px"
                        }}
                    >
                        ⚠️ {error}
                    </div>

                )}


                <form
                    onSubmit={handleLogin}
                >

                    <label
                        style={labelStyle}
                    >
                        ADMIN EMAIL
                    </label>

                    <input
                        type="email"

                        value={email}

                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }

                        placeholder="Enter admin email"

                        required

                        style={inputStyle}
                    />


                    <label
                        style={labelStyle}
                    >
                        ADMIN PASSWORD
                    </label>

                    <input
                        type="password"

                        value={password}

                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }

                        placeholder="Enter admin password"

                        required

                        style={inputStyle}
                    />


                    <button
                        type="submit"

                        disabled={loading}

                        style={{
                            width: "100%",

                            padding: "14px",

                            marginTop: "12px",

                            border: "2px solid #c08a36",

                            borderRadius: "10px",

                            background:
                                "linear-gradient(145deg,#7a4d1e,#3a210c)",

                            color: "#ffe0a0",

                            fontWeight: "bold",

                            fontSize: "15px",

                            cursor:
                                loading
                                    ? "not-allowed"
                                    : "pointer",

                            fontFamily:
                                "Georgia, 'Times New Roman', serif"
                        }}
                    >
                        {loading
                            ? "AUTHENTICATING..."
                            : "🔐 LOGIN AS ADMIN"}
                    </button>

                </form>


                <button
                    onClick={() => {
                        window.location.href =
                            "/";
                    }}

                    style={{
                        width: "100%",

                        marginTop: "15px",

                        padding: "10px",

                        background:
                            "transparent",

                        border:
                            "1px solid #68471f",

                        borderRadius: "8px",

                        color: "#b9945b",

                        cursor: "pointer"
                    }}
                >
                    ← Back to Player Login
                </button>

            </div>

        </div>

    );
}


const labelStyle = {

    display: "block",

    marginBottom: "7px",

    marginTop: "18px",

    fontSize: "11px",

    letterSpacing: "1.5px",

    color: "#c9a879"

};


const inputStyle = {

    width: "100%",

    boxSizing: "border-box",

    padding: "13px",

    background: "#100904",

    border: "1px solid #795126",

    borderRadius: "8px",

    color: "#f5d18a",

    outline: "none",

    fontSize: "14px"

};