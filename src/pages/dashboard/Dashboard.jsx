import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import "./style.css";
import { useTranslation } from "react-i18next";
import {
  FiMail,
  FiFileText,
  FiBell,
  FiFile,
  FiUsers,
  FiGrid,
  FiBookOpen,
  FiClipboard,
  FiBriefcase,
  FiCheckSquare,
  FiGlobe,
  FiBookmark,
  FiDatabase,
  FiLayers,
} from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function countFromResponse(body) {
  if (!body || body.success === false) return 0;
  const p = body.pagination;
  if (p?.totalItems != null) return Number(p.totalItems);
  if (p?.total != null) return Number(p.total);
  const d = body.data;
  if (Array.isArray(d)) return d.length;
  return 0;
}

const statEndpoints = [
  { key: "contact", path: "/contact", url: "/api/contact", icon: FiMail },
  { key: "news", path: "/news", url: "/api/news?page=1&limit=1", icon: FiFileText },
  { key: "announcement", path: "/announcement", url: "/api/announcement", icon: FiBell },
  { key: "docs", path: "/docs", url: "/api/docs", icon: FiFile },
  {
    key: "leadership",
    labelKey: "leader.title",
    path: "/leadership",
    url: "/api/leadership?page=1&limit=1",
    icon: FiUsers,
  },
  { key: "department", path: "/department", url: "/api/department?page=1&limit=1", icon: FiGrid },
  { key: "charter", path: "/charter", url: "/api/charter", icon: FiBookOpen },
  { key: "audit", path: "/audit", url: "/api/audit", icon: FiClipboard },
  { key: "vacancy", path: "/vacancy", url: "/api/job-vacancies", icon: FiBriefcase },
  { key: "vacancyApplications", path: "/vacancy-applications", url: "/api/vacancy-applications", icon: FiCheckSquare },
  { key: "roles", path: "/roles", url: "/api/roles", icon: FiLayers },
  { key: "unesko", path: "/unesko", url: "/api/unesko", icon: FiGlobe },
  { key: "nationalList", path: "/national", url: "/api/national-list?page=1&limit=1", icon: FiGlobe },
  { key: "expedition", path: "/expedition", url: "/api/expedition", icon: FiGlobe },
  { key: "localList", path: "/local-list", url: "/api/local-list", icon: FiGlobe },
  { key: "articles", path: "/articles", url: "/api/articles", icon: FiBookmark },
  { key: "usefulResources", path: "/useful-resources", url: "/api/resources", icon: FiDatabase },
];

const Dashboard = () => {
  const [t] = useTranslation("global");
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(statEndpoints.map((s) => [s.key, null]))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!BACKEND_URL) {
      setError("VITE_BACKEND_URL");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const next = Object.fromEntries(statEndpoints.map((s) => [s.key, null]));

    await Promise.all(
      statEndpoints.map(async (row) => {
        try {
          const { data } = await axios.get(`${BACKEND_URL}${row.url}`, {
            timeout: 20_000,
          });
          next[row.key] = countFromResponse(data);
        } catch {
          next[row.key] = null;
        }
      })
    );

    setCounts(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-header-title">{t("title")}</h1>
      </header>
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content dashboard-content--stats">
          <div className="dashboard-stats-header">
            <div>
              <h2 className="dashboard-stats-title">{t("dashboard")}</h2>
              <p className="dashboard-stats-subtitle">
                {t("dashboardStats.subtitle", { defaultValue: "Umumiy ko'rinish" })}
              </p>
            </div>
            <button
              type="button"
              className="dashboard-stats-refresh"
              onClick={loadStats}
              disabled={loading}
            >
              {t("dashboardStats.retry", { defaultValue: "Yangilash" })}
            </button>
          </div>

          {error === "VITE_BACKEND_URL" && (
            <p className="dashboard-stats-banner dashboard-stats-banner--warn">
              VITE_BACKEND_URL sozlanmagan.
            </p>
          )}

          {loading ? (
            <p className="dashboard-stats-loading">{t("loading")}</p>
          ) : (
            <div className="dashboard-stats-grid">
              {statEndpoints.map((row) => {
                const Icon = row.icon;
                const n = counts[row.key];
                return (
                  <Link key={row.key} to={row.path} className="dashboard-stat-card">
                    <span className="dashboard-stat-card__icon" aria-hidden>
                      <Icon size={22} />
                    </span>
                    <span className="dashboard-stat-card__label">
                      {t(row.labelKey || row.key)}
                    </span>
                    <span className="dashboard-stat-card__value">
                      {n == null ? "—" : n}
                    </span>
                    <span className="dashboard-stat-card__hint">
                      {t("dashboardStats.records", { defaultValue: "yozuv" })}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
