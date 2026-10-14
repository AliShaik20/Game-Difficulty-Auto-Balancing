"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   ML CONFIGURATION
   ========================================================= */

const ML_API_URL =
  process.env.NEXT_PUBLIC_ML_API_URL ||
  "http://localhost:8000";

const ML_CONFIDENCE_THRESHOLD = 0.65;
const ML_MIN_ATTEMPTS = 10;
const ML_COOLDOWN = 30000;

const GAME_SAVE_KEY =
  "archery_adaptive_game_save_v1";

/* =========================================================
   DIFFICULTY SETTINGS
   ========================================================= */

const DIFFICULTY_SETTINGS = {
  1: {
    name: "BEGINNER",
    speed: 60,
    lifetime: 3500,
    spawnRate: 1800,
    maxTargets: 3,
    points: 10,
  },

  2: {
    name: "NOVICE",
    speed: 100,
    lifetime: 3000,
    spawnRate: 1500,
    maxTargets: 4,
    points: 20,
  },

  3: {
    name: "INTERMEDIATE",
    speed: 150,
    lifetime: 2400,
    spawnRate: 1200,
    maxTargets: 5,
    points: 30,
  },

  4: {
    name: "EXPERT",
    speed: 200,
    lifetime: 1700,
    spawnRate: 900,
    maxTargets: 6,
    points: 40,
  },

  5: {
    name: "MASTER",
    speed: 260,
    lifetime: 1200,
    spawnRate: 700,
    maxTargets: 7,
    points: 50,
  },
};

/* =========================================================
   LEVEL UNLOCK REQUIREMENTS
   ========================================================= */

