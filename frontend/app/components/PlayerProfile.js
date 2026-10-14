"use client";

export default function PlayerProfile({
  player,
  onContinue,
  onLogout,
}) {
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
      {/* PROFILE CARD */}
      {/* ========================================= */}

      <div
        style={{
          width: "100%",
          maxWidth: "625px",

          background:
            "linear-gradient(145deg, #2d1a0d, #1b0e07)",

          border:
            "2px solid #9b6b32",

          borderRadius: "20px",

          padding: "38px 48px",

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
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              width: "82px",
              height: "82px",

              margin:
                "0 auto 18px",

              borderRadius: "50%",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              background:
                "linear-gradient(145deg, #8a541d, #4e290d)",

              border:
                "2px solid #c89036",

              boxShadow:
                "0 8px 20px rgba(0,0,0,.45)",

              fontSize: "42px",
            }}
          >
            🏹
          </div>

          <h1
            style={{
              margin: 0,

              color: "#f5d18a",

              fontSize: "32px",

              lineHeight: "1.15",

              letterSpacing: "2px",

              fontWeight: "bold",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            PLAYER PROFILE
          </h1>

          <p
            style={{
              margin:
                "9px 0 0",

              color: "#c9a879",

              fontSize: "15px",

              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            Authentication successful
          </p>

        </div>

        {/* ========================================= */}
        {/* PLAYER INFORMATION */}
        {/* ========================================= */}

        <div
          style={{
            background:
              "rgba(16, 9, 5, 0.72)",

            border:
              "1px solid #8c5b2b",

            borderRadius: "14px",

            padding: "24px 26px",

            marginBottom: "25px",

            boxShadow:
              "inset 0 0 20px rgba(0,0,0,.2)",
          }}
        >

          {/* PLAYER NAME */}

          <ProfileItem
            label="PLAYER NAME"
            value={
              player?.name ||
              "Player"
            }
          />

          {/* EMAIL */}

          <ProfileItem
            label="EMAIL"
            value={
              player?.email ||
              "-"
            }
          />

          {/* PLAYER ID */}

          <ProfileItem
            label="PLAYER ID"
            value={
              player?.id
                ? `#${player.id}`
                : "-"
            }
            last
          />

        </div>

        {/* ========================================= */}
        {/* START GAME */}
        {/* ========================================= */}

        <button
          type="button"
          onClick={onContinue}
          style={{
            width: "100%",

            padding: "15px",

            border:
              "2px solid #c89036",

            borderRadius: "10px",

            background:
              "linear-gradient(145deg, #8a541d, #4e290d)",

            color: "#ffe6aa",

            fontSize: "16px",

            fontWeight: "bold",

            letterSpacing: "1px",

            fontFamily:
              "Georgia, 'Times New Roman', serif",

            cursor: "pointer",

            boxShadow:
              "0 6px 18px rgba(0,0,0,.35)",

            transition:
              "all .2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-2px)";

            event.currentTarget.style.boxShadow =
              "0 9px 22px rgba(200,144,54,.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";

            event.currentTarget.style.boxShadow =
              "0 6px 18px rgba(0,0,0,.35)";
          }}
        >
          🏹 &nbsp; START ARCHERY GAME
        </button>

        {/* ========================================= */}
        {/* LOGOUT */}
        {/* ========================================= */}

        <button
          type="button"
          onClick={onLogout}
          style={{
            width: "100%",

            marginTop: "12px",

            padding: "13px",

            border:
              "1px solid #8c5b2b",

            borderRadius: "10px",

            background:
              "rgba(20, 10, 5, .65)",

            color: "#c9a879",

            fontSize: "14px",

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
              "rgba(120, 25, 20, .3)";

            event.currentTarget.style.borderColor =
              "#b94a3a";

            event.currentTarget.style.color =
              "#ffd0c7";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "rgba(20, 10, 5, .65)";

            event.currentTarget.style.borderColor =
              "#8c5b2b";

            event.currentTarget.style.color =
              "#c9a879";
          }}
        >
          🚪 &nbsp; LOGOUT
        </button>

        {/* ========================================= */}
        {/* FOOTER */}
        {/* ========================================= */}

        <div
          style={{
            textAlign: "center",

            marginTop: "18px",

            color: "#80694d",

            fontSize: "10px",

            letterSpacing: "0.8px",
          }}
        >
          GAME DIFFICULTY AUTO-BALANCING SYSTEM
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   PROFILE ITEM
   ========================================================= */

function ProfileItem({
  label,
  value,
  last = false,
}) {
  return (
    <div
      style={{
        marginBottom:
          last ? "0" : "20px",
      }}
    >
      <div
        style={{
          color: "#b99a6a",

          fontSize: "11px",

          letterSpacing: "1.5px",

          marginBottom: "6px",

          fontFamily:
            "Georgia, 'Times New Roman', serif",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#f5d18a",

          fontSize: "19px",

          fontWeight: "bold",

          wordBreak: "break-word",

          fontFamily:
            "Georgia, 'Times New Roman', serif",
        }}
      >
        {value}
      </div>
    </div>
  );
}