"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("game_auth_token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/gameplay/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load analytics"
        );
      }

      setAnalytics(data);
    } catch (err) {
      console.error(
        "ANALYTICS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }

  function goToGame() {
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#f5d18a",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              marginBottom: "18px",
            }}
          >
            🏹
          </div>

          <div
            style={{
              fontSize: "22px",
              letterSpacing: "2px",
            }}
          >
            LOADING ANALYTICS...
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#9b7b52",
            }}
          >
            Preparing your gameplay statistics
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background:
                "linear-gradient(145deg, #2d1a0d, #1b0e07)",
              border:
                "2px solid #9b6b32",
              borderRadius: "18px",
              padding: "40px",
              textAlign: "center",
              boxShadow:
                "0 25px 60px rgba(0,0,0,.55)",
              color: "#f5d18a",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                marginBottom: "15px",
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                margin: "0 0 10px",
              }}
            >
              ANALYTICS UNAVAILABLE
            </h2>

            <p
              style={{
                color: "#c9a879",
                fontSize: "14px",
                marginBottom: "25px",
              }}
            >
              {error}
            </p>

            <button
              onClick={loadAnalytics}
              style={goldButton}
            >
              🔄 RETRY
            </button>

            <button
              onClick={goToGame}
              style={{
                ...secondaryButton,
                marginTop: "10px",
              }}
            >
              ← BACK TO GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary =
    analytics?.summary || {};

  const difficulty =
    analytics?.difficulty || {};

  const ml =
    analytics?.ml || {};

  const performance =
    analytics?.performanceByDifficulty || [];

  const recentSessions =
    analytics?.recentSessions || [];

  const difficultyHistory =
    analytics?.difficultyHistory || [];

  const averageAccuracy = Number(
    summary.averageAccuracy || 0
  );

  const averageDifficulty = Number(
    summary.averageDifficulty || 0
  );

  const averageConfidence =
    Number(
      ml.averageConfidence || 0
    ) * 100;

  const maxDifficultyAccuracy =
    Math.max(
      100,
      ...performance.map(
        (item) =>
          Number(item.accuracy || 0)
      )
    );

  return (
    <div style={pageStyle}>
      <div
        style={{
          minHeight: "100vh",
          padding: "25px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1500px",
            margin: "0 auto",
          }}
        >
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <header
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              paddingBottom: "25px",
              borderBottom:
                "1px solid #70491f",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#b47b32",
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "3px",
                  marginBottom: "7px",
                }}
              >
                🏹 GAME DIFFICULTY AUTO-BALANCING
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#f5d18a",
                  fontSize: "38px",
                  lineHeight: "1.1",
                  letterSpacing: "2px",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                ANALYTICS DASHBOARD
              </h1>

              <p
                style={{
                  margin:
                    "9px 0 0",
                  color: "#b99a6a",
                  fontSize: "14px",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                Player performance • AI decisions •
                Difficulty adaptation
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={loadAnalytics}
                style={secondaryButton}
              >
                🔄 REFRESH
              </button>

              <button
                onClick={goToGame}
                style={goldButton}
              >
                ← BACK TO GAME
              </button>
            </div>
          </header>

          {/* ================================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <SummaryCard
              icon="🎮"
              title="TOTAL SESSIONS"
              value={
                summary.totalSessions || 0
              }
              subtitle="Recorded gameplay sessions"
            />

            <SummaryCard
              icon="🏆"
              title="TOTAL SCORE"
              value={Number(
                summary.totalScore || 0
              ).toLocaleString()}
              subtitle="Combined player score"
            />

            <SummaryCard
              icon="🎯"
              title="TOTAL HITS"
              value={
                summary.totalHits || 0
              }
              subtitle="Successful target hits"
            />

            <SummaryCard
              icon="📊"
              title="AVG ACCURACY"
              value={`${averageAccuracy.toFixed(
                2
              )}%`}
              subtitle="Average session accuracy"
            />
          </div>

          {/* ================================================= */}
          {/* MAIN ANALYTICS */}
          {/* ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* DIFFICULTY */}

            <SectionCard
              icon="⚙️"
              title="DIFFICULTY ADAPTATION"
              subtitle="Dynamic difficulty changes"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <MetricBox
                  icon="🔄"
                  label="TOTAL CHANGES"
                  value={
                    difficulty.totalChanges ||
                    0
                  }
                />

                <MetricBox
                  icon="⬆️"
                  label="INCREASES"
                  value={
                    difficulty.increases ||
                    0
                  }
                  valueColor="#7ee58b"
                />

                <MetricBox
                  icon="⬇️"
                  label="DECREASES"
                  value={
                    difficulty.decreases ||
                    0
                  }
                  valueColor="#ff8f82"
                />

                <MetricBox
                  icon="⭐"
                  label="AVG LEVEL"
                  value={averageDifficulty.toFixed(
                    1
                  )}
                />
              </div>
            </SectionCard>

            {/* AI */}

            <SectionCard
              icon="🤖"
              title="AI PERFORMANCE"
              subtitle="Machine learning decisions"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "170px 1fr",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <ConfidenceRing
                  value={averageConfidence}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <MetricBox
                    label="ML DECISIONS"
                    value={
                      ml.decisions || 0
                    }
                  />

                  <MetricBox
                    label="AI INCREASES"
                    value={
                      ml.increases || 0
                    }
                    valueColor="#7ee58b"
                  />

                  <MetricBox
                    label="AI DECREASES"
                    value={
                      ml.decreases || 0
                    }
                    valueColor="#ff8f82"
                  />

                  <MetricBox
                    label="AI MAINTAINS"
                    value={
                      ml.maintains || 0
                    }
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ================================================= */}
          {/* PERFORMANCE BY DIFFICULTY */}
          {/* ================================================= */}

          <SectionCard
            icon="🎯"
            title="PERFORMANCE BY DIFFICULTY"
            subtitle="Player performance across difficulty levels"
          >
            {performance.length === 0 ? (
              <EmptyState
                icon="🏹"
                text="No difficulty performance data available yet."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {performance.map(
                  (item) => {
                    const level =
                      Number(
                        item.difficulty ||
                          0
                      );

                    const accuracy =
                      Number(
                        item.accuracy ||
                          0
                      );

                    return (
                      <DifficultyRow
                        key={level}
                        level={level}
                        accuracy={
                          accuracy
                        }
                        hits={
                          item.hits || 0
                        }
                        misses={
                          item.misses || 0
                        }
                        events={
                          item.events || 0
                        }
                        reactionTime={
                          item.reaction_time
                        }
                        maxAccuracy={
                          maxDifficultyAccuracy
                        }
                      />
                    );
                  }
                )}
              </div>
            )}
          </SectionCard>

          {/* ================================================= */}
          {/* DIFFICULTY HISTORY */}
          {/* ================================================= */}

          <SectionCard
            icon="📜"
            title="DIFFICULTY CHANGE HISTORY"
            subtitle="Recent AI and gameplay-driven adaptations"
          >
            {difficultyHistory.length ===
            0 ? (
              <EmptyState
                icon="📜"
                text="No difficulty changes recorded yet."
              />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: "750px",
                  }}
                >
                  <thead>
                    <tr>
                      <TableHeader>
                        TIME
                      </TableHeader>

                      <TableHeader>
                        CHANGE
                      </TableHeader>

                      <TableHeader>
                        DIRECTION
                      </TableHeader>

                      <TableHeader>
                        PREDICTION
                      </TableHeader>

                      <TableHeader>
                        CONFIDENCE
                      </TableHeader>

                      <TableHeader>
                        REASON
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {difficultyHistory.map(
                      (item) => {
                        const oldLevel =
                          Number(
                            item.old_level ||
                              0
                          );

                        const newLevel =
                          Number(
                            item.new_level ||
                              0
                          );

                        const increase =
                          newLevel >
                          oldLevel;

                        const decrease =
                          newLevel <
                          oldLevel;

                        return (
                          <tr
                            key={
                              item.id
                            }
                            style={{
                              borderTop:
                                "1px solid #51341a",
                            }}
                          >
                            <TableCell>
                              {formatDateTime(
                                item.timestamp
                              )}
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#f5d18a",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                Level{" "}
                                {
                                  oldLevel
                                }{" "}
                                →{" "}
                                {
                                  newLevel
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    increase
                                      ? "#7ee58b"
                                      : decrease
                                      ? "#ff8f82"
                                      : "#f5d18a",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                {increase
                                  ? "⬆️ INCREASE"
                                  : decrease
                                  ? "⬇️ DECREASE"
                                  : "➡️ MAINTAIN"}
                              </span>
                            </TableCell>

                            <TableCell>
                              <PredictionBadge
                                prediction={
                                  item.prediction
                                }
                              />
                            </TableCell>

                            <TableCell>
                              {(
                                Number(
                                  item.confidence ||
                                    0
                                ) * 100
                              ).toFixed(
                                1
                              )}
                              %
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#b99a6a",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  item.reason ||
                                  "-"
                                }
                              </span>
                            </TableCell>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ================================================= */}
          {/* RECENT SESSIONS */}
          {/* ================================================= */}

          <SectionCard
            icon="🎮"
            title="RECENT GAME SESSIONS"
            subtitle="Latest recorded gameplay sessions"
          >
            {recentSessions.length ===
            0 ? (
              <EmptyState
                icon="🎮"
                text="No gameplay sessions recorded yet."
              />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: "800px",
                  }}
                >
                  <thead>
                    <tr>
                      <TableHeader>
                        SESSION
                      </TableHeader>

                      <TableHeader>
                        STARTED
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
                        DIFFICULTY
                      </TableHeader>

                      <TableHeader>
                        STATUS
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {recentSessions.map(
                      (session) => {
                        const accuracy =
                          Number(
                            session.final_accuracy ||
                              0
                          );

                        const ended =
                          Boolean(
                            session.ended_at
                          );

                        return (
                          <tr
                            key={
                              session.id
                            }
                            style={{
                              borderTop:
                                "1px solid #51341a",
                            }}
                          >
                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#f5d18a",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                #
                                {
                                  session.id
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              {formatDateTime(
                                session.started_at
                              )}
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#ffd56f",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                {Number(
                                  session.final_score ||
                                    0
                                ).toLocaleString()}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#7ee58b",
                                }}
                              >
                                {
                                  session.final_hits ||
                                  0
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    "#ff8f82",
                                }}
                              >
                                {
                                  session.final_misses ||
                                  0
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              {accuracy.toFixed(
                                2
                              )}
                              %
                            </TableCell>

                            <TableCell>
                              <LevelBadge
                                level={
                                  session.final_difficulty ||
                                  1
                                }
                              />
                            </TableCell>

                            <TableCell>
                              <span
                                style={{
                                  color:
                                    ended
                                      ? "#7ee58b"
                                      : "#e7bd72",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                {ended
                                  ? "✓ COMPLETED"
                                  : "● ACTIVE"}
                              </span>
                            </TableCell>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div
            style={{
              textAlign: "center",
              margin:
                "25px 0 10px",
              color: "#80694d",
              fontSize: "10px",
              letterSpacing: "1px",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            🏹 GAME DIFFICULTY AUTO-BALANCING SYSTEM
            • PLAYER ANALYTICS
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* RESPONSIVE STYLES */}
      {/* ================================================= */}

      <style jsx>{`
        @media (max-width: 1100px) {
          .analytics-summary {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .analytics-main {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 650px) {
          .analytics-summary {
            grid-template-columns: 1fr !important;
          }

          .analytics-page {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #2d1a0d, #1b0e07)",

        border:
          "1px solid #70491f",

        borderRadius: "15px",

        padding: "22px",

        minHeight: "125px",

        boxSizing: "border-box",

        boxShadow:
          "0 10px 25px rgba(0,0,0,.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #4b2b0d, #241205)",
            border:
              "1px solid #8c5b2b",
            fontSize: "25px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              color: "#b99a6a",
              fontSize: "10px",
              letterSpacing: "1.5px",
              fontWeight: "bold",
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: "#f5d18a",
              fontSize: "30px",
              lineHeight: "1.1",
              fontWeight: "bold",
              marginTop: "4px",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            {value}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "14px",
          color: "#80694d",
          fontSize: "11px",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION CARD
   ========================================================= */

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}) {
  return (
    <section
      style={{
        background:
          "linear-gradient(145deg, #2d1a0d, #1b0e07)",

        border:
          "1px solid #70491f",

        borderRadius: "16px",

        padding: "24px",

        marginBottom: "20px",

        boxShadow:
          "0 10px 30px rgba(0,0,0,.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #4b2b0d, #241205)",
            border:
              "1px solid #8c5b2b",
            fontSize: "21px",
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: "#f5d18a",
              fontSize: "21px",
              fontWeight: "normal",
              letterSpacing: "1px",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
            }}
          >
            {title}
          </h2>

          <div
            style={{
              marginTop: "4px",
              color: "#8f7657",
              fontSize: "11px",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   METRIC BOX
   ========================================================= */

function MetricBox({
  icon,
  label,
  value,
  valueColor,
}) {
  return (
    <div
      style={{
        background:
          "rgba(16,9,5,.75)",

        border:
          "1px solid #3f2815",

        borderRadius: "12px",

        padding: "17px",

        minHeight: "75px",

        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        {icon && (
          <span
            style={{
              fontSize: "18px",
            }}
          >
            {icon}
          </span>
        )}

        <span
          style={{
            color: "#9b805b",
            fontSize: "10px",
            letterSpacing: "1px",
            fontWeight: "bold",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          marginTop: "7px",
          color:
            valueColor || "#f5d18a",
          fontSize: "25px",
          fontWeight: "bold",
          fontFamily:
            "Georgia, 'Times New Roman', serif",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   CONFIDENCE RING
   ========================================================= */

function ConfidenceRing({
  value,
}) {
  const safeValue = Math.max(
    0,
    Math.min(100, value)
  );

  const radius = 58;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (safeValue / 100) *
      circumference;

  return (
    <div
      style={{
        width: "150px",
        height: "150px",
        position: "relative",
        margin: "0 auto",
      }}
    >
      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        style={{
          transform:
            "rotate(-90deg)",
        }}
      >
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="#3b2615"
          strokeWidth="13"
        />

        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="#c89036"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#f5d18a",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          {safeValue.toFixed(1)}%
        </div>

        <div
          style={{
            fontSize: "10px",
            color: "#9b805b",
            marginTop: "3px",
          }}
        >
          AI CONFIDENCE
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DIFFICULTY ROW
   ========================================================= */

function DifficultyRow({
  level,
  accuracy,
  hits,
  misses,
  events,
  reactionTime,
}) {
  const names = {
    1: "BEGINNER",
    2: "NOVICE",
    3: "INTERMEDIATE",
    4: "EXPERT",
    5: "MASTER",
  };

  const percentage =
    Math.max(
      0,
      Math.min(100, accuracy)
    );

  return (
    <div
      style={{
        background:
          "rgba(16,9,5,.65)",

        border:
          "1px solid #3f2815",

        borderRadius: "12px",

        padding: "16px",

        display: "grid",

        gridTemplateColumns:
          "160px 1fr 100px 100px 100px",

        gap: "15px",

        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            color: "#f5d18a",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          LEVEL {level}
        </div>

        <div
          style={{
            color: "#9b805b",
            fontSize: "10px",
            marginTop: "3px",
            letterSpacing: "1px",
          }}
        >
          {names[level] ||
            "UNKNOWN"}
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              color: "#9b805b",
              fontSize: "10px",
            }}
          >
            ACCURACY
          </span>

          <span
            style={{
              color: "#f5d18a",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {percentage.toFixed(2)}%
          </span>
        </div>

        <div
          style={{
            height: "8px",
            background: "#251609",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #70491f, #d4a24d)",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>

      <SmallStat
        label="HITS"
        value={hits}
        color="#7ee58b"
      />

      <SmallStat
        label="MISSES"
        value={misses}
        color="#ff8f82"
      />

      <SmallStat
        label="EVENTS"
        value={events}
      />
    </div>
  );
}

/* =========================================================
   SMALL STAT
   ========================================================= */

function SmallStat({
  label,
  value,
  color,
}) {
  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#80694d",
          fontSize: "9px",
          letterSpacing: "1px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            color || "#f5d18a",
          fontSize: "18px",
          fontWeight: "bold",
          marginTop: "3px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   LEVEL BADGE
   ========================================================= */

function LevelBadge({
  level,
}) {
  const names = {
    1: "BEGINNER",
    2: "NOVICE",
    3: "INTERMEDIATE",
    4: "EXPERT",
    5: "MASTER",
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "20px",
        background:
          "rgba(126,76,24,.25)",
        border:
          "1px solid #8c5b2b",
        color: "#f5d18a",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {level} • {names[level] || "-"}
    </span>
  );
}

/* =========================================================
   PREDICTION BADGE
   ========================================================= */

function PredictionBadge({
  prediction,
}) {
  const value =
    Number(prediction);

  if (value === 1) {
    return (
      <span
        style={{
          color: "#7ee58b",
          fontWeight: "bold",
        }}
      >
        ⬆️ INCREASE
      </span>
    );
  }

  if (value === -1) {
    return (
      <span
        style={{
          color: "#ff8f82",
          fontWeight: "bold",
        }}
      >
        ⬇️ DECREASE
      </span>
    );
  }

  return (
    <span
      style={{
        color: "#f5d18a",
        fontWeight: "bold",
      }}
    >
      ➡️ MAINTAIN
    </span>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  icon,
  text,
}) {
  return (
    <div
      style={{
        padding: "35px 20px",
        textAlign: "center",
        color: "#80694d",
      }}
    >
      <div
        style={{
          fontSize: "35px",
          marginBottom: "10px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: "13px",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* =========================================================
   TABLE COMPONENTS
   ========================================================= */

function TableHeader({
  children,
}) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 10px",
        color: "#a88b61",
        fontSize: "9px",
        letterSpacing: "1.2px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
}) {
  return (
    <td
      style={{
        padding: "13px 10px",
        color: "#d8c09a",
        fontSize: "12px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDateTime(
  value
) {
  if (!value) {
    return "-";
  }

  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return value;
  }
}

/* =========================================================
   GLOBAL PAGE STYLE
   ========================================================= */

const pageStyle = {
  minHeight: "100vh",

  background:
    "radial-gradient(circle at top, #3b2110 0%, #1b0e07 35%, #0d0704 100%)",

  color: "#f5d18a",

  fontFamily:
    "Georgia, 'Times New Roman', serif",
};

/* =========================================================
   BUTTON STYLES
   ========================================================= */

const goldButton = {
  border:
    "2px solid #c89036",

  borderRadius: "10px",

  padding:
    "12px 20px",

  background:
    "linear-gradient(145deg, #8a541d, #4e290d)",

  color: "#ffe6aa",

  fontFamily:
    "Georgia, 'Times New Roman', serif",

  fontSize: "13px",

  fontWeight: "bold",

  letterSpacing: "0.7px",

  cursor: "pointer",

  boxShadow:
    "0 5px 15px rgba(0,0,0,.35)",
};

const secondaryButton = {
  border:
    "1px solid #8c5b2b",

  borderRadius: "10px",

  padding:
    "12px 20px",

  background:
    "rgba(20,10,5,.65)",

  color: "#c9a879",

  fontFamily:
    "Georgia, 'Times New Roman', serif",

  fontSize: "13px",

  fontWeight: "bold",

  letterSpacing: "0.7px",

  cursor: "pointer",
};