"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthScreen({ onAuthenticated }) {
  const [screen, setScreen] = useState("login");
  const [signupMessage, setSignupMessage] = useState("");

  function handleLogin(data) {
    onAuthenticated(data);
  }

  function handleSignup() {
    /*
     * Registration creates the account.
     * The player should then log in normally so that
     * the backend provides a JWT authentication token.
     */
    setSignupMessage(
      "Account created successfully. Please login to continue."
    );

    setScreen("login");
  }

  if (screen === "signup") {
    return (
      <SignupForm
        onSignup={handleSignup}
        onShowLogin={() => {
          setSignupMessage("");
          setScreen("login");
        }}
      />
    );
  }

  return (
    <div>
      {signupMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(90%, 500px)",
            boxSizing: "border-box",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
            textAlign: "center",
            fontWeight: "600",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          {signupMessage}
        </div>
      )}

      <LoginForm
        onLogin={handleLogin}
        onShowSignup={() => {
          setSignupMessage("");
          setScreen("signup");
        }}
      />
    </div>
  );
}