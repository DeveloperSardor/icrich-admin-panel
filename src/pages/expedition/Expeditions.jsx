import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCalendar,
  FiSearch,
  FiX,
  FiYoutube,
  FiUpload
} from "react-icons/fi";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ExpeditionsPage = () => {
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;

  const [expeditionData, setExpeditionData] = useState([]);
  const [filteredExpeditions, setFilteredExpeditions] = useState([]);
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
    images: [],
  });
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  // ReactQuill sozlamalari
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

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
    fetchExpedition();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExpeditions(expeditionData);
    } else {
      const filtered = expeditionData.filter((item) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          item.title_en?.toLowerCase().includes(searchLower) ||
          item.title_ru?.toLowerCase().includes(searchLower) ||
          item.title_uz?.toLowerCase().includes(searchLower);

        // HTML taglarini olib tashlash
        const stripHtml = (html) => {
          const tmp = document.createElement("DIV");
          tmp.innerHTML = html || "";
          return tmp.textContent || tmp.innerText || "";
        };

        const textMatch =
          stripHtml(item.text_en || "").toLowerCase().includes(searchLower) ||
          stripHtml(item.text_ru || "").toLowerCase().includes(searchLower) ||
          stripHtml(item.text_uz || "").toLowerCase().includes(searchLower);

        return titleMatch || textMatch;
      });

      setFilteredExpeditions(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, expeditionData]);

  const fetchExpedition = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/expedition`);
      if (res.data.success) {
        setExpeditionData(res.data.data);
        setFilteredExpeditions(res.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching expeditions:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
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
      images: [],
    });
    setVideoPreview("");
    setYoutubeError("");
  };

  const validateYouTubeUrl = (url) => {
    const youtubePattern =
      /^(https?:\/\/)?(www\.youtube\.com\/(?:[^\/\n\s]+\/)*|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubePattern.test(url);
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
        uploadedFiles.push(res.data.secure_url);
        toast.success(t("imageUploadSuccess"));
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(t("imageUploadError"));
      }
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...uploadedFiles],
    });
    setLoadingFiles(false);
  };

  const handleRemoveFile = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  // HTML matnni qisqartirish
  const truncateHtmlText = (html, maxLength) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.youtube_link && formData.images.length === 0) {
      toast.error(t("addMedia"));
      return;
    }

    if (formData.youtube_link && !validateYouTubeUrl(formData.youtube_link)) {
      toast.error(t("invalidYouTubeUrl"));
      return;
    }

    try {
      const url = isEditing
        ? `${BACKEND_URL}/api/expedition/${formData.id}`
        : `${BACKEND_URL}/api/expedition`;
      const method = isEditing ? "put" : "post";

      const payload = {
        title_en: formData.title_en,
        text_en: formData.text_en,
        title_ru: formData.title_ru,
        text_ru: formData.text_ru,
        title_uz: formData.title_uz,
        text_uz: formData.text_uz,
        youtube_link: formData.youtube_link,
        images: formData.images,
      };

      const res = await axios[method](url, payload);

      if (res.data.success) {
        toast.success(isEditing ? t("expeditionUpdated") : t("expeditionAdded"));
        fetchExpedition();
        handleModalClose();
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      console.error("Error submitting expedition:", error);
      toast.error(t("error"));
    }
  };

  const openEditModal = (expedition) => {
    setFormData({
      title_en: expedition.title_en,
      title_ru: expedition.title_ru,
      title_uz: expedition.title_uz,
      text_en: expedition.text_en,
      text_ru: expedition.text_ru,
      text_uz: expedition.text_uz,
      youtube_link: expedition.youtube_link || "",
      images: expedition.images || [],
      id: expedition._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteExpedition = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/expedition/${id}`);
      if (res.data.success) {
        toast.success(t("expeditionDeleted"));
        fetchExpedition();
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting expedition:", error);
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

  const pageCount = Math.ceil(filteredExpeditions.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentExpeditions = filteredExpeditions.slice(offset, offset + itemsPerPage);

  return (
    <div className="expedition-page">
      <Sidebar />
      <div className="expedition-content">
        <div className="expedition-header">
          <div>
            <h1>{t("expedition")}</h1>
            <p className="expedition-subtitle">
              {t("totalExpeditions")}: <strong>{filteredExpeditions.length}</strong>{" "}
              {t("expeditionsCount")}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="add-expedition-btn">
            <FiPlus size={20} />
            {t("addExpedition")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchExpeditions")}
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
        ) : filteredExpeditions.length === 0 ? (
          <div className="empty-state">
            <FiImage size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noExpeditions")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noExpeditionsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="expedition-grid">
              {currentExpeditions.map((expedition) => (
                <div className="expedition-card" key={expedition._id}>
                  <div className="expedition-card-media">
                    {expedition.youtube_link && renderYoutubeIframe(expedition.youtube_link)}
                    {expedition.images?.length > 0 && !expedition.youtube_link && (
                      <Slider {...sliderSettings}>
                        {expedition.images.map((file, index) => (
                          <div key={index} className="slider-item">
                            <img src={file} alt={`Slide ${index}`} />
                          </div>
                        ))}
                      </Slider>
                    )}
                    {!expedition.youtube_link && !expedition.images?.length && (
                      <div className="no-media">
                        <FiImage size={48} />
                      </div>
                    )}
                  </div>

                  <div className="expedition-card-content">
                    <h3 className="expedition-title">
                      {currentLang === "en"
                        ? expedition.title_en
                        : currentLang === "ru"
                        ? expedition.title_ru
                        : expedition.title_uz}
                    </h3>
                    <p className="expedition-excerpt">
                      {truncateHtmlText(
                        currentLang === "en"
                          ? expedition.text_en
                          : currentLang === "ru"
                          ? expedition.text_ru
                          : expedition.text_uz,
                        150
                      )}
                    </p>

                    {expedition.createdAt && (
                      <div className="expedition-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(expedition.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="expedition-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(expedition)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteExpedition(expedition._id)}
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
              {isEditing ? t("editExpedition") : t("addExpedition")}
            </h2>

            {/* O'ZBEK TILI */}
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
              <ReactQuill
                theme="snow"
                value={formData.text_uz}
                onChange={(value) =>
                  setFormData({ ...formData, text_uz: value })
                }
                modules={modules}
                formats={formats}
                placeholder="Tavsif (O'zbekcha)"
                className="quill-editor"
              />
            </div>

            {/* RUS TILI */}
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
              <ReactQuill
                theme="snow"
                value={formData.text_ru}
                onChange={(value) =>
                  setFormData({ ...formData, text_ru: value })
                }
                modules={modules}
                formats={formats}
                placeholder="Описание (Русский)"
                className="quill-editor"
              />
            </div>

            {/* INGLIZ TILI */}
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
              <ReactQuill
                theme="snow"
                value={formData.text_en}
                onChange={(value) =>
                  setFormData({ ...formData, text_en: value })
                }
                modules={modules}
                formats={formats}
                placeholder="Description (English)"
                className="quill-editor"
              />
            </div>

            {/* MEDIA BO'LIMI */}
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
                  <FiUpload size={20} />
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

              {formData.images.length > 0 && (
                <div className="uploaded-files-grid">
                  {formData.images.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <img src={file} alt={`Upload ${index}`} />
                      <button
                        className="file-delete-btn"
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loadingFiles}>
              {isEditing ? t("save") : t("addExpedition")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ExpeditionsPage;