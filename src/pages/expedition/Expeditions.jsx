import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";



const ExpeditionsPage = () => {
    const settings = {
        dots: true,
        infinite: true, // Doimiy loop qilish
        speed: 500,
        slidesToShow: 1, // Har safar 1 slaydni ko'rsatish
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation("global");
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;

  const [expeditionData, setExpeditionData] = useState([]);
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
    fetchExpedition();
  }, [currentLang]);

  const fetchExpedition = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/expedition`);
      if (res.data.success) {
        setExpeditionData(res.data.data);
      } else {
        toast.error(`Error`);
      }
    } catch (error) {
      toast.error(error.message);
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
        uploadedFiles.push(res.data.secure_url );
      } catch (error) {
        toast.error(t("fileUploadError"));
      }
    }

    setFormData({ ...formData, images: [...formData.images, ...uploadedFiles] });
    setLoadingFiles(false);
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

    setLoading(true);

    const payload = {
      title_en: formData.title_en,
      text_en: formData.text_en,
      title_ru: formData.title_ru,
      text_ru: formData.text_ru,
      title_uz: formData.title_uz,
      text_uz: formData.text_uz,
      youtube_link: formData.youtube_link,
      images: formData.images.map((file) => file),
    };

    try {
      const url = isEditing
        ? `${BACKEND_URL}/api/expedition/${formData.id}`
        : `${BACKEND_URL}/api/expedition`;
      const method = isEditing ? "put" : "post";

      const res = await axios[method](url, payload);

      if (res.data.success) {
        toast.success(isEditing ? t("Successfuly updated") : t("Successfuly added"));
        fetchExpedition();
        handleModalClose();
      } else {
        toast.error(t("Error"));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
      youtube_link: expedition.youtube_link,
      images: expedition.images || [],
      id: expedition._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteExpediton = async (id) => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/expedition/${id}`);
      if (res.data.success) {
        toast.success(data.message);
        fetchExpedition();
      } else {
        toast.error(t("errorDeletingNews"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderUploadedFiles = () => {
    if (!formData.images || formData.images.length === 0) return null;
  
    return (
      <div className="uploaded-files">
        {formData.images.map((file, index) => (
          <div key={index} className="uploaded-file">
            <img src={file} alt={`Uploaded ${index}`} />
            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              className="remove-btn"
            >
              {t("remove")}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const getYouTubeVideoId = (url) => {
    try {
      // URL'dagi video ID ni olish
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        // Agar URL youtu.be formatida bo'lsa
        return urlObj.pathname.slice(1); // `/videoId` dan videoId'ni oladi
      } else if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
        // Agar URL www.youtube.com formatida bo'lsa
        return urlObj.searchParams.get("v");
      }
    } catch (error) {
      console.error("Invalid YouTube URL:", error);
    }
    return null; // Agar noto'g'ri URL bo'lsa, null qaytaradi
  };
  

  const handleRemoveFile = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };
  

  return (
    <div className="expedition-page">
      <Sidebar />
      <div className="expedition-content">
        <h1 className="expedition">{t('expedition')}</h1>
        <button onClick={() => setModalOpen(true)} className="add-btn">
          {t("add")}
        </button>
        <div className="news-cards">
          {expeditionData.map((expedition) => (
            <div className="news-card" key={expedition._id}>
              <h2>
                {currentLang === "en"
                  ? expedition.title_en
                  : currentLang === "ru"
                  ? expedition.title_ru
                  : expedition.title_uz}
              </h2>
              <p>
                {currentLang === "en"
                  ? expedition.text_en.slice(0, 100)
                  : currentLang === "ru"
                  ? expedition.text_ru.slice(0, 100)
                  : expedition.text_uz.slice(0, 30)}
                ...
              </p>
              {expedition.youtube_link && (
                <iframe
    width="300px"
    height="315"
    src={`https://www.youtube.com/embed/${getYouTubeVideoId(expedition?.youtube_link)}`}
    title="YouTube preview"
    frameBorder="0"
    allowFullScreen
  />
              )}
              {expedition.images?.length > 0 && (
    <Slider {...settings}>
        {expedition.images.map((file, index) => (
            <div key={index}>
                <img
                    src={file}
                    style={{ width: "200px", maxHeight: "200px", margin: "0.5em auto" }}
                    alt={`Slide ${index}`}
                />
            </div>
        ))}
    </Slider>
)}


              <button onClick={() => openEditModal(expedition)} className="edit-btn">
                {t("edit")}
              </button>
              <button
                onClick={() => handleDeleteExpediton(expedition._id)}
                className="delete-btn"
              >
                {t("delete")}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={handleModalClose} className="expedition-modal">
        <h2>{isEditing ? t("edit") : t("add")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formData.title_en}
            placeholder={t("titlePlaceholder", { lang: "English" }) + ' En'}
            onChange={(e) =>
              setFormData({ ...formData, title_en: e.target.value })
            }
          />
          <textarea
            value={formData.text_en}
            placeholder={t("textPlaceholder", { lang: "English" }) + ' En'}
            onChange={(e) =>
              setFormData({ ...formData, text_en: e.target.value })
            }
          ></textarea>
          <input
            type="text"
            placeholder={t("titlePlaceholder", { lang: "Russian" }) + ' Ру'}
            value={formData.title_ru}
            onChange={(e) =>
  setFormData({ ...formData, title_ru: e.target.value })
}
/>
<textarea
  value={formData.text_ru}
  placeholder={t("textPlaceholder", { lang: "Russian" }) + ' Ру'}
  onChange={(e) =>
    setFormData({ ...formData, text_ru: e.target.value })
  }
></textarea>
<input
  type="text"
  placeholder={t("titlePlaceholder", { lang: "Uzbek" }) + ' Uz'}
  value={formData.title_uz}
  onChange={(e) =>
    setFormData({ ...formData, title_uz: e.target.value })
  }
/>
<textarea
  value={formData.text_uz}
  placeholder={t("textPlaceholder", { lang: "Uzbek" }) + ' Uz'}
  onChange={(e) =>
    setFormData({ ...formData, text_uz: e.target.value })
  }
></textarea>
<input
  type="text"
  value={formData.youtube_link}
  placeholder={t("youtubePlaceholder")}
  onChange={handleYoutubeLinkChange}
/>
<div className="file-upload">
  <label htmlFor="file-input">{t("uploadImages")}</label>
  <input
    id="file-input"
    type="file"
    multiple
    onChange={handleFileChange}
    accept="image/*"
  />
  {loadingFiles && <p>{t("loadingFiles")}</p>}
</div>
{renderUploadedFiles()}
{youtubeError && <p className="error">{youtubeError}</p>}
<button type="submit" disabled={loading}>
  {loading ? t("loading") : t("add")}
</button>
<button type="button" onClick={handleModalClose}>
  {t("cancel")}
</button>




        </form>
      </Modal>
    </div>
  );
};

export default ExpeditionsPage;
