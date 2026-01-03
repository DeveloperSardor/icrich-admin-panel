import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiSearch,
  FiX,
  FiExternalLink,
  FiCalendar
} from "react-icons/fi";
import "./style.css";

const Charter = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");

  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    link: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocs(docs);
    } else {
      const filtered = docs.filter((doc) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          doc.title_en?.toLowerCase().includes(searchLower) ||
          doc.title_ru?.toLowerCase().includes(searchLower) ||
          doc.title_uz?.toLowerCase().includes(searchLower);

        return titleMatch;
      });

      setFilteredDocs(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, docs]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/charter`);
      if (response.data.success) {
        setDocs(response.data.data);
        setFilteredDocs(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching charters:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/charter/${editingId}`
        : `${BACKEND_URL}/api/charter`;
      const method = editingId ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.data.success) {
        toast.success(editingId ? t("editSuccess") : t("addSuccess"));
        fetchDocs();
        closeModal();
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      console.error("Error submitting charter:", error);
      toast.error(t("error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/charter/${id}`);
      if (response.data.success) {
        toast.success(t("deleteSuccess"));
        setDocs(docs.filter((doc) => doc._id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting charter:", error);
      toast.error(t("deleteError"));
    }
  };

  const openModal = (doc = null) => {
    setEditingId(doc ? doc._id : null);
    setFormData(
      doc
        ? {
            title_en: doc.title_en || "",
            title_ru: doc.title_ru || "",
            title_uz: doc.title_uz || "",
            link: doc.link || "",
          }
        : {
            title_en: "",
            title_ru: "",
            title_uz: "",
            link: "",
          }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title_en: "",
      title_ru: "",
      title_uz: "",
      link: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();

    const monthsUz = [
      "yanvar",
      "fevral",
      "mart",
      "aprel",
      "may",
      "iyun",
      "iyul",
      "avgust",
      "sentabr",
      "oktabr",
      "noyabr",
      "dekabr",
    ];

    const monthsRu = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    const monthsEn = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
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

  const pageCount = Math.ceil(filteredDocs.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentDocs = filteredDocs.slice(offset, offset + itemsPerPage);

  return (
    <div className="charter-page">
      <Sidebar />
      <div className="charter-content">
        <div className="charter-header">
          <div>
            <h1>{t("charter")}</h1>
            <p className="charter-subtitle">
              {t("totalCharters")}: <strong>{filteredDocs.length}</strong>{" "}
              {t("chartersCount")}
            </p>
          </div>
          <button onClick={() => openModal()} className="add-charter-btn">
            <FiPlus size={20} />
            {t("addCharter")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchCharters")}
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
        ) : filteredDocs.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noCharters")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noChartersDesc")}</p>
          </div>
        ) : (
          <>
            <div className="charter-grid">
              {currentDocs.map((doc) => (
                <div key={doc._id} className="charter-card">
                  <div className="charter-icon">
                    <FiFileText size={32} />
                  </div>

                  <div className="charter-content-card">
                    <h3 className="charter-title">
                      {currentLang === "en"
                        ? doc.title_en
                        : currentLang === "ru"
                        ? doc.title_ru
                        : doc.title_uz}
                    </h3>

                    {doc.createdAt && (
                      <div className="charter-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    )}

                    {doc.link && (
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="charter-link"
                      >
                        <FiExternalLink size={16} />
                        {t("openDocument")}
                      </a>
                    )}
                  </div>

                  <div className="charter-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openModal(doc)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(doc._id)}
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

        <Modal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit}>
          <div className="modal-form">
            <h2 className="modal-title">
              {editingId ? t("editCharter") : t("addCharter")}
            </h2>

            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                placeholder="Nizom nomi (O'zbekcha)"
                value={formData.title_uz}
                onChange={(e) => handleInputChange("title_uz", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("russian")}</h3>
              <input
                type="text"
                placeholder="Название устава (Русский)"
                value={formData.title_ru}
                onChange={(e) => handleInputChange("title_ru", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("english")}</h3>
              <input
                type="text"
                placeholder="Charter Title (English)"
                value={formData.title_en}
                onChange={(e) => handleInputChange("title_en", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("documentLink")}</h3>
              <input
                type="url"
                placeholder={t("linkPlaceholder")}
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {editingId ? t("save") : t("addCharter")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Charter;