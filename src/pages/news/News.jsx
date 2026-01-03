import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Slider from "react-slick";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiYoutube,
  FiImage,
  FiCalendar,
  FiSearch,
  FiX
} from "react-icons/fi";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NewsPage = () => {
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [newsData, setNewsData] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    text_en: "",
    text_ru: "",
    text_uz: "",
    youtube_link: "",
    files: [],
  });
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  
  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Search va filter logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNews(newsData);
    } else {
      const filtered = newsData.filter((news) => {
        const searchLower = searchQuery.toLowerCase();
        
        const titleMatch = 
          news.title_en?.toLowerCase().includes(searchLower) ||
          news.title_ru?.toLowerCase().includes(searchLower) ||
          news.title_uz?.toLowerCase().includes(searchLower);
        
        const textMatch = 
          news.text_en?.toLowerCase().includes(searchLower) ||
          news.text_ru?.toLowerCase().includes(searchLower) ||
          news.text_uz?.toLowerCase().includes(searchLower);
        
        return titleMatch || textMatch;
      });
      
      setFilteredNews(filtered);
      setCurrentPage(0); // Reset to first page
    }
  }, [searchQuery, newsData]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/news`);
      
      if (res.data.success) {
        setNewsData(res.data.data);
        setFilteredNews(res.data.data);
      } else {
        toast.error(t("fetchNewsError"));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(t("fetchNewsError"));
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const pageCount = Math.ceil(filteredNews.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentNews = filteredNews.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setIsEditing(false);
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
      youtube_link: "",
      files: [],
    });
    setVideoPreview("");
    setYoutubeError("");
  };

  const validateYouTubeUrl = (url) => {
    const youtubePattern =
      /^(https?\:\/\/)?(www\.youtube\.com\/(?:[^\/\n\s]+\/)*|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubePattern.test(url);
  };

  const handleYoutubeLinkChange = (e) => {
    const url = e.target.value.trim();
    setFormData({ ...formData, youtube_link: url });

    if (!url) {
      setVideoPreview("");
      setYoutubeError("");
      return;
    }

    if (validateYouTubeUrl(url)) {
      setVideoPreview(url);
      setYoutubeError("");
    } else {
      setVideoPreview("");
      setYoutubeError(t("invalidYouTubeUrl"));
    }
  };

  const renderYoutubeIframe = (url) => {
    const youtubePattern =
      /(?:https?:\/\/(?:www\.)?)?(?:youtube\.com\/(?:[^\/\n\s]+\/)*|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const videoId = url.match(youtubePattern)?.[1];
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

  const renderUploadedFiles = () => {
    return (
      <div className="uploaded-files-grid">
        {formData.files.map((file, index) => (
          <div key={index} className="uploaded-file-item">
            <img src={file.link} alt={`Upload ${index}`} />
            <button
              className="file-delete-btn"
              onClick={() => {
                const updatedFiles = formData.files.filter((_, i) => i !== index);
                setFormData({ ...formData, files: updatedFiles });
              }}
            >
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setLoadingFiles(true);
    const uploadedFiles = [];

    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", "chat-app");
      uploadData.append("cloud_name", "roadsidecoder");

      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/roadsidecoder/image/upload",
          uploadData
        );
        uploadedFiles.push({ type_file: "image", link: res.data.secure_url });
      } catch (error) {
        toast.error(t("fileUploadError"));
      }
    }

    setFormData({ ...formData, files: [...formData.files, ...uploadedFiles] });
    setLoadingFiles(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.youtube_link && formData.files.length > 0) {
      toast.error(t("chooseEitherMedia"));
      return;
    }

    if (!formData.youtube_link && formData.files.length === 0) {
      toast.error(t("addMedia"));
      return;
    }

    if (formData.youtube_link && !validateYouTubeUrl(formData.youtube_link)) {
      toast.error(t("invalidYouTubeUrl"));
      return;
    }

    const payload = {
      title_en: formData.title_en,
      text_en: formData.text_en,
      title_ru: formData.title_ru,
      text_ru: formData.text_ru,
      title_uz: formData.title_uz,
      text_uz: formData.text_uz,
      youtube_link: formData.youtube_link,
      files: formData.files.map((file) => file.link),
    };

    try {
      const url = isEditing
        ? `${BACKEND_URL}/api/news/${formData.id}`
        : `${BACKEND_URL}/api/news`;
      const method = isEditing ? "put" : "post";

      const res = await axios[method](url, payload);

      if (res.data.success) {
        toast.success(isEditing ? t("newsUpdated") : t("newsAdded"));
        fetchNews();
        handleModalClose();
      } else {
        toast.error(t("errorAddingNews"));
      }
    } catch (error) {
      toast.error(t("errorAddingNews"));
    }
  };

  const openEditModal = (news) => {
    setFormData({
      title_en: news.title_en,
      title_ru: news.title_ru,
      title_uz: news.title_uz,
      text_en: news.text_en,
      text_ru: news.text_ru,
      text_uz: news.text_uz,
      youtube_link: news.youtube_link,
      files: news.files || [],
      id: news._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/news/${id}`);
      if (res.data.success) {
        toast.success(t("newsDeleted"));
        fetchNews();
      } else {
        toast.error(t("errorDeletingNews"));
      }
    } catch (error) {
      toast.error(t("errorDeletingNews"));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    
    const monthsUz = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
    ];
    
    const monthsRu = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const months = currentLang === 'ru' ? monthsRu : 
                   currentLang === 'en' ? monthsEn : monthsUz;
    
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month} ${year}`;
  };

  return (
    <div className="news-page">
      <Sidebar />
      <div className="news-content">
        <div className="news-header">
          <div>
            <h1>{t("news")}</h1>
            <p className="news-subtitle">
              {t("total")}: <strong>{filteredNews.length}</strong> {t("newsCount")}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="add-news-btn">
            <FiPlus size={20} />
            {t("addNews")}
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchNews") || "Yangiliklarni qidirish..."}
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
        ) : filteredNews.length === 0 ? (
          <div className="empty-state">
            <FiImage size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noNews")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noNewsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="news-grid">
              {currentNews.map((news) => (
                <div className="news-card" key={news._id}>
                  <div className="news-card-media">
                    {news.youtube_link && renderYoutubeIframe(news.youtube_link)}
                    {news.files?.length > 0 && !news.youtube_link && (
                      <Slider {...sliderSettings}>
                        {news.files.map((file, index) => (
                          <div key={index} className="slider-item">
                            <img src={file.link} alt={`Slide ${index}`} />
                          </div>
                        ))}
                      </Slider>
                    )}
                    {!news.youtube_link && !news.files?.length && (
                      <div className="no-media">
                        <FiImage size={48} />
                      </div>
                    )}
                  </div>

                  <div className="news-card-content">
                    <h3 className="news-title">
                      {currentLang === "en"
                        ? news.title_en
                        : currentLang === "ru"
                        ? news.title_ru
                        : news.title_uz}
                    </h3>
                    <p className="news-excerpt">
                      {currentLang === "en"
                        ? news.text_en?.slice(0, 150)
                        : currentLang === "ru"
                        ? news.text_ru?.slice(0, 150)
                        : news.text_uz?.slice(0, 150)}
                      ...
                    </p>

                    {news.createdAt && (
                      <div className="news-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(news.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="news-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(news)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteNews(news._id)}
                      title={t("delete")}
                    >
                      <FiTrash2 size={16} />
                      <span className="action-btn-text">{t("delete")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <ReactPaginate
                previousLabel={`← ${t("previous") || "Oldingi"}`}
                nextLabel={`${t("next") || "Keyingi"} →`}
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
              {isEditing ? t("editNews") : t("addNews")}
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
                value={formData.text_ru}
                onChange={(e) =>
                  setFormData({ ...formData, text_ru: e.target.value })
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
                value={formData.text_en}
                onChange={(e) =>
                  setFormData({ ...formData, text_en: e.target.value })
                }
                placeholder={t("textEn")}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("media")}</h3>
              <div className="media-input-group">
                <FiYoutube size={20} />
                <input
                  type="text"
                  value={formData.youtube_link}
                  onChange={handleYoutubeLinkChange}
                  placeholder={t("youtubeLink")}
                  className="form-input"
                />
              </div>
              {videoPreview && (
                <div className="youtube-preview">
                  {renderYoutubeIframe(formData.youtube_link)}
                </div>
              )}
              {youtubeError && <p className="error-message">{youtubeError}</p>}

              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <FiImage size={20} />
                  <span>{loadingFiles ? t("uploading") : t("uploadImages")}</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={loadingFiles}
                    accept="image/*"
                  />
                </label>
              </div>

              {formData.files.length > 0 && renderUploadedFiles()}
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? t("loading") : isEditing ? t("edit") : t("addNews")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default NewsPage;