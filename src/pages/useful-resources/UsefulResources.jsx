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
  FiYoutube,
  FiBookOpen,
} from "react-icons/fi";
import "./style.css";

const Resources = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [resourcesData, setResourcesData] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    text_en: "",
    text_ru: "",
    text_uz: "",
    pdf_link: "",
    youtube_link: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResources(resourcesData);
    } else {
      const filtered = resourcesData.filter((resource) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          resource.title_en?.toLowerCase().includes(searchLower) ||
          resource.title_ru?.toLowerCase().includes(searchLower) ||
          resource.title_uz?.toLowerCase().includes(searchLower);

        const textMatch =
          resource.text_en?.toLowerCase().includes(searchLower) ||
          resource.text_ru?.toLowerCase().includes(searchLower) ||
          resource.text_uz?.toLowerCase().includes(searchLower);

        return titleMatch || textMatch;
      });

      setFilteredResources(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, resourcesData]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/resources`);
      if (response.data.success) {
        setResourcesData(response.data.data);
        setFilteredResources(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pdf_link && !formData.youtube_link) {
      toast.error(t("mediaRequired"));
      return;
    }

    if (formData.pdf_link && formData.youtube_link) {
      toast.error(t("onlyOneMediaAllowed"));
      return;
    }

    try {
      const url = editing
        ? `${BACKEND_URL}/api/resources/${formData._id}`
        : `${BACKEND_URL}/api/resources`;
      const method = editing ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.data.success) {
        toast.success(editing ? t("resourceUpdated") : t("resourceAdded"));
        fetchResources();
        handleModalClose();
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      console.error("Error submitting resource:", error);
      toast.error(t("error"));
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/resources/${id}`);
      if (response.data.success) {
        toast.success(t("resourceDeleted"));
        setResourcesData(resourcesData.filter((res) => res._id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
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
      text_en: "",
      text_ru: "",
      text_uz: "",
      pdf_link: "",
      youtube_link: "",
    });
  };

  const getYouTubeVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com"
      ) {
        return urlObj.searchParams.get("v");
      }
    } catch (error) {
      console.error("Invalid YouTube URL:", error);
    }
    return null;
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

  const renderYoutubeIframe = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return (
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return null;
  };

  const pageCount = Math.ceil(filteredResources.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentResources = filteredResources.slice(offset, offset + itemsPerPage);

  return (
    <div className="resources-page">
      <Sidebar />
      <div className="resources-content">
        <div className="resources-header">
          <div>
            <h1>{t("usefulResources")}</h1>
            <p className="resources-subtitle">
              {t("totalResources")}: <strong>{filteredResources.length}</strong>{" "}
              {t("resourcesCount")}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(false);
              setModalOpen(true);
            }}
            className="add-resource-btn"
          >
            <FiPlus size={20} />
            {t("addResource")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchResources")}
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
        ) : filteredResources.length === 0 ? (
          <div className="empty-state">
            <FiBookOpen size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noResources")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noResourcesDesc")}</p>
          </div>
        ) : (
          <>
            <div className="resources-grid">
              {currentResources.map((resource) => (
                <div key={resource._id} className="resource-card">
                  {resource.youtube_link && (
                    <div className="resource-media">
                      {renderYoutubeIframe(resource.youtube_link)}
                    </div>
                  )}

                  {resource.pdf_link && !resource.youtube_link && (
                    <div className="resource-icon pdf-icon">
                      <FiFileText size={32} />
                    </div>
                  )}

                  <div className="resource-content-card">
                    <h3 className="resource-title">
                      {currentLang === "en"
                        ? resource.title_en
                        : currentLang === "ru"
                        ? resource.title_ru
                        : resource.title_uz}
                    </h3>

                    {resource[`text_${currentLang}`] && (
                      <p className="resource-desc">
                        {resource[`text_${currentLang}`]?.slice(0, 100)}
                        {resource[`text_${currentLang}`]?.length > 100 && "..."}
                      </p>
                    )}

                    {resource.createdAt && (
                      <div className="resource-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(resource.createdAt)}</span>
                      </div>
                    )}

                    {resource.pdf_link && (
                      <div className="resource-pdf-links">
                        <a
                          href={resource.pdf_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link view-pdf"
                        >
                          <FiExternalLink size={16} />
                          {t("viewPdf")}
                        </a>
                        <a
                          href={resource.pdf_link}
                          download
                          className="pdf-link download-pdf"
                        >
                          <FiDownload size={16} />
                          {t("downloadPdf")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="resource-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setEditing(true);
                        setFormData(resource);
                        setModalOpen(true);
                      }}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteResource(resource._id)}
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
              {editing ? t("editResource") : t("addResource")}
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
                value={formData.text_uz}
                onChange={(e) =>
                  setFormData({ ...formData, text_uz: e.target.value })
                }
                placeholder={t("textUz") + " (" + t("optional") + ")"}
                className="form-textarea"
                rows="3"
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
                value={formData.text_ru}
                onChange={(e) =>
                  setFormData({ ...formData, text_ru: e.target.value })
                }
                placeholder={t("textRu") + " (" + t("optional") + ")"}
                className="form-textarea"
                rows="3"
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
                value={formData.text_en}
                onChange={(e) =>
                  setFormData({ ...formData, text_en: e.target.value })
                }
                placeholder={t("textEn") + " (" + t("optional") + ")"}
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("media")}</h3>
              <div className="media-input-group">
                <FiFileText size={20} />
                <input
                  type="url"
                  value={formData.pdf_link}
                  onChange={(e) =>
                    setFormData({ ...formData, pdf_link: e.target.value })
                  }
                  placeholder={t("pdfLinkPlaceholder")}
                  className="form-input"
                />
              </div>

              <div className="media-input-group">
                <FiYoutube size={20} />
                <input
                  type="url"
                  value={formData.youtube_link}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube_link: e.target.value })
                  }
                  placeholder={t("youtubeLinkPlaceholder")}
                  className="form-input"
                />
              </div>

              <p className="media-note">
                {t("onlyOneMediaAllowed")}
              </p>
            </div>

            <button type="submit" className="submit-btn">
              {editing ? t("save") : t("addResource")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Resources;