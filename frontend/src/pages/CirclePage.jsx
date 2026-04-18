import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";

import "./circlepage.css";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export default function CirclePage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/circle/${id}/page`);
        if (!ignore) setData(res.data);
      } catch (e) {
        const message =
          e?.response?.data?.message || e?.message || "Failed to load circle.";
        if (!ignore) setError(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (id) load();

    return () => {
      ignore = true;
    };
  }, [id]);

  const longestStreakSubtitle = useMemo(() => {
    const streak = data?.stats?.longestStreak || 0;
    const username = data?.stats?.longestStreakUsername;
    const habitTitle = data?.stats?.longestStreakHabitTitle;

    if (!streak || !username || !habitTitle) return "No streaks yet";
    return `${username} • ${habitTitle}`;
  }, [data]);

  return (
    <div className="circle-page">
      <div className="circle-container">
        <Link className="circle-back" to="/dashboard">
          ← Back to dashboard
        </Link>

        {loading ? (
          <div style={{ marginTop: 14 }} className="circle-loading">
            Loading circle…
          </div>
        ) : error ? (
          <div style={{ marginTop: 14 }} className="circle-error">
            {error}
          </div>
        ) : (
          <>
            <header className="circle-header">
              <h1>{data?.name}</h1>
              {data?.description ? <p>{data.description}</p> : null}
            </header>

            <section className="circle-stats">
              <div className="circle-stat">
                <div className="circle-stat-label">Members</div>
                <div className="circle-stat-value">
                  {data?.memberCount ?? 0}
                </div>
              </div>
              <div className="circle-stat">
                <div className="circle-stat-label">Shared habits</div>
                <div className="circle-stat-value">
                  {data?.sharedHabitsCount ?? 0}
                </div>
              </div>
              <div className="circle-stat">
                <div className="circle-stat-label">Logs (7 days)</div>
                <div className="circle-stat-value">
                  {data?.stats?.totalLogsThisWeek ?? 0}
                </div>
              </div>
              <div className="circle-stat">
                <div className="circle-stat-label">Longest streak</div>
                <div className="circle-stat-value">
                  {data?.stats?.longestStreak ?? 0}
                </div>
                <div className="circle-stat-sub">{longestStreakSubtitle}</div>
              </div>
            </section>

            <div className="circle-section-title">
              <h2>Members</h2>
              <div className="muted">{data?.members?.length ?? 0} total</div>
            </div>

            <section className="members-grid">
              {(data?.members || []).map((m) => (
                <div key={m.userId} className="member-card">
                  <div className="member-head">
                    <div>
                      <div className="member-name">{m.username}</div>
                      <div className="member-meta">
                        {m.role} • Joined {formatDate(m.joinedAt)}
                      </div>
                    </div>
                    <div className="member-count">
                      {(m.habits || []).length} habits
                    </div>
                  </div>

                  {(m.habits || []).length === 0 ? (
                    <div className="member-empty">No shared habits yet.</div>
                  ) : (
                    <div className="member-habits">
                      {(m.habits || []).map((h) => (
                        <div key={h.habitId} className="habit-row">
                          <div style={{ minWidth: 0 }}>
                            <div className="habit-title">{h.title}</div>
                            {h.description ? (
                              <div className="habit-desc">{h.description}</div>
                            ) : null}
                          </div>

                          <div className="habit-tags">
                            <span className="habit-tag">{h.frequencyType}</span>
                            <span className="habit-tag good">
                              Streak: {h.currentStreak}
                            </span>
                            <span className="habit-tag">
                              Days: {h.daysLogged}
                            </span>
                            <span
                              className={`habit-tag ${h.loggedToday ? "good" : "bad"}`}
                            >
                              {h.loggedToday ? "Logged today" : "Not today"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
