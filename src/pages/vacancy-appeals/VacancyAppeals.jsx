import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import {
  FiUsers,
  FiTrash2,
  FiPhone,
  FiFileText,
  FiCalendar,
  FiSearch,
  FiX,
  FiDownload,
  FiExternalLink
} from "react-icons/fi";
import "./style.css";

const VacancyApplications = () => {
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [applicationsData, setApplicationsData] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredApplications(applicationsData);
    } else {
      const filtered = applicationsData.filter((app) => {
        const searchLower = searchQuery.toLowerCase();

        const nameMatch = app.name?.toLowerCase().includes(searchLower);
        const phoneMatch = app.phone?.toLowerCase().includes(searchLower);
        const textMatch = app.text?.toLowerCase().includes(searchLower);

        return nameMatch || phoneMatch || textMatch;
      });

      setFilteredApplications(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, applicationsData]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/vacancy-applications`);
      if (res.data.success) {
        setApplicationsData(res.data.data);
        setFilteredApplications(res.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/vacancy-applications/${id}`);
      if (res.data.success) {
        toast.success(t("deleteSuccess"));
        setApplicationsData((prev) => prev.filter((app) => app._id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(t("deleteError"));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();

    const monthsUz = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
    ];

    const monthsRu = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ];

    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const months =
      currentLang === "ru" ? monthsRu : currentLang === "en" ? monthsEn : monthsUz;

    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month} ${year}`;
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageCount = Math.ceil(filteredApplications.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentApplications = filteredApplications.slice(offset, offset + itemsPerPage);

  return (
    <div className="applications-page">
      <Sidebar />
      <div className="applications-content">
        <div className="applications-header">
          <div>
            <h1>{t("vacancyApplications")}</h1>
            <p className="applications-subtitle">
              {t("totalApplications")}: <strong>{filteredApplications.length}</strong>{" "}
              {t("applicationsCount")}
            </p>
          </div>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchApplications")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>{t("loading")}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noApplications")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noApplicationsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="applications-grid">
              {currentApplications.map((application) => (
                <div key={application._id} className="application-card">
                  <div className="application-icon">
                    <FiUsers size={32} />
                  </div>

                  <div className="application-content-card">
                    <h3 className="application-name">{application.name}</h3>

                    <div className="application-info">
                      <FiPhone size={14} />
                      <span>{application.phone}</span>
                    </div>

                    {application.text && (
                      <div className="application-info">
                        <FiFileText size={14} />
                        <p className="application-text">{application.text}</p>
                      </div>
                    )}

                    {application.createdAt && (
                      <div className="application-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(application.createdAt)}</span>
                      </div>
                    )}

                    {application.resume && (
                      <div className="resume-links">
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link view-link"
                        >
                          <FiExternalLink size={16} />
                          {t("viewResume")}
                        </a>
                        <a
                          href={application.resume}
                          download
                          className="resume-link download-link"
                        >
                          <FiDownload size={16} />
                          {t("downloadResume")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="application-actions">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(application._id)}
                      title={t("delete")}
                    >
                      <FiTrash2 size={16} />
                      <span className="action-btn-text">{t("delete")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <ReactPaginate
                previousLabel={`← ${t("previous")}`}
                nextLabel={`${t("next")} →`}
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="pagination"
                activeClassName="active"
                previousClassName="pagination-btn"
                nextClassName="pagination-btn"
                disabledClassName="disabled"
                pageClassName="pagination-page"
                forcePage={currentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VacancyApplications;