import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import "./style.css";

const VacancyApplications = () => {
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;

  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchApplications();
  }, [currentLang, currentPage]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/vacancy-applications?page=${currentPage}`
      );
      if (res.data.success) {
        setApplicationsData(res.data.data);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("confirmDelete"))) {
      try {
        const res = await axios.delete(
          `${BACKEND_URL}/api/vacancy-applications/${id}`
        );
        if (res.data.success) {
          toast.success(res.data.message);
          // Remove the deleted application from the state
          setApplicationsData((prev) =>
            prev.filter((application) => application._id !== id)
          );
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return <div className="pagination">{pageNumbers}</div>;
  };

  return (
    <div className="vacancy-applications-page">
      <Sidebar />
      <div className="applications-content">
        <h1 className="vacancy-title">{t("vacancyApplications")}</h1>

        <div className="applications-list">
          {applicationsData.map((application) => (
            <div className="application-card" key={application._id}>
              <h2>{application.name}</h2>
              <p>{t("phone")}: {application.phone}</p>
              <p>{t("applicationText")}: {application.text}</p>
              <a href={application.resume} target="_blank" rel="noopener noreferrer">
                {t("viewResume")}
              </a>
              <button
                className="delete-btn"
                onClick={() => handleDelete(application._id)}
              >
                {t("delete")}
              </button>
            </div>
          ))}
        </div>

        {renderPagination()}
      </div>
    </div>
  );
};

export default VacancyApplications;
