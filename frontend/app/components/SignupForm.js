"use client";

import { useState } from "react";
import { registerPlayer } from "../services/authService";

export default function SignupForm({
  onSignup,
  onShowLogin,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await registerPlayer(
        name.trim(),
        email.trim(),
        password
      );

      onSignup(data);
    } catch (err) {
      setError(
        err.message ||
        "Registration failed."
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
          "linear-gradient(135deg, #160b05 0%, #211006 50%, #2b1508 100%)",

        padding: "20px",

        boxSizing: "border-box",

        fontFamily:
          "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* ========================================= */}
      {/* MAIN SIGNUP CARD */}
      {/* ========================================= */}

      <div
        style={{
          width: "100%",

          maxWidth: "490px",

          background:
            "linear-gradient(145deg, #2d1a0d, #1b0e07)",

          border:
            "2px solid #9b6b32",

          borderRadius: "18px",

          padding: "32px 44px",

          boxSizing: "border-box",

          boxShadow:
            "0 25px 60px rgba(0,0,0,0.55)",
        }}
      >

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
          }}
        >

          <div
            style={{
              fontSize: "48px",

              lineHeight: "1",

              marginBottom: "9px",

              filter:
                "drop-shadow(0 4px 6px rgba(0,0,0,.4))",
            }}
          >
            🏹
          </div>

          <h1
            style={{
              margin: 0,

              fontSize: "30px",

              lineHeight: "1.1",

              fontWeight: "bold",

              letterSpacing: "2px",

              color: "#f5d18a",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            ARCHERY
          </h1>

          <h1
            style={{
              margin: "2px 0 0",

              fontSize: "30px",

              lineHeight: "1.1",

              fontWeight: "bold",

              letterSpacing: "2px",

              color: "#f5d18a",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            CHALLENGE
          </h1>

          <p
            style={{
              marginTop: "8px",

              marginBottom: 0,

              color: "#c9a879",

              fontSize: "13px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            Adaptive Difficulty System
          </p>

        </div>

        {/* ========================================= */}
        {/* SIGNUP TITLE */}
        {/* ========================================= */}

        <h2
          style={{
            margin: "0 0 20px",

            textAlign: "center",

            color: "#f0c878",

            fontSize: "25px",

            lineHeight: "1.2",

            fontWeight: "normal",

            fontFamily:
              "Georgia, 'Times New Roman', serif",
          }}
        >
          CREATE PLAYER ACCOUNT
        </h2>

        {/* ========================================= */}
        {/* ERROR MESSAGE */}
        {/* ========================================= */}

        {error && (
          <div
            style={{
              background:
                "rgba(120, 25, 20, 0.35)",

              color: "#ffd0c7",

              border:
                "1px solid #b94a3a",

              borderRadius: "9px",

              padding: "10px 13px",

              marginBottom: "16px",

              fontSize: "13px",

              textAlign: "center",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ========================================= */}
        {/* SIGNUP FORM */}
        {/* ========================================= */}

        <form onSubmit={handleSubmit}>

          {/* ========================================= */}
          {/* PLAYER NAME */}
          {/* ========================================= */}

          <label
            style={{
              display: "block",

              marginBottom: "7px",

              color: "#d9b878",

              fontSize: "13px",

              letterSpacing: "1.3px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            PLAYER NAME
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
            autoComplete="name"
            style={{
              width: "100%",

              boxSizing: "border-box",

              padding: "13px 14px",

              marginBottom: "16px",

              border:
                "1px solid #9b6b32",

              borderRadius: "10px",

              background: "#100905",

              color: "#f5d18a",

              fontSize: "15px",

              outline: "none",

              fontFamily:
                "Georgia, 'Times New Roman', serif",

              transition:
                "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(event) => {
              event.currentTarget.style.border =
                "2px solid #c89036";

              event.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(200,144,54,.15)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.border =
                "1px solid #9b6b32";

              event.currentTarget.style.boxShadow =
                "none";
            }}
          />

          {/* ========================================= */}
          {/* EMAIL */}
          {/* ========================================= */}

          <label
            style={{
              display: "block",

              marginBottom: "7px",

              color: "#d9b878",

              fontSize: "13px",

              letterSpacing: "1.3px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            PLAYER EMAIL
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            style={{
              width: "100%",

              boxSizing: "border-box",

              padding: "13px 14px",

              marginBottom: "16px",

              border:
                "1px solid #9b6b32",

              borderRadius: "10px",

              background: "#100905",

              color: "#f5d18a",

              fontSize: "15px",

              outline: "none",

              fontFamily:
                "Georgia, 'Times New Roman', serif",

              transition:
                "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(event) => {
              event.currentTarget.style.border =
                "2px solid #c89036";

              event.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(200,144,54,.15)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.border =
                "1px solid #9b6b32";

              event.currentTarget.style.boxShadow =
                "none";
            }}
          />

          {/* ========================================= */}
          {/* PASSWORD */}
          {/* ========================================= */}

          <label
            style={{
              display: "block",

              marginBottom: "7px",

              color: "#d9b878",

              fontSize: "13px",

              letterSpacing: "1.3px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            PASSWORD
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            style={{
              width: "100%",

              boxSizing: "border-box",

              padding: "13px 14px",

              marginBottom: "16px",

              border:
                "1px solid #9b6b32",

              borderRadius: "10px",

              background: "#100905",

              color: "#f5d18a",

              fontSize: "15px",

              outline: "none",

              fontFamily:
                "Georgia, 'Times New Roman', serif",

              transition:
                "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(event) => {
              event.currentTarget.style.border =
                "2px solid #c89036";

              event.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(200,144,54,.15)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.border =
                "1px solid #9b6b32";

              event.currentTarget.style.boxShadow =
                "none";
            }}
          />

          {/* ========================================= */}
          {/* CONFIRM PASSWORD */}
          {/* ========================================= */}

          <label
            style={{
              display: "block",

              marginBottom: "7px",

              color: "#d9b878",

              fontSize: "13px",

              letterSpacing: "1.3px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            CONFIRM PASSWORD
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Re-enter your password"
            autoComplete="new-password"
            style={{
              width: "100%",

              boxSizing: "border-box",

              padding: "13px 14px",

              marginBottom: "20px",

              border:
                "1px solid #9b6b32",

              borderRadius: "10px",

              background: "#100905",

              color: "#f5d18a",

              fontSize: "15px",

              outline: "none",

              fontFamily:
                "Georgia, 'Times New Roman', serif",

              transition:
                "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(event) => {
              event.currentTarget.style.border =
                "2px solid #c89036";

              event.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(200,144,54,.15)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.border =
                "1px solid #9b6b32";

              event.currentTarget.style.boxShadow =
                "none";
            }}
          />

          {/* ========================================= */}
          {/* CREATE ACCOUNT BUTTON */}
          {/* ========================================= */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",

              padding: "14px",

              border:
                "2px solid #c89036",

              borderRadius: "10px",

              background: loading
                ? "linear-gradient(145deg, #65451f, #38230f)"
                : "linear-gradient(145deg, #8a541d, #4e290d)",

              color: "#ffe6aa",

              fontSize: "16px",

              fontWeight: "bold",

              letterSpacing: "1px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",

              cursor: loading
                ? "not-allowed"
                : "pointer",

              boxShadow:
                "0 6px 18px rgba(0,0,0,.35)",

              transition:
                "all .2s ease",
            }}
            onMouseEnter={(event) => {
              if (!loading) {
                event.currentTarget.style.transform =
                  "translateY(-2px)";

                event.currentTarget.style.boxShadow =
                  "0 9px 22px rgba(200,144,54,.25)";
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "translateY(0)";

              event.currentTarget.style.boxShadow =
                "0 6px 18px rgba(0,0,0,.35)";
            }}
          >
            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE PLAYER ACCOUNT"}
          </button>

        </form>

        {/* ========================================= */}
        {/* BACK TO LOGIN */}
        {/* ========================================= */}

        <div
          style={{
            textAlign: "center",

            marginTop: "19px",

            color: "#b99a6a",

            fontSize: "13px",

            fontFamily:
              "Georgia, 'Times New Roman', serif",
          }}
        >
          Already have an account?
        </div>

        <button
          type="button"
          onClick={onShowLogin}
          style={{
            width: "100%",

            marginTop: "8px",

            padding: "12px",

            border:
              "1px solid #9b6b32",

            borderRadius: "9px",

            background:
              "rgba(20, 10, 5, .65)",

            color: "#c9a879",

            fontSize: "13px",

            fontWeight: "bold",

            letterSpacing: "1px",

            fontFamily:
              "Georgia, 'Times New Roman', serif",

            cursor: "pointer",

            transition:
              "all .2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              "rgba(126, 76, 24, .3)";

            event.currentTarget.style.borderColor =
              "#b47b32";

            event.currentTarget.style.color =
              "#f5d18a";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "rgba(20, 10, 5, .65)";

            event.currentTarget.style.borderColor =
              "#9b6b32";

            event.currentTarget.style.color =
              "#c9a879";
          }}
        >
          ← BACK TO PLAYER LOGIN
        </button>

        {/* ========================================= */}
        {/* FOOTER */}
        {/* ========================================= */}

        <div
          style={{
            textAlign: "center",

            marginTop: "16px",

            color: "#80694d",

            fontSize: "9px",

            letterSpacing: "0.8px",

            fontFamily:
              "Georgia, 'Times New Roman', serif",
          }}
        >
          GAME DIFFICULTY AUTO-BALANCING SYSTEM
        </div>

      </div>

      {/* ========================================= */}
      {/* PLACEHOLDER STYLE */}
      {/* ========================================= */}

      <style jsx>{`
        input::placeholder {
          color: #b99a6a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          opacity: 1;
        }
      `}</style>

    </div>
  );
}