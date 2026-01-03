import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCalendar,
  FiSearch,
  FiX,
  FiYoutube,
} from "react-icons/fi";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const UneskoPage = () => {
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;

  const [uneskoData, setUneskoData] = useState([]);
  const [filteredUnesko, setFilteredUnesko] = useState([]);
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
    fetchUnesko();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUnesko(uneskoData);
    } else {
      const filtered = uneskoData.filter((item) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          item.title_en?.toLowerCase().includes(searchLower) ||
          item.title_ru?.toLowerCase().includes(searchLower) ||
          item.title_uz?.toLowerCase().includes(searchLower);

        const textMatch =
          item.text_en?.toLowerCase().includes(searchLower) ||
          item.text_ru?.toLowerCase().includes(searchLower) ||
          item.text_uz?.toLowerCase().includes(searchLower);

        return titleMatch || textMatch;
      });

      setFilteredUnesko(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, uneskoData]);

  const fetchUnesko = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/unesko`);
      if (res.data.success) {
        setUneskoData(res.data.data);
        setFilteredUnesko(res.data.data);
      } else {
        toast.error(t("fetchUneskoError"));
      }
    } catch (error) {
      console.error("Error fetching UNESCO:", error);
      toast.error(t("fetchUneskoError"));
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
      } catch (error) {
        toast.error(t("fileUploadError"));
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
        ? `${BACKEND_URL}/api/unesko/${formData.id}`
        : `${BACKEND_URL}/api/unesko`;
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
        toast.success(isEditing ? t("uneskoUpdated") : t("uneskoAdded"));
        fetchUnesko();
        handleModalClose();
      } else {
        toast.error(t("errorAddingUnesko"));
      }
    } catch (error) {
      console.error("Error submitting UNESCO:", error);
      toast.error(t("errorAddingUnesko"));
    }
  };

  const openEditModal = (unesko) => {
    setFormData({
      title_en: unesko.title_en,
      title_ru: unesko.title_ru,
      title_uz: unesko.title_uz,
      text_en: unesko.text_en,
      text_ru: unesko.text_ru,
      text_uz: unesko.text_uz,
      youtube_link: unesko.youtube_link || "",
      images: unesko.images || [],
      id: unesko._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteUnesko = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/unesko/${id}`);
      if (res.data.success) {
        toast.success(t("uneskoDeleted"));
        fetchUnesko();
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting UNESCO:", error);
      toast.error(t("deleteError"));
    }
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

  const pageCount = Math.ceil(filteredUnesko.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentUnesko = filteredUnesko.slice(offset, offset + itemsPerPage);

  return (
    <div className="unesko-page">
      <Sidebar />
      <div className="unesko-content">
        <div className="unesko-header">
          <div>
            <h1>{t("unesko")}</h1>
            <p className="unesko-subtitle">
              {t("totalUnesko")}: <strong>{filteredUnesko.length}</strong>{" "}
              {t("uneskoCount")}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="add-unesko-btn">
            <FiPlus size={20} />
            {t("addUnesko")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchUnesko")}
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
        ) : filteredUnesko.length === 0 ? (
          <div className="empty-state">
            <FiImage size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noUnesko")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noUneskoDesc")}</p>
          </div>
        ) : (
          <>
            <div className="unesko-grid">
              {currentUnesko.map((unesko) => (
                <div className="unesko-card" key={unesko._id}>
                  <div className="unesko-card-media">
                    {unesko.youtube_link && renderYoutubeIframe(unesko.youtube_link)}
                    {unesko.images?.length > 0 && !unesko.youtube_link && (
                      <Slider {...sliderSettings}>
                        {unesko.images.map((file, index) => (
                          <div key={index} className="slider-item">
                            <img src={file} alt={`Slide ${index}`} />
                          </div>
                        ))}
                      </Slider>
                    )}
                    {!unesko.youtube_link && !unesko.images?.length && (
                      <div className="no-media">
                        <FiImage size={48} />
                      </div>
                    )}
                  </div>

                  <div className="unesko-card-content">
                    <h3 className="unesko-title">
                      {currentLang === "en"
                        ? unesko.title_en
                        : currentLang === "ru"
                        ? unesko.title_ru
                        : unesko.title_uz}
                    </h3>
                    <p className="unesko-excerpt">
                      {currentLang === "en"
                        ? unesko.text_en?.slice(0, 150)
                        : currentLang === "ru"
                        ? unesko.text_ru?.slice(0, 150)
                        : unesko.text_uz?.slice(0, 150)}
                      ...
                    </p>

                    {unesko.createdAt && (
                      <div className="unesko-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(unesko.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="unesko-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(unesko)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUnesko(unesko._id)}
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
              {isEditing ? t("editUnesko") : t("addUnesko")}
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

              {formData.images.length > 0 && (
                <div className="uploaded-files-grid">
                  {formData.images.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <img src={file} alt={`Upload ${index}`} />
                      <button
                        className="file-delete-btn"
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
              {isEditing ? t("save") : t("addUnesko")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UneskoPage;