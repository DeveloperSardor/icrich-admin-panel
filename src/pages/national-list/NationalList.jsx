import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import Slider from "react-slick";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NationalListPage = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  // State management
  const [nationalData, setNationalData] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [youtubeError, setYoutubeError] = useState("");

  useEffect(() => {
    fetchNational();
  }, [currentLang]);

  // Fetch national list data
  const fetchNational = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/national-list`);
      if (res.data.success) {
        setNationalData(res.data.data);
      } else {
        toast.error(t("fetchNationalError"));
      }
    } catch (error) {
      toast.error(error.message || t("errorFetchingData"));
    }
  };

  // Modal handlers
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

  // YouTube validation
  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes("youtube.com")) {
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

  // File upload handler
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setLoadingFiles(true);
    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t("invalidFileType"));
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("fileTooLarge"));
        continue;
      }

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
        console.error("Upload error:", error);
      }
    }

    setFormData({ 
      ...formData, 
      images: [...formData.images, ...uploadedFiles] 
    });
    setLoadingFiles(false);
  };

  const handleRemoveFile = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_en || !formData.title_ru || !formData.title_uz) {
      toast.error(t("allTitlesRequired"));
      return;
    }

    if (!formData.text_en || !formData.text_ru || !formData.text_uz) {
      toast.error(t("allTextsRequired"));
      return;
    }

    if (!formData.youtube_link && formData.images.length === 0) {
      toast.error(t("addMedia"));
      return;
    }

    if (formData.youtube_link && !validateYouTubeUrl(formData.youtube_link)) {
      toast.error(t("invalidYouTubeUrl"));
      return;
    }

    setLoading(true);

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

    try {
      const url = isEditing
        ? `${BACKEND_URL}/api/national-list/${formData.id}`
        : `${BACKEND_URL}/api/national-list`;
      const method = isEditing ? "put" : "post";

      const res = await axios[method](url, payload);

      if (res.data.success) {
        toast.success(
          isEditing 
            ? t("successfullyUpdated") 
            : t("successfullyAdded")
        );
        fetchNational();
        handleModalClose();
      } else {
        toast.error(t("errorAddingNational"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit handler
  const openEditModal = (national) => {
    setFormData({
      title_en: national.title_en || "",
      title_ru: national.title_ru || "",
      title_uz: national.title_uz || "",
      text_en: national.text_en || "",
      text_ru: national.text_ru || "",
      text_uz: national.text_uz || "",
      youtube_link: national.youtube_link || "",
      images: national.images || [],
      id: national._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  // Delete handler
  const handleDeleteNational = async (id) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/national-list/${id}`);
      if (res.data.success) {
        toast.success(t("successfullyDeleted"));
        fetchNational();
      } else {
        toast.error(t("errorDeletingNews"));
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Delete error:", error);
    }
  };

  // Render uploaded files
  const renderUploadedFiles = () => {
    if (!formData.images || formData.images.length === 0) return null;

    return (
      <div className="uploaded-files">
        {formData.images.map((file, index) => (
          <div key={index} className="uploaded-file">
            <img src={file} alt={`Upload ${index + 1}`} />
            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              className="remove-btn"
              aria-label={t("removeImage")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Get current language title and text
  const getCurrentLangData = (national) => {
    const titleKey = `title_${currentLang}`;
    const textKey = `text_${currentLang}`;
    
    return {
      title: national[titleKey] || national.title_en || "No title",
      text: national[textKey] || national.text_en || "No description",
    };
  };

  return (
    <div className="national-page">
      <Sidebar />
      
      <div className="national-content">
        <h1 className="national">{t("nationalList")}</h1>
        
        <button 
          onClick={() => setModalOpen(true)} 
          className="add-btn"
          aria-label={t("addNew")}
        >
          {t("addNew")}
        </button>

        {nationalData.length === 0 ? (
          <div className="empty-state">
            <h3>{t("noDataAvailable")}</h3>
            <p>{t("clickAddToCreate")}</p>
          </div>
        ) : (
          <div className="news-cards">
            {nationalData.map((national) => {
              const { title, text } = getCurrentLangData(national);
              
              return (
                <div className="news-card" key={national._id}>
                  {/* Media Section */}
                  <div className="media-container">
                    {national.youtube_link && (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          national.youtube_link
                        )}`}
                        title="YouTube video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                    
                    {!national.youtube_link && national.images?.length > 0 && (
                      <Slider {...sliderSettings}>
                        {national.images.map((image, index) => (
                          <div key={index}>
                            <img
                              src={image}
                              alt={`${title} - Image ${index + 1}`}
                            />
                          </div>
                        ))}
                      </Slider>
                    )}
                  </div>

                  {/* Content Section */}
                  <h2>{title}</h2>
                  <p>{text.slice(0, 150)}...</p>

                  {/* Action Buttons */}
                  <div className="card-actions">
                    <button
                      onClick={() => openEditModal(national)}
                      className="edit-btn"
                      aria-label={t("edit")}
                    >
                      ✏️ {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDeleteNational(national._id)}
                      className="delete-btn"
                      aria-label={t("delete")}
                    >
                      🗑️ {t("delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={handleModalClose}
        className="national-modal"
        ariaHideApp={false}
      >
        <h2>{isEditing ? t("editNational") : t("addNewNational")}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* English Fields */}
          <div className="form-group">
            <label htmlFor="title-en">{t("titleEn")} *</label>
            <input
              id="title-en"
              type="text"
              value={formData.title_en}
              placeholder={t("enterTitleEn")}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="text-en">{t("textEn")} *</label>
            <textarea
              id="text-en"
              value={formData.text_en}
              placeholder={t("enterTextEn")}
              onChange={(e) =>
                setFormData({ ...formData, text_en: e.target.value })
              }
              required
            />
          </div>

          {/* Russian Fields */}
          <div className="form-group">
            <label htmlFor="title-ru">{t("titleRu")} *</label>
            <input
              id="title-ru"
              type="text"
              value={formData.title_ru}
              placeholder={t("enterTitleRu")}
              onChange={(e) =>
                setFormData({ ...formData, title_ru: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="text-ru">{t("textRu")} *</label>
            <textarea
              id="text-ru"
              value={formData.text_ru}
              placeholder={t("enterTextRu")}
              onChange={(e) =>
                setFormData({ ...formData, text_ru: e.target.value })
              }
              required
            />
          </div>

          {/* Uzbek Fields */}
          <div className="form-group">
            <label htmlFor="title-uz">{t("titleUz")} *</label>
            <input
              id="title-uz"
              type="text"
              value={formData.title_uz}
              placeholder={t("enterTitleUz")}
              onChange={(e) =>
                setFormData({ ...formData, title_uz: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="text-uz">{t("textUz")} *</label>
            <textarea
              id="text-uz"
              value={formData.text_uz}
              placeholder={t("enterTextUz")}
              onChange={(e) =>
                setFormData({ ...formData, text_uz: e.target.value })
              }
              required
            />
          </div>

          {/* YouTube Link */}
          <div className="form-group">
            <label htmlFor="youtube">{t("youtubeLink")}</label>
            <input
              id="youtube"
              type="text"
              value={formData.youtube_link}
              placeholder={t("enterYoutubeLink")}
              onChange={handleYoutubeLinkChange}
            />
            {youtubeError && <p className="error">{youtubeError}</p>}
          </div>

          {/* File Upload */}
          <div className="file-upload">
            <label htmlFor="file-input">
              {loadingFiles ? t("uploading") : t("uploadImages")}
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
              disabled={loadingFiles}
            />
            <p>{t("maxFileSize")}</p>
          </div>

          {renderUploadedFiles()}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || loadingFiles}
            >
              {loading ? t("saving") : isEditing ? t("update") : t("add")}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              className="cancel-btn"
              disabled={loading}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NationalListPage;