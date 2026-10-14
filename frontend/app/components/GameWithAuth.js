"use client";

import { useEffect, useState } from "react";

import AuthScreen from "./AuthScreen";
import PlayerProfile from "./PlayerProfile";

import {
  getAuthToken,
  getPlayerProfile,
  clearAuthToken,
} from "../services/authService";

export default function GameWithAuth({ children }) {
  const [status, setStatus] = useState("checking");
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    async function checkAuthentication() {
      const token = getAuthToken();

      if (!token) {
        setStatus("login");
        return;
      }

      try {
        const data = await getPlayerProfile(token);

        if (data?.player) {
          setPlayer(data.player);
          setStatus("profile");
        } else {
          clearAuthToken();
          setStatus("login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        clearAuthToken();
        setStatus("login");
      }
    }

    checkAuthentication();
  }, []);

  function handleAuthenticated(data) {
    if (data?.player) {
      setPlayer(data.player);
      setStatus("profile");
      return;
    }

    /*
     * Some authentication responses may return
     * player information directly.
     */
    if (data?.id || data?.email || data?.name) {
      setPlayer(data);
      setStatus("profile");
      return;
    }

    setStatus("profile");
  }

  function handleContinue() {
    setStatus("game");
  }

  function handleLogout() {
    clearAuthToken();
    setPlayer(null);
    setStatus("login");
  }

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
          color: "white",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Checking player authentication...
      </div>
    );
  }

  if (status === "login") {
    return (
      <AuthScreen
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  if (status === "profile") {
    return (
      <PlayerProfile
        player={player}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />
    );
  }

  /*
   * IMPORTANT:
   * The existing game is rendered through children.
   *
   * We are NOT rebuilding or replacing the existing
   * archery interface here.
   */
  return children;
}