const LEVEL_REQUIREMENTS = {
  1: {
    hits: 0,
    accuracy: 0,
  },

  2: {
    hits: 5,
    accuracy: 50,
  },

  3: {
    hits: 12,
    accuracy: 60,
  },

  4: {
    hits: 20,
    accuracy: 70,
  },

  5: {
    hits: 30,
    accuracy: 75,
  },
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Home() {
  /* =======================================================
     GAME STATE
     ======================================================= */

  const [score, setScore] = useState(0);

  const [hits, setHits] = useState(0);

  const [misses, setMisses] = useState(0);

  const [lives, setLives] = useState(3);

  const [difficulty, setDifficulty] = useState(1);

  const [unlockedLevel, setUnlockedLevel] = useState(1);

  const [targets, setTargets] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);

  const [hitEffect, setHitEffect] = useState(null);

  const [arrow, setArrow] = useState(null);

  const [message, setMessage] = useState("");

  /* =======================================================
     ML STATE
     ======================================================= */

  const [mlStatus, setMlStatus] = useState("WAITING");

  const [mlConnected, setMlConnected] =
    useState(false);

  const [mlPrediction, setMlPrediction] =
    useState(null);

  const [mlConfidence, setMlConfidence] =
    useState(0);

  const [mlMessage, setMlMessage] = useState(
    "Play 10 attempts. AI will automatically balance the difficulty."
  );

  const [mlLastCheck, setMlLastCheck] =
    useState(0);

  /* =======================================================
     REFS
     ======================================================= */

  const actionHistoryRef = useRef([]);

  const lastDifficultyChangeRef =
    useRef(0);

  const lastMLAttemptRef =
    useRef(0);

  const gameStartTimeRef =
    useRef(null);

  const saveReadyRef =
    useRef(false);

  /* =======================================================
     SETTINGS
     ======================================================= */

  const settings =
    DIFFICULTY_SETTINGS[difficulty];

  /* =======================================================
     GAME STATISTICS
     ======================================================= */

  const attempts =
    hits + misses;

  const accuracy =
    attempts > 0
      ? Math.round(
          (hits / attempts) * 100
        )
      : 0;

  /* =======================================================
     RESTORE SAVED GAME
     ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          GAME_SAVE_KEY
        );

      if (saved) {
        const data =
          JSON.parse(saved);

        if (
          typeof data.score ===
          "number"
        ) {
          setScore(data.score);
        }

        if (
          typeof data.hits ===
          "number"
        ) {
          setHits(data.hits);
        }

        if (
          typeof data.misses ===
          "number"
        ) {
          setMisses(data.misses);
        }

        if (
          typeof data.lives ===
          "number"
        ) {
          setLives(data.lives);
        }

        if (
          typeof data.difficulty ===
          "number"
        ) {
          setDifficulty(
            data.difficulty
          );
        }

        if (
          typeof data.unlockedLevel ===
          "number"
        ) {
          setUnlockedLevel(
            data.unlockedLevel
          );
        }

        if (
          typeof data.mlStatus ===
          "string"
        ) {
          setMlStatus(
            data.mlStatus
          );
        }

        if (
          typeof data.mlConnected ===
          "boolean"
        ) {
          setMlConnected(
            data.mlConnected
          );
        }

        if (
          typeof data.mlPrediction ===
          "number"
        ) {
          setMlPrediction(
            data.mlPrediction
          );
        }

        if (
          typeof data.mlConfidence ===
          "number"
        ) {
          setMlConfidence(
            data.mlConfidence
          );
        }

        if (
          typeof data.mlMessage ===
          "string"
        ) {
          setMlMessage(
            data.mlMessage
          );
        }

        if (
          typeof data.mlLastCheck ===
          "number"
        ) {
          setMlLastCheck(
            data.mlLastCheck
          );
        }

        actionHistoryRef.current =
          Array.isArray(
            data.actionHistory
          )
            ? data.actionHistory
            : [];

        lastDifficultyChangeRef.current =
          typeof data.lastDifficultyChange ===
          "number"
            ? data.lastDifficultyChange
            : 0;

        lastMLAttemptRef.current =
          typeof data.lastMLAttempt ===
          "number"
            ? data.lastMLAttempt
            : 0;

        gameStartTimeRef.current =
          typeof data.gameStartTime ===
          "number"
            ? data.gameStartTime
            : Date.now();

        setTargets([]);

        if (
          typeof data.isPlaying ===
          "boolean"
        ) {
          setIsPlaying(
            data.isPlaying
          );
        }
      }
    } catch (error) {
      console.error(
        "SAVE RESTORE ERROR:",
        error
      );
    } finally {
      saveReadyRef.current =
        true;
    }
  }, []);

  /* =======================================================
     AUTOMATIC GAME SAVE
     ======================================================= */

  useEffect(() => {
    if (
      !saveReadyRef.current ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    try {
      localStorage.setItem(
        GAME_SAVE_KEY,
        JSON.stringify({
          score,
          hits,
          misses,
          lives,
          difficulty,
          unlockedLevel,
          isPlaying,

          mlStatus,
          mlConnected,
          mlPrediction,
          mlConfidence,
          mlMessage,
          mlLastCheck,

          actionHistory:
            actionHistoryRef.current,

          lastDifficultyChange:
            lastDifficultyChangeRef.current,

          lastMLAttempt:
            lastMLAttemptRef.current,

          gameStartTime:
            gameStartTimeRef.current,
        })
      );
    } catch (error) {
      console.error(
        "SAVE ERROR:",
        error
      );
    }
  }, [
    score,
    hits,
    misses,
    lives,
    difficulty,
    unlockedLevel,
    isPlaying,
    mlStatus,
    mlConnected,
    mlPrediction,
    mlConfidence,
    mlMessage,
    mlLastCheck,
  ]);

  /* =======================================================
     LEVEL UNLOCK SYSTEM
     ======================================================= */

  useEffect(() => {
    let highestUnlocked =
      unlockedLevel;

    for (
      let level = 1;
      level <= 5;
      level++
    ) {
      const requirement =
        LEVEL_REQUIREMENTS[level];

      if (
        hits >= requirement.hits &&
        accuracy >= requirement.accuracy
      ) {
        highestUnlocked =
          Math.max(
            highestUnlocked,
            level
          );
      }
    }

    if (
      highestUnlocked !==
      unlockedLevel
    ) {
      setUnlockedLevel(
        highestUnlocked
      );

      setMessage(
        `🏹 LEVEL ${highestUnlocked} UNLOCKED!`
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  }, [
    hits,
    accuracy,
    unlockedLevel,
  ]);

  /* =======================================================
     BUILD 14 ML FEATURES
     ======================================================= */

  function buildMLFeatures() {
    const history =
      actionHistoryRef.current;

    const totalActions =
      history.length;

    const totalHits =
      history.filter(
        item =>
          item.type === "hit"
      ).length;

    const totalMisses =
      history.filter(
        item =>
          item.type === "miss"
      ).length;

    const currentAccuracy =
      totalActions > 0
        ? totalHits /
          totalActions
        : 0;

    const recent =
      history.slice(-10);

    const recentHits =
      recent.filter(
        item =>
          item.type === "hit"
      ).length;

    const recentAttempts =
      recent.length;

    const recentAccuracy =
      recentAttempts > 0
        ? recentHits /
          recentAttempts
        : 0;

    let consecutiveWins = 0;

    let consecutiveLosses = 0;

    for (
      let i =
        history.length - 1;
      i >= 0;
      i--
    ) {
      if (
        history[i].type ===
        "hit"
      ) {
        if (
          consecutiveLosses >
          0
        ) {
          break;
        }

        consecutiveWins++;
      } else {
        if (
          consecutiveWins >
          0
        ) {
          break;
        }

        consecutiveLosses++;
      }
    }

    const reactionTimes =
      history
        .filter(
          item =>
            item.type ===
              "hit" &&
            typeof item.reactionTime ===
              "number"
        )
        .map(
          item =>
            item.reactionTime
        );

    const reactionTime =
      reactionTimes.length > 0
        ? reactionTimes.reduce(
            (a, b) => a + b,
            0
          ) /
          reactionTimes.length
        : 1;

    const completionTime =
      gameStartTimeRef.current
        ? (Date.now() -
            gameStartTimeRef.current) /
          1000
        : 1;

    const previous =
      history.slice(
        -20,
        -10
      );

    const previousHits =
      previous.filter(
        item =>
          item.type === "hit"
      ).length;

    const previousAccuracy =
      previous.length > 0
        ? previousHits /
          previous.length
        : recentAccuracy;

    const performanceTrend =
      Math.max(
        -1,
        Math.min(
          1,
          recentAccuracy -
            previousAccuracy
        )
      );

    const averageScore =
      totalActions > 0
        ? score / totalActions
        : 0;

    const recentScore =
      recentAttempts > 0
        ? (recentHits *
            settings.points) /
          recentAttempts
        : 0;

    const winRate =
      currentAccuracy;

    const recentWinRate =
      recentAccuracy;

    const deathRate =
      (3 - lives) / 3;

    const survivalRate =
      lives / 3;

    return {
      current_difficulty:
        difficulty,

      accuracy:
        currentAccuracy,

      win_rate:
        winRate,

      death_rate:
        deathRate,

      survival_rate:
        survivalRate,

      average_score:
        averageScore,

      reaction_time:
        reactionTime,

      completion_time:
        completionTime,

      performance_trend:
        performanceTrend,

      consecutive_wins:
        consecutiveWins,

      consecutive_losses:
        consecutiveLosses,

      recent_accuracy:
        recentAccuracy,

      recent_win_rate:
        recentWinRate,

      recent_score:
        recentScore,
    };
  }

  /* =======================================================
     APPLY ML DECISION
     ======================================================= */

  function applyMLDecision(
    prediction,
    confidence
  ) {
    const now =
      Date.now();

    if (
      confidence <
      ML_CONFIDENCE_THRESHOLD
    ) {
      setMlMessage(
        `AI confidence ${Math.round(
          confidence * 100
        )}% is below 65%. Difficulty maintained.`
      );

      return;
    }

    if (
      now -
        lastDifficultyChangeRef.current <
      ML_COOLDOWN
    ) {
      setMlMessage(
        "AI prediction received. 30-second difficulty cooldown is active."
      );

      return;
    }

    if (prediction === 0) {
      setMlMessage(
        `➡️ DIFFICULTY MAINTAINED · ${Math.round(
          confidence * 100
        )}% AI confidence`
      );

      return;
    }

    if (prediction === 1) {
      if (difficulty >= 5) {
        setMlMessage(
          `🏆 MASTER LEVEL REACHED · ${Math.round(
            confidence * 100
          )}% AI confidence`
        );

        return;
      }

      const oldLevel =
        difficulty;

      const newLevel =
        Math.min(
          5,
          difficulty + 1
        );

      lastDifficultyChangeRef.current =
        now;

      setDifficulty(
        newLevel
      );

      setTargets([]);

      setMlMessage(
        `⬆️ DIFFICULTY INCREASED · LEVEL ${oldLevel} → LEVEL ${newLevel} · ${Math.round(
          confidence * 100
        )}% AI confidence`
      );

      return;
    }

    if (prediction === -1) {
      if (difficulty <= 1) {
        setMlMessage(
          `🛡️ BEGINNER LEVEL · ${Math.round(
            confidence * 100
          )}% AI confidence`
        );

        return;
      }

      const oldLevel =
        difficulty;

      const newLevel =
        Math.max(
          1,
          difficulty - 1
        );

      lastDifficultyChangeRef.current =
        now;

      setDifficulty(
        newLevel
      );

      setTargets([]);

      setMlMessage(
        `⬇️ DIFFICULTY DECREASED · LEVEL ${oldLevel} → LEVEL ${newLevel} · ${Math.round(
          confidence * 100
        )}% AI confidence`
      );
    }
  }

  /* =======================================================
     SEND DATA TO FASTAPI
     ======================================================= */

  async function runMLPrediction() {
    const totalActions =
      actionHistoryRef.current.length;

    if (
      totalActions <
      ML_MIN_ATTEMPTS
    ) {
      return;
    }

    if (
      totalActions ===
      lastMLAttemptRef.current
    ) {
      return;
    }

    lastMLAttemptRef.current =
      totalActions;

    setMlStatus(
      "ANALYZING"
    );

    setMlMessage(
      "🤖 AI is analyzing your gameplay..."
    );

    try {
      const features =
        buildMLFeatures();

      const response =
        await fetch(
          `${ML_API_URL}/predict`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                features
              ),
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();

      if (
        result.success ===
        false
      ) {
        throw new Error(
          result.error ||
            "ML prediction failed"
        );
      }

      setMlConnected(
        true
      );

      setMlStatus(
        "CONNECTED"
      );

      setMlPrediction(
        result.prediction
      );

      setMlConfidence(
        result.confidence
      );

      applyMLDecision(
        result.prediction,
        result.confidence
      );
    } catch (error) {
      console.error(
        "ML ERROR:",
        error
      );

      setMlConnected(
        false
      );

      setMlStatus(
        "OFFLINE"
      );

      setMlMessage(
        "⚠️ ML server is offline. Start FastAPI on port 8000."
      );
    }
  }

  /* =======================================================
     AUTOMATIC ML CHECK
     ======================================================= */

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (
      attempts <
      ML_MIN_ATTEMPTS
    ) {
      return;
    }

    if (
      attempts % 10 === 0 &&
      attempts !==
        mlLastCheck
    ) {
      setMlLastCheck(
        attempts
      );

      runMLPrediction();
    }
  }, [
    attempts,
    isPlaying,
    mlLastCheck,
  ]);

  /* =======================================================
     CREATE TARGET
     ======================================================= */

  function createTarget() {
    if (!isPlaying) {
      return;
    }

    const angle =
      Math.random() *
      Math.PI *
      2;

    const target = {
      id:
        Date.now() +
        Math.random(),

      x:
        Math.random() *
          82 +
        8,

      y:
        Math.random() *
          70 +
        10,

      vx:
        Math.cos(angle),

      vy:
        Math.sin(angle),

      createdAt:
        Date.now(),

      lifetime:
        settings.lifetime,
    };

    setTargets(
      previous => {
        if (
          previous.length >=
          settings.maxTargets
        ) {
          return previous;
        }

        return [
          ...previous,
          target,
        ];
      }
    );
  }

  /* =======================================================
     INITIAL TARGETS
     ======================================================= */

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    setTargets([]);

    const timers = [];

    for (
      let i = 0;
      i < settings.maxTargets;
      i++
    ) {
      const timer =
        setTimeout(
          () => {
            createTarget();
          },
          i * 250
        );

      timers.push(timer);
    }

    return () => {
      timers.forEach(
        timer =>
          clearTimeout(timer)
      );
    };
  }, [
    difficulty,
    isPlaying,
  ]);

  /* =======================================================
     TARGET MOVEMENT
     ======================================================= */

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval =
      setInterval(() => {
        const now =
          Date.now();

        setTargets(
          previous => {
            const updated = [];

            for (
              const target of previous
            ) {
              let x =
                target.x;

              let y =
                target.y;

              const movement =
                (settings.speed /
                  900) *
                100 *
                0.05;

              x +=
                target.vx *
                movement;

              y +=
                target.vy *
                movement;

              let vx =
                target.vx;

              let vy =
                target.vy;

              if (
                x <= 4 ||
                x >= 92
              ) {
                vx = -vx;

                x =
                  Math.max(
                    4,
                    Math.min(
                      92,
                      x
                    )
                  );
              }

              if (
                y <= 7 ||
                y >= 87
              ) {
                vy = -vy;

                y =
                  Math.max(
                    7,
                    Math.min(
                      87,
                      y
                    )
                  );
              }

              if (
                now -
                  target.createdAt >=
                target.lifetime
              ) {
                continue;
              }

              updated.push({
                ...target,

                x,

                y,

                vx,

                vy,
              });
            }

            return updated;
          }
        );
      }, 50);

    return () =>
      clearInterval(
        interval
      );
  }, [
    isPlaying,
    settings,
  ]);

  /* =======================================================
     SPAWN TARGETS
     ======================================================= */

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval =
      setInterval(() => {
        createTarget();
      }, settings.spawnRate);

    return () =>
      clearInterval(
        interval
      );
  }, [
    difficulty,
    isPlaying,
    settings,
  ]);

  /* =======================================================
     HIT TARGET
     ======================================================= */

  function hitTarget(
    event,
    target
  ) {
    event.stopPropagation();

    if (!isPlaying) {
      return;
    }

    const reactionTime =
      (Date.now() -
        target.createdAt) /
      1000;

    actionHistoryRef.current.push({
      type: "hit",

      timestamp:
        Date.now(),

      reactionTime,
    });

    setArrow({
      id:
        Date.now(),

      x: 50,

      y: 96,

      targetX:
        target.x,

      targetY:
        target.y,
    });

    setTimeout(() => {
      setScore(
        previous =>
          previous +
          settings.points
      );

      setHits(
        previous =>
          previous + 1
      );

      setHitEffect({
        id:
          target.id,

        x:
          target.x,

        y:
          target.y,
      });

      setTargets(
        previous =>
          previous.filter(
            item =>
              item.id !==
              target.id
          )
      );

      setArrow(null);

      setTimeout(() => {
        setHitEffect(null);
      }, 450);
    }, 220);
  }

  /* =======================================================
     FAILED SHOT
     
     LEVEL 5 → LEVEL 4
     LEVEL 4 → LEVEL 3
     LEVEL 3 → LEVEL 2
     LEVEL 2 → LEVEL 1
     LEVEL 1 → GAME OVER
     ======================================================= */

  function failedShot() {
    if (!isPlaying) {
      return;
    }

    actionHistoryRef.current.push({
      type: "miss",

      timestamp:
        Date.now(),

      reactionTime: null,
    });

    setMisses(
      previous =>
        previous + 1
    );

    setLives(
      previous => {
        const newLives =
          Math.max(
            0,
            previous - 1
          );

        /* -----------------------------------------------
           STILL HAVE LIVES
           ----------------------------------------------- */

        if (
          newLives > 0
        ) {
          return newLives;
        }

        /* -----------------------------------------------
           LEVEL FAILURE
           ----------------------------------------------- */

        if (
          difficulty > 1
        ) {
          const oldLevel =
            difficulty;

          const newLevel =
            Math.max(
              1,
              difficulty - 1
            );

          lastDifficultyChangeRef.current =
            Date.now();

          setDifficulty(
            newLevel
          );

          setTargets([]);

          setArrow(null);

          setHitEffect(null);

          setIsPlaying(true);

          setMlMessage(
            `⬇️ LEVEL FAILURE · DIFFICULTY DECREASED · LEVEL ${oldLevel} → LEVEL ${newLevel}`
          );

          setMessage(
            `⚠️ LEVEL ${oldLevel} FAILED — DIFFICULTY REDUCED TO LEVEL ${newLevel}`
          );

          setTimeout(() => {
            setMessage("");
          }, 2500);

          return 3;
        }

        /* -----------------------------------------------
           LEVEL 1 FAILURE = GAME OVER
           ----------------------------------------------- */

        setIsPlaying(false);

        setTargets([]);

        setArrow(null);

        setHitEffect(null);

        setMlMessage(
          "GAME OVER — AI recorded your performance."
        );

        setMessage(
          "🏹 GAME OVER — BEGINNER LEVEL FAILED"
        );

        return 0;
      }
    );
  }

  /* =======================================================
     START GAME
     ======================================================= */

  function startGame() {
    setScore(0);

    setHits(0);

    setMisses(0);

    setLives(3);

    setDifficulty(1);

    setUnlockedLevel(1);

    setTargets([]);

    setHitEffect(null);

    setArrow(null);

    setMessage("");

    setMlStatus(
      "WAITING"
    );

    setMlConnected(
      false
    );

    setMlPrediction(
      null
    );

    setMlConfidence(
      0
    );

    setMlLastCheck(
      0
    );

    setMlMessage(
      "Play 10 attempts. AI will automatically balance the difficulty."
    );

    actionHistoryRef.current = [];

    lastDifficultyChangeRef.current =
      0;

    lastMLAttemptRef.current =
      0;

    gameStartTimeRef.current =
      Date.now();

    setIsPlaying(true);
  }

  /* =======================================================
     RESTART GAME
     ======================================================= */

  function restartGame() {
    startGame();
  }

  /* =======================================================
     SELECT LEVEL
     ======================================================= */

  function selectLevel(
    level
  ) {
    if (
      level >
      unlockedLevel
    ) {
      setMessage(
        `🔒 LEVEL ${level} IS LOCKED`
      );

      setTimeout(() => {
        setMessage("");
      }, 1800);

      return;
    }

    setDifficulty(level);

    setTargets([]);

    setMessage(
      `${DIFFICULTY_SETTINGS[level].name} RANGE`
    );

    setTimeout(() => {
      setMessage("");
    }, 1200);
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main
      style={{
        minHeight:
          "100vh",

        background:
          "linear-gradient(180deg,#24170e 0%,#3b2616 35%,#18281d 100%)",

        color: "#fff",

        padding:
          "18px",

        fontFamily:
          "Georgia, 'Times New Roman', serif",

        overflowX:
          "hidden",
      }}
    >

      {/* =================================================
          HEADER
          ================================================= */}

      <div
        style={{
          maxWidth:
            "1500px",

          margin:
            "0 auto 14px",

          display:
            "flex",

          alignItems:
            "stretch",

          gap:
            "10px",

          flexWrap:
            "wrap",
        }}
      >

        {/* TITLE */}

        <div
          style={{
            flex:
              "1.7",

            minWidth:
              "300px",

            background:
              "linear-gradient(145deg,#5a3418,#24150b)",

            border:
              "3px solid #9b6b32",

            borderRadius:
              "12px",

            padding:
              "10px 20px",

            boxShadow:
              "inset 0 0 0 2px #3a210f,0 5px 15px rgba(0,0,0,.5)",
          }}
        >

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "14px",
            }}
          >

            <div
              style={{
                fontSize:
                  "48px",
              }}
            >
              🏹
            </div>

            <div>

              <div
                style={{
                  fontSize:
                    "30px",

                  fontWeight:
                    "bold",

                  color:
                    "#f5d18a",

                  letterSpacing:
                    "1px",

                  textShadow:
                    "2px 2px #140b05",
                }}
              >
                ARCHERY CHALLENGE
              </div>

              <div
                style={{
                  fontSize:
                    "13px",

                  color:
                    "#d5b27b",

                  letterSpacing:
                    "3px",
                }}
              >
                ADAPTIVE DIFFICULTY SYSTEM
              </div>

            </div>
          </div>
        </div>

        <HudCard
          icon="🏆"
          label="SCORE"
          value={score}
        />

        <HudCard
          icon="🎯"
          label="HITS"
          value={hits}
        />

        <HudCard
          icon="✚"
          label="MISSES"
          value={misses}
        />

        {/* LIVES */}

        <div
          style={{
            minWidth:
              "145px",

            background:
              "linear-gradient(145deg,#241a17,#110d0b)",

            border:
              "3px solid #744c32",

            borderRadius:
              "12px",

            padding:
              "10px 15px",

            textAlign:
              "center",

            boxShadow:
              "0 5px 15px rgba(0,0,0,.5)",
          }}
        >

          <div
            style={{
              color:
                "#c9a879",

              fontSize:
                "12px",

              letterSpacing:
                "2px",
            }}
          >
            LIVES
          </div>

          <div
            style={{
              fontSize:
                "28px",

              marginTop:
                "3px",

              letterSpacing:
                "4px",
            }}
          >
            {Array.from({
              length: 3,
            }).map(
              (_, index) => (
                <span
                  key={index}
                >
                  {index < lives
                    ? "❤️"
                    : "🖤"}
                </span>
              )
            )}
          </div>
        </div>

        {/* DIFFICULTY */}

        <div
          style={{
            minWidth:
              "180px",

            background:
              "linear-gradient(145deg,#3e2813,#160e08)",

            border:
              "3px solid #c08a36",

            borderRadius:
              "12px",

            padding:
              "9px 15px",

            textAlign:
              "center",

            boxShadow:
              "0 5px 15px rgba(0,0,0,.5)",
          }}
        >

          <div
            style={{
              color:
                "#f2c66d",

              fontSize:
                "12px",

              letterSpacing:
                "2px",
            }}
          >
            ⚡ DIFFICULTY
          </div>

          <div
            style={{
              fontSize:
                "29px",

              fontWeight:
                "bold",

              color:
                "#ffd56e",
            }}
          >
            {difficulty}
          </div>

          <div
            style={{
              fontSize:
                "12px",

              color:
                "#e2bf7a",

              letterSpacing:
                "1px",
            }}
          >
            {settings.name}
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <div
        style={{
          maxWidth:
            "1500px",

          margin:
            "auto",

          display:
            "grid",

          gridTemplateColumns:
            "150px minmax(0,1fr) 135px",

          gap:
            "10px",
        }}
      >

        {/* =================================================
            LEFT GUIDE
            ================================================= */}

        <div
          style={{
            background:
              "linear-gradient(180deg,#70411d,#321b0d)",

            border:
              "3px solid #9d6a32",

            borderRadius:
              "12px",

            padding:
              "18px 12px",

            minHeight:
              "520px",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "space-between",

            boxShadow:
              "0 8px 20px rgba(0,0,0,.5)",
          }}
        >

          <div>

            <div
              style={{
                textAlign:
                  "center",

                fontSize:
                  "32px",

                marginBottom:
                  "18px",
              }}
            >
              🏹
            </div>

            <h3
              style={{
                textAlign:
                  "center",

                color:
                  "#f5d18a",

                fontSize:
                  "16px",

                marginBottom:
                  "20px",
              }}
            >
              ARCHER'S
              <br />
              GUIDE
            </h3>

            <Instruction
              icon="🎯"
              text="Click the moving targets."
            />

            <Instruction
              icon="💥"
              text="Hit the target to score."
            />

            <Instruction
              icon="❌"
              text="Clicking empty space costs one life."
            />

            <Instruction
              icon="⏱️"
              text="Ignored targets disappear without a miss."
            />

            <Instruction
              icon="🤖"
              text="AI automatically changes difficulty."
            />

          </div>

          <div
            style={{
              borderTop:
                "1px solid #9b6b32",

              paddingTop:
                "14px",

              textAlign:
                "center",

              color:
                "#d8b77f",

              fontSize:
                "12px",
            }}
          >
            AIM TRUE
            <br />
            SHOOT FAST
            <br />
            MASTER THE RANGE
          </div>

        </div>

        {/* =================================================
            GAME ARENA
            ================================================= */}

        <div
          onClick={
            failedShot
          }

          style={{
            position:
              "relative",

            height:
              "520px",

            overflow:
              "hidden",

            border:
              "4px solid #7d552e",

            borderRadius:
              "14px",

            cursor:
              isPlaying
                ? "crosshair"
                : "default",

            background:
              "linear-gradient(180deg,#80a8ad 0%,#b9c8a0 35%,#71834e 58%,#4c3924 59%,#725031 100%)",

            boxShadow:
              "inset 0 0 80px rgba(0,0,0,.45),0 10px 30px rgba(0,0,0,.6)",
          }}
        >

          {/* =================================================
              LIVE AI PANEL
              ================================================= */}

          <div
            style={{
              position:
                "absolute",

              top:
                "12px",

              left:
                "50%",

              transform:
                "translateX(-50%)",

              zIndex:
                100,

              minWidth:
                "330px",

              maxWidth:
                "80%",

              padding:
                "9px 16px",

              background:
                "linear-gradient(145deg,rgba(25,18,10,.96),rgba(55,34,14,.96))",

              border:
                "2px solid #c08a36",

              borderRadius:
                "10px",

              boxShadow:
                "0 4px 15px rgba(0,0,0,.6)",

              textAlign:
                "center",

              pointerEvents:
                "none",
            }}
          >

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                gap:
                  "8px",

                fontSize:
                  "12px",

                color:
                  "#f2c66d",

                letterSpacing:
                  "1.5px",

                fontWeight:
                  "bold",
              }}
            >

              🤖 LIVE AI BALANCER

              <span
                style={{
                  color:
                    mlConnected
                      ? "#61e294"
                      : mlStatus ===
                        "ANALYZING"
                      ? "#ffd166"
                      : "#aaa",
                }}
              >
                ● {mlStatus}
              </span>

            </div>

            <div
              style={{
                marginTop:
                  "4px",

                color:
                  "#f7e4bd",

                fontSize:
                  "13px",

                fontWeight:
                  "bold",
              }}
            >
              {mlMessage}
            </div>

            <div
              style={{
                marginTop:
                  "4px",

                fontSize:
                  "11px",

                color:
                  "#c9a879",
              }}
            >

              Attempts:
              {" "}
              {attempts}

              {" · "}

              AI checks:
              {" "}
              {Math.floor(
                attempts / 10
              )}

              {mlConfidence >
                0 && (
                <>
                  {" · "}
                  Confidence:
                  {" "}
                  {Math.round(
                    mlConfidence *
                      100
                  )}
                  %
                </>
              )}

            </div>

          </div>

          {/* =================================================
              SKY / SUN
              ================================================= */}

          <div
            style={{
              position:
                "absolute",

              top:
                "25px",

              right:
                "60px",

              width:
                "85px",

              height:
                "85px",

              borderRadius:
                "50%",

              background:
                "radial-gradient(circle,#ffe9a3,#e7a84c)",

              boxShadow:
                "0 0 45px #ffd978",

              opacity:
                0.8,
            }}
          />

          {/* MOUNTAINS */}

          <div
            style={{
              position:
                "absolute",

              bottom:
                "40%",

              left:
                "-5%",

              width:
                "110%",

              height:
                "180px",

              background:
                "linear-gradient(135deg,transparent 20%,#53665b 21%,#53665b 42%,transparent 43%),linear-gradient(45deg,transparent 35%,#405449 36%,#405449 58%,transparent 59%)",

              opacity:
                0.8,
            }}
          />

          {/* CASTLE */}

          <div
            style={{
              position:
                "absolute",

              left:
                "20%",

              right:
                "12%",

              bottom:
                "34%",

              height:
                "110px",

              background:
                "linear-gradient(#8a806b,#555448)",

              borderTop:
                "7px solid #423f35",

              opacity:
                0.85,
            }}
          />

          <CastleTower
            left="16%"
            height="150px"
          />

          <CastleTower
            right="13%"
            height="175px"
          />

          {/* TREES */}

          <Tree
            left="4%"
            bottom="34%"
            scale="1"
          />

          <Tree
            left="9%"
            bottom="31%"
            scale="0.8"
          />

          <Tree
            right="5%"
            bottom="33%"
            scale="1.1"
          />

          <Tree
            right="10%"
            bottom="30%"
            scale="0.75"
          />

          {/* BANNERS */}

          <Banner
            left="18%"
            top="28%"
          />

          <Banner
            right="16%"
            top="25%"
          />

          {/* TORCHES */}

          <Torch
            left="26%"
            bottom="29%"
          />

          <Torch
            right="25%"
            bottom="29%"
          />

          {/* =================================================
              GROUND
              ================================================= */}

          <div
            style={{
              position:
                "absolute",

              left:
                0,

              right:
                0,

              bottom:
                0,

              height:
                "42%",

              background:
                "linear-gradient(180deg,rgba(64,47,30,.15),rgba(52,31,17,.5))",

              pointerEvents:
                "none",
            }}
          />

          {/* =================================================
              FENCE
              ================================================= */}

          <div
            style={{
              position:
                "absolute",

              bottom:
                "13px",

              left:
                0,

              right:
                0,

              height:
                "32px",

              borderTop:
                "6px solid #3c2514",

              borderBottom:
                "6px solid #3c2514",

              background:
                "repeating-linear-gradient(90deg,#4e311b 0 8px,transparent 8px 55px)",

              opacity:
                0.9,

              pointerEvents:
                "none",
            }}
          />

          {/* =================================================
              TARGETS
              ================================================= */}

          {targets.map(
            target => (
              <div
                key={
                  target.id
                }

                onClick={event =>
                  hitTarget(
                    event,
                    target
                  )
                }

                style={{
                  position:
                    "absolute",

                  left:
                    `${target.x}%`,

                  top:
                    `${target.y}%`,

                  transform:
                    "translate(-50%,-50%)",

                  width:
                    "54px",

                  height:
                    "54px",

                  borderRadius:
                    "50%",

                  background:
                    "radial-gradient(circle,#fff 0 13%,#e33 14% 30%,#fff 31% 48%,#d22 49% 65%,#fff 66% 100%)",

                  border:
                    "4px solid #542d16",

                  boxShadow:
                    "0 5px 12px rgba(0,0,0,.6),0 0 15px rgba(255,220,130,.35)",

                  cursor:
                    "crosshair",

                  zIndex:
                    20,
                }}
              >

                <div
                  style={{
                    position:
                      "absolute",

                    left:
                      "50%",

                    top:
                      "50%",

                    transform:
                      "translate(-50%,-50%)",

                    width:
                      "8px",

                    height:
                      "8px",

                    background:
                      "#111",

                    borderRadius:
                      "50%",
                  }}
                />

              </div>
            )
          )}

          {/* =================================================
              ARROW
              ================================================= */}

          {arrow && (
            <div
              style={{
                position:
                  "absolute",

                left:
                  `${arrow.x}%`,

                top:
                  `${arrow.y}%`,

                transform:
                  `translate(-50%,-50%) rotate(-25deg)`,

                fontSize:
                  "35px",

                zIndex:
                  50,

                animation:
                  "arrowFlight .22s linear forwards",

                "--target-x":
                  `${arrow.targetX - arrow.x}%`,

                "--target-y":
                  `${arrow.targetY - arrow.y}%`,
              }}
            >
              🏹
            </div>
          )}

          {/* =================================================
              HIT EFFECT
              ================================================= */}

          {hitEffect && (
            <div
              style={{
                position:
                  "absolute",

                left:
                  `${hitEffect.x}%`,

                top:
                  `${hitEffect.y}%`,

                transform:
                  "translate(-50%,-50%)",

                fontSize:
                  "42px",

                zIndex:
                  60,

                animation:
                  "hitPop .45s ease-out forwards",

                pointerEvents:
                  "none",
              }}
            >
              💥
            </div>
          )}

          {/* =================================================
              START / GAME OVER
              ================================================= */}

          {!isPlaying && (
            <div
              style={{
                position:
                  "absolute",

                inset:
                  0,

                background:
                  "rgba(15,9,4,.65)",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                zIndex:
                  80,
              }}
            >

              <div
                style={{
                  background:
                    "linear-gradient(145deg,#5a3418,#24150b)",

                  border:
                    "3px solid #c08a36",

                  borderRadius:
                    "16px",

                  padding:
                    "28px",

                  textAlign:
                    "center",

                  minWidth:
                    "300px",

                  boxShadow:
                    "0 12px 40px rgba(0,0,0,.7)",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "50px",
                  }}
                >
                  🏹
                </div>

                <h2
                  style={{
                    color:
                      "#f5d18a",

                    margin:
                      "8px 0",
                  }}
                >
                  {attempts >
                  0
                    ? "GAME OVER"
                    : "ARCHERY CHALLENGE"}
                </h2>

                {attempts >
                  0 && (
                  <div
                    style={{
                      color:
                        "#d9bb89",

                      marginBottom:
                        "15px",
                    }}
                  >
                    Score:
                    {" "}
                    {score}
                    <br />
                    Accuracy:
                    {" "}
                    {accuracy}%
                  </div>
                )}

                <button
                  onClick={
                    startGame
                  }

                  style={{
                    padding:
                      "12px 28px",

                    border:
                      "2px solid #d39b42",

                    borderRadius:
                      "8px",

                    background:
                      "linear-gradient(#a86c28,#63380f)",

                    color:
                      "#fff",

                    fontWeight:
                      "bold",

                    fontSize:
                      "15px",

                    cursor:
                      "pointer",
                  }}
                >
                  {attempts >
                  0
                    ? "PLAY AGAIN"
                    : "START GAME"}
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              MESSAGE
              ================================================= */}

          {message && (
            <div
              style={{
                position:
                  "absolute",

                bottom:
                  "55px",

                left:
                  "50%",

                transform:
                  "translateX(-50%)",

                background:
                  "rgba(35,20,8,.95)",

                border:
                  "2px solid #d49a3a",

                color:
                  "#ffd77d",

                padding:
                  "10px 22px",

                borderRadius:
                  "8px",

                zIndex:
                  90,

                fontWeight:
                  "bold",

                whiteSpace:
                  "nowrap",
              }}
            >
              {message}
            </div>
          )}

        </div>

        {/* =================================================
            RIGHT LEVEL PANEL
            ================================================= */}

        <div
          style={{
            background:
              "linear-gradient(180deg,#70411d,#321b0d)",

            border:
              "3px solid #9d6a32",

            borderRadius:
              "12px",

            padding:
              "12px",

            minHeight:
              "520px",

            boxShadow:
              "0 8px 20px rgba(0,0,0,.5)",
          }}
        >

          <h3
            style={{
              textAlign:
                "center",

              color:
                "#f5d18a",

              fontSize:
                "15px",

              marginBottom:
                "15px",
            }}
          >
            LEVELS
          </h3>

          {[1, 2, 3, 4, 5].map(
            level => {

              const unlocked =
                level <=
                unlockedLevel;

              const active =
                level ===
                difficulty;

              return (
                <button
                  key={
                    level
                  }

                  onClick={() =>
                    selectLevel(
                      level
                    )
                  }

                  style={{
                    width:
                      "100%",

                    marginBottom:
                      "9px",

                    padding:
                      "10px 5px",

                    border:
                      active
                        ? "2px solid #ffd36b"
                        : "2px solid #76502b",

                    borderRadius:
                      "8px",

                    background:
                      active
                        ? "linear-gradient(#8c5a20,#5a3210)"
                        : unlocked
                        ? "rgba(70,43,21,.8)"
                        : "rgba(20,15,10,.7)",

                    color:
                      unlocked
                        ? "#f4d49b"
                        : "#766552",

                    cursor:
                      unlocked
                        ? "pointer"
                        : "not-allowed",

                    opacity:
                      unlocked
                        ? 1
                        : 0.65,
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        "19px",

                      fontWeight:
                        "bold",
                    }}
                  >
                    {unlocked
                      ? "✓"
                      : "🔒"}{" "}
                    {level}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "9px",

                      marginTop:
                        "3px",

                      letterSpacing:
                        "1px",
                    }}
                  >
                    {
                      DIFFICULTY_SETTINGS[
                        level
                      ].name
                    }
                  </div>

                </button>
              );
            }
          )}

        </div>

      </div>

      {/* =================================================
          BOTTOM STATISTICS
          ================================================= */}

      <div
        style={{
          maxWidth:
            "1500px",

          margin:
            "12px auto 0",

          display:
            "grid",

          gridTemplateColumns:
            "repeat(5,1fr)",

          gap:
            "10px",
        }}
      >

        <BottomStat
          label="ACCURACY"
          value={`${accuracy}%`}
        />

        <BottomStat
          label="ATTEMPTS"
          value={attempts}
        />

        <BottomStat
          label="TARGET SPEED"
          value={`${settings.speed} px/s`}
        />

        <BottomStat
          label="TARGET LIFETIME"
          value={`${settings.lifetime} ms`}
        />

        <BottomStat
          label="AI CHECK"
          value={
            attempts >=
            ML_MIN_ATTEMPTS
              ? `${Math.floor(
                  attempts /
                    10
                )} completed`
              : `${ML_MIN_ATTEMPTS - attempts} attempts`
          }
        />

      </div>

      {/* =================================================
          AI FEATURE SUMMARY
          ================================================= */}

      <div
        style={{
          maxWidth:
            "1500px",

          margin:
            "10px auto 0",

          padding:
            "10px 15px",

          background:
            "rgba(30,19,10,.75)",

          border:
            "1px solid #76502b",

          borderRadius:
            "8px",

          textAlign:
            "center",

          color:
            "#c7aa7a",

          fontSize:
            "11px",
        }}
      >

        🤖 AI uses player accuracy,
        win rate, death rate,
        survival rate, score,
        reaction time, completion time,
        performance trend,
        consecutive wins/losses,
        recent accuracy,
        recent win rate and recent score
        to automatically balance the game.

      </div>

      {/* =================================================
          ANIMATIONS
          ================================================= */}

      <style jsx>{`

        @keyframes arrowFlight {
          from {
            left: 50%;
            top: 96%;
            opacity: 1;
          }

          to {
            left: calc(
              50% +
              var(--target-x)
            );

            top: calc(
              96% +
              var(--target-y)
            );

            opacity: 0;
          }
        }

        @keyframes hitPop {
          0% {
            transform:
              translate(-50%,-50%)
              scale(.5);

            opacity: 1;
          }

          100% {
            transform:
              translate(-50%,-50%)
              scale(1.8);

            opacity: 0;
          }
        }

        @media (max-width: 1000px) {

          main > div:nth-child(2) {
            grid-template-columns:
              1fr;
          }

        }

      `}</style>

    </main>
  );
}

