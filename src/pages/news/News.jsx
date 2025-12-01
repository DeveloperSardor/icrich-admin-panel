import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NewsPage = () => {
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [newsData, setNewsData] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [youtubeError, setYoutubeError] = useState("");

  useEffect(() => {
    fetchNews();
  }, [currentLang]);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/news`);
      if (res.data.success) {
        setNewsData(res.data.data);
      } else {
        toast.error(t("fetchNewsError"));
      }
    } catch (error) {
      toast.error(t("fetchNewsError"));
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
    const videoId = url.match(youtubePattern)?.[1]; // ID'nı olish uchun index 1 ishlatiladi
    if (videoId) {
      return (
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return null;
  };

  const renderUploadedFiles = () => {
    return formData.files.map((file, index) => (
      <div key={index} className="uploaded-file-item">
        <img src={file.link} alt={`Uploaded file ${index}`} />
        <button
          className="delete-btn"
          onClick={() => {
            const updatedFiles = formData.files.filter((_, i) => i !== index);
            setFormData({ ...formData, files: updatedFiles });
          }}
        >
          X
        </button>
      </div>
    ));
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

    setLoading(true);

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
    } finally {
      setLoading(false);
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
      files: news.files,
      id: news._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteNews = async (id) => {
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

  return (
    <div className="news-page">
      <Sidebar />
      <div className="news-content">
        <h1 className="news__title">{t("news")}</h1>
        <button onClick={() => setModalOpen(true)} className="add-btn">
          {t("addNews")}
        </button>

        <div className="news-cards">
          {newsData.map((news) => (
            <div className="news-card" key={news._id}>
              <h2>
                {currentLang === "en"
                  ? news.title_en
                  : currentLang === "ru"
                  ? news.title_ru
                  : news.title_uz}
              </h2>
              <p>
                {currentLang === "en"
                  ? news.text_en.slice(0, 100)
                  : currentLang === "ru"
                  ? news.text_ru.slice(0, 100)
                  : news.text_uz.slice(0, 30)}
                ...
              </p>
              {news.youtube_link && renderYoutubeIframe(news.youtube_link)}
              {news.files?.length > 0 && (
                <Slider>
                  {news.files.map((file, index) => (
                    <div key={index} className="slider-item">
                      <img src={file.link} alt={`Slide ${index}`} />
                    </div>
                  ))}
                </Slider>
              )}

              <div className="card-buttons">
                <button
                  className="edit-btn"
                  onClick={() => openEditModal(news)}
                >
                  {t("edit")}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNews(news._id)}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
        >
          <div className="form">
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
              placeholder={t("titlePlaceholder", { lang: "English" }) + " En"}
              required
            />
            <textarea
              name="text_en"
              value={formData.text_en}
              onChange={(e) =>
                setFormData({ ...formData, text_en: e.target.value })
              }
              placeholder={t("textPlaceholder", { lang: "English" }) + " En"}
              required
            />
            <input
              type="text"
              name="title_ru"
              value={formData.title_ru}
              onChange={(e) =>
                setFormData({ ...formData, title_ru: e.target.value })
              }
              placeholder={t("titlePlaceholder", { lang: "Russian" }) + " Ру"}
              required
            />
            <textarea
              name="text_ru"
              value={formData.text_ru}
              onChange={(e) =>
                setFormData({ ...formData, text_ru: e.target.value })
              }
              placeholder={t("textPlaceholder", { lang: "Russian" }) + " Ру"}
              required
            />
            <input
              type="text"
              name="title_uz"
              value={formData.title_uz}
              onChange={(e) =>
                setFormData({ ...formData, title_uz: e.target.value })
              }
              placeholder={t("titlePlaceholder", { lang: "Uzbek" }) + " Uz"}
              required
            />
            <textarea
              name="text_uz"
              value={formData.text_uz}
              onChange={(e) =>
                setFormData({ ...formData, text_uz: e.target.value })
              }
              placeholder={t("textPlaceholder", { lang: "Uzbek" }) + " Uz"}
              required
            />
            <input
              type="text"
              name="youtube_link"
              value={formData.youtube_link}
              onChange={handleYoutubeLinkChange}
              placeholder={t("youtubeLink")}
            />
            {videoPreview && (
              <div className="youtube-preview">
                {renderYoutubeIframe(formData.youtube_link)}
              </div>
            )}
            {youtubeError && <p className="error">{youtubeError}</p>}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={loadingFiles}
            />
            <div className="uploaded-files">{renderUploadedFiles()}</div>
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
