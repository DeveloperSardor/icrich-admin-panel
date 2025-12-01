import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import toast from "react-hot-toast";

const EditNewsModal = ({ isOpen, onClose, newsData, onEditSuccess, currentLanguage }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    text_en: "",
    text_ru: "",
    text_uz: "",
    youtube_link: "",
    images: [],
    newImages: [],
  });
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Pre-fill form if newsData is passed
  useEffect(() => {
    if (newsData) {
      setFormData({
        title_en: newsData.title_en || "",
        title_ru: newsData.title_ru || "",
        title_uz: newsData.title_uz || "",
        text_en: newsData.text_en || "",
        text_ru: newsData.text_ru || "",
        text_uz: newsData.text_uz || "",
        youtube_link: newsData.youtube_link || "",
        images: newsData.images || [],
        newImages: [],
      });
    }
  }, [newsData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    setFormData((prev) => ({
      ...prev,
      newImages: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true); // Start loading

    let formDataToSend = new FormData();
    formDataToSend.append("title_en", formData.title_en);
    formDataToSend.append("title_ru", formData.title_ru);
    formDataToSend.append("title_uz", formData.title_uz);
    formDataToSend.append("text_en", formData.text_en);
    formDataToSend.append("text_ru", formData.text_ru);
    formDataToSend.append("text_uz", formData.text_uz);
    formDataToSend.append("youtube_link", formData.youtube_link);

    // Append new images or keep old ones if no new images
    if (formData.newImages.length > 0) {
      Array.from(formData.newImages).forEach((image) => {
        formDataToSend.append("images", image);
      });
    } else {
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });
    }

    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/news/${newsData._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success("News updated successfully");
        onEditSuccess(response.data.data); // Pass updated data to parent
        onClose(); // Close the modal
      } else {
        toast.error("Failed to update news");
      }
    } catch (error) {
      toast.error("Error updating news");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const getButtonText = (language) => {
    switch (language) {
      case "en":
        return {
          save: "Save Changes",
          close: "Close",
        };
      case "ru":
        return {
          save: "Сохранить изменения",
          close: "Закрыть",
        };
      case "uz":
        return {
          save: "O'zgartirishlarni saqlash",
          close: "Yopish",
        };
      default:
        return {
          save: "Save Changes",
          close: "Close",
        };
    }
  };

  const { save, close } = getButtonText(currentLanguage);

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit News">
      <h2>Edit News</h2>
      <form onSubmit={handleSubmit}>
        <label>Title (English)</label>
        <input
          type="text"
          name="title_en"
          value={formData.title_en}
          onChange={handleInputChange}
        />
        <label>Title (Russian)</label>
        <input
          type="text"
          name="title_ru"
          value={formData.title_ru}
          onChange={handleInputChange}
        />
        <label>Title (Uzbek)</label>
        <input
          type="text"
          name="title_uz"
          value={formData.title_uz}
          onChange={handleInputChange}
        />
        <label>Text (English)</label>
        <textarea
          name="text_en"
          value={formData.text_en}
          onChange={handleInputChange}
        />
        <label>Text (Russian)</label>
        <textarea
          name="text_ru"
          value={formData.text_ru}
          onChange={handleInputChange}
        />
        <label>Text (Uzbek)</label>
        <textarea
          name="text_uz"
          value={formData.text_uz}
          onChange={handleInputChange}
        />
        <label>Youtube Link</label>
        <input
          type="text"
          name="youtube_link"
          value={formData.youtube_link}
          onChange={handleInputChange}
        />
        <label>Images (Upload new images or leave empty to keep old)</label>
        <input
          type="file"
          name="images"
          multiple
          onChange={handleImageChange}
          disabled={isLoading} // Disable file input while loading
        />
        {isLoading && <div className="spinner">Loading...</div>} {/* Show spinner when uploading */}

        <div>
          <h4>Existing Images:</h4>
          {formData.images.length > 0 ? (
            formData.images.map((image, index) => (
              <img key={index} src={image} alt={`Existing Image ${index + 1}`} height="100px" />
            ))
          ) : (
            <p>No images available</p>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Uploading..." : save}
          </button>
          <button type="button" onClick={onClose} disabled={isLoading}>
            {close}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNewsModal;