/* =========================================================
   HUD CARD
   ========================================================= */

function HudCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        minWidth:
          "105px",

        background:
          "linear-gradient(145deg,#241a17,#110d0b)",

        border:
          "3px solid #744c32",

        borderRadius:
          "12px",

        padding:
          "10px 15px",

        textAlign:
          "center",

        boxShadow:
          "0 5px 15px rgba(0,0,0,.5)",
      }}
    >

      <div
        style={{
          fontSize:
            "20px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color:
            "#c9a879",

          fontSize:
            "10px",

          letterSpacing:
            "1.5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#f7d48c",

          fontSize:
            "24px",

          fontWeight:
            "bold",
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   INSTRUCTION
   ========================================================= */

function Instruction({
  icon,
  text,
}) {
  return (
    <div
      style={{
        display:
          "flex",

        gap:
          "7px",

        marginBottom:
          "13px",

        color:
          "#dbc39c",

        fontSize:
          "11px",

        lineHeight:
          "1.4",
      }}
    >

      <span
        style={{
          fontSize:
            "15px",
        }}
      >
        {icon}
      </span>

      <span>
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   BOTTOM STAT
   ========================================================= */

function BottomStat({
  label,
  value,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg,#3c2716,#1d1209)",

        border:
          "2px solid #76502b",

        borderRadius:
          "8px",

        padding:
          "8px",

        textAlign:
          "center",
      }}
    >

      <div
        style={{
          color:
            "#a98a60",

          fontSize:
            "9px",

          letterSpacing:
            "1px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#f1cf8c",

          fontSize:
            "15px",

          fontWeight:
            "bold",

          marginTop:
            "3px",
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   CASTLE TOWER
   ========================================================= */

function CastleTower({
  left,
  right,
  height,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left,

        right,

        bottom:
          "34%",

        width:
          "65px",

        height,

        background:
          "linear-gradient(90deg,#555448,#969078,#555448)",

        border:
          "3px solid #403d34",

        zIndex:
          2,
      }}
    >

      <div
        style={{
          position:
            "absolute",

          top:
            "-20px",

          left:
            "-7px",

          width:
            "72px",

          height:
            "25px",

          background:
            "repeating-linear-gradient(90deg,#403d34 0 12px,#88816b 12px 24px)",
        }}
      />

      <div
        style={{
          position:
            "absolute",

          top:
            "40%",

          left:
            "50%",

          transform:
            "translateX(-50%)",

          width:
            "18px",

          height:
            "25px",

          background:
            "#25241f",

          borderRadius:
            "8px 8px 0 0",
        }}
      />

    </div>
  );
}

/* =========================================================
   TREE
   ========================================================= */

function Tree({
  left,
  right,
  bottom,
  scale,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left,

        right,

        bottom,

        transform:
          `scale(${scale})`,

        transformOrigin:
          "bottom center",

        zIndex:
          4,
      }}
    >

      <div
        style={{
          width:
            "18px",

          height:
            "80px",

          margin:
            "auto",

          background:
            "#3a2414",

          borderRadius:
            "8px",
        }}
      />

      <div
        style={{
          position:
            "absolute",

          bottom:
            "45px",

          left:
            "-25px",

          width:
            "68px",

          height:
            "80px",

          background:
            "radial-gradient(circle at 50% 20%,#405d35,#213b27 65%,transparent 66%)",

          borderRadius:
            "50%",
        }}
      />

      <div
        style={{
          position:
            "absolute",

          bottom:
            "80px",

          left:
            "-10px",

          width:
            "45px",

          height:
            "65px",

          background:
            "radial-gradient(circle,#557246,#2d4a2e 70%,transparent 71%)",

          borderRadius:
            "50%",
        }}
      />

    </div>
  );
}

/* =========================================================
   BANNER
   ========================================================= */

function Banner({
  left,
  right,
  top,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left,

        right,

        top,

        zIndex:
          5,

        width:
          "28px",

        height:
          "85px",

        background:
          "linear-gradient(90deg,#4a2d15,#a65c22,#4a2d15)",

        borderLeft:
          "4px solid #3b2515",
      }}
    >

      <div
        style={{
          position:
            "absolute",

          top:
            "8px",

          left:
            "0",

          width:
            "24px",

          height:
            "35px",

          background:
            "#9d3325",

          clipPath:
            "polygon(0 0,100% 0,100% 80%,50% 100%,0 80%)",
        }}
      />

    </div>
  );
}

/* =========================================================
   TORCH
   ========================================================= */

function Torch({
  left,
  right,
  bottom,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left,

        right,

        bottom,

        zIndex:
          10,

        textAlign:
          "center",

        fontSize:
          "25px",

        filter:
          "drop-shadow(0 0 10px #ffae35)",
      }}
    >
      🔥
    </div>
  );
}