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
  FiCalendar,
  FiSearch,
  FiX,
  FiExternalLink,
  FiDownload,
} from "react-icons/fi";
import "./style.css";

const Articles = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [articlesData, setArticlesData] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    desc_en: "",
    desc_ru: "",
    desc_uz: "",
    pdf_file: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articlesData);
    } else {
      const filtered = articlesData.filter((article) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          article.title_en?.toLowerCase().includes(searchLower) ||
          article.title_ru?.toLowerCase().includes(searchLower) ||
          article.title_uz?.toLowerCase().includes(searchLower);

        const descMatch =
          article.desc_en?.toLowerCase().includes(searchLower) ||
          article.desc_ru?.toLowerCase().includes(searchLower) ||
          article.desc_uz?.toLowerCase().includes(searchLower);

        return titleMatch || descMatch;
      });

      setFilteredArticles(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, articlesData]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/articles`);
      if (response.data.success) {
        setArticlesData(response.data.data);
        setFilteredArticles(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pdf_file) {
      toast.error(t("pdfRequired"));
      return;
    }

    try {
      const url = editing
        ? `${BACKEND_URL}/api/articles/${formData._id}`
        : `${BACKEND_URL}/api/articles`;
      const method = editing ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.data.success) {
        toast.success(editing ? t("articleUpdated") : t("articleAdded"));
        fetchArticles();
        handleModalClose();
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error(t("error"));
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/articles/${id}`);
      if (response.data.success) {
        toast.success(t("articleDeleted"));
        setArticlesData(articlesData.filter((art) => art._id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error(t("deleteError"));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title_en: "",
      title_ru: "",
      title_uz: "",
      desc_en: "",
      desc_ru: "",
      desc_uz: "",
      pdf_file: "",
    });
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

  const pageCount = Math.ceil(filteredArticles.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentArticles = filteredArticles.slice(offset, offset + itemsPerPage);

  return (
    <div className="articles-page">
      <Sidebar />
      <div className="articles-content">
        <div className="articles-header">
          <div>
            <h1>{t("articles")}</h1>
            <p className="articles-subtitle">
              {t("totalArticles")}: <strong>{filteredArticles.length}</strong>{" "}
              {t("articlesCount")}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(false);
              setModalOpen(true);
            }}
            className="add-article-btn"
          >
            <FiPlus size={20} />
            {t("addArticle")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchArticles")}
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
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noArticles")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noArticlesDesc")}</p>
          </div>
        ) : (
          <>
            <div className="articles-grid">
              {currentArticles.map((article) => (
                <div key={article._id} className="article-card">
                  <div className="article-icon">
                    <FiFileText size={32} />
                  </div>

                  <div className="article-content-card">
                    <h3 className="article-title">
                      {currentLang === "en"
                        ? article.title_en
                        : currentLang === "ru"
                        ? article.title_ru
                        : article.title_uz}
                    </h3>

                    <p className="article-desc">
                      {currentLang === "en"
                        ? article.desc_en?.slice(0, 120)
                        : currentLang === "ru"
                        ? article.desc_ru?.slice(0, 120)
                        : article.desc_uz?.slice(0, 120)}
                      ...
                    </p>

                    {article.createdAt && (
                      <div className="article-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                    )}

                    {article.pdf_file && (
                      <div className="article-pdf-links">
                        <a
                          href={article.pdf_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link view-pdf"
                        >
                          <FiExternalLink size={16} />
                          {t("viewPdf")}
                        </a>
                        <a
                          href={article.pdf_file}
                          download
                          className="pdf-link download-pdf"
                        >
                          <FiDownload size={16} />
                          {t("downloadPdf")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="article-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setEditing(true);
                        setFormData(article);
                        setModalOpen(true);
                      }}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteArticle(article._id)}
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

        <Modal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
        >
          <div className="modal-form">
            <h2 className="modal-title">
              {editing ? t("editArticle") : t("addArticle")}
            </h2>

            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                value={formData.title_uz}
                onChange={(e) =>
                  setFormData({ ...formData, title_uz: e.target.value })
                }
                placeholder={t("titleUz")}
                className="form-input"
                required
              />
              <textarea
                value={formData.desc_uz}
                onChange={(e) =>
                  setFormData({ ...formData, desc_uz: e.target.value })
                }
                placeholder={t("textUz")}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("russian")}</h3>
              <input
                type="text"
                value={formData.title_ru}
                onChange={(e) =>
                  setFormData({ ...formData, title_ru: e.target.value })
                }
                placeholder={t("titleRu")}
                className="form-input"
                required
              />
              <textarea
                value={formData.desc_ru}
                onChange={(e) =>
                  setFormData({ ...formData, desc_ru: e.target.value })
                }
                placeholder={t("textRu")}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("english")}</h3>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) =>
                  setFormData({ ...formData, title_en: e.target.value })
                }
                placeholder={t("titleEn")}
                className="form-input"
                required
              />
              <textarea
                value={formData.desc_en}
                onChange={(e) =>
                  setFormData({ ...formData, desc_en: e.target.value })
                }
                placeholder={t("textEn")}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("pdfLink")}</h3>
              <input
                type="url"
                value={formData.pdf_file}
                onChange={(e) =>
                  setFormData({ ...formData, pdf_file: e.target.value })
                }
                placeholder={t("pdfLinkPlaceholder")}
                className="form-input"
                required
              />
            </div>

            {formData.pdf_file && (
              <div className="pdf-preview">
                <a
                  href={formData.pdf_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-preview-link"
                >
                  <FiFileText size={20} />
                  {t("viewPdf")}
                </a>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {editing ? t("save") : t("addArticle")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Articles;