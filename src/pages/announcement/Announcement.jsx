import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import { useTranslation } from "react-i18next";
import Context from "../../context/Context";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCalendar,
  FiSearch,
  FiX
} from "react-icons/fi";
import "./style.css";

const AnnouncementPage = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");

  const [announcementData, setAnnouncementData] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    desc_en: "",
    desc_ru: "",
    desc_uz: "",
    img: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;
  const [imageUploading, setImageUploading] = useState(false);

  // ReactQuill sozlamalari
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnnouncements(announcementData);
    } else {
      const filtered = announcementData.filter((ann) => {
        const searchLower = searchQuery.toLowerCase();
        
        const titleMatch = 
          ann.title_en?.toLowerCase().includes(searchLower) ||
          ann.title_ru?.toLowerCase().includes(searchLower) ||
          ann.title_uz?.toLowerCase().includes(searchLower);
        
        // HTML taglarini olib tashlash
        const stripHtml = (html) => {
          const tmp = document.createElement("DIV");
          tmp.innerHTML = html || "";
          return tmp.textContent || tmp.innerText || "";
        };

        const descMatch = 
          stripHtml(ann.desc_en).toLowerCase().includes(searchLower) ||
          stripHtml(ann.desc_ru).toLowerCase().includes(searchLower) ||
          stripHtml(ann.desc_uz).toLowerCase().includes(searchLower);
        
        return titleMatch || descMatch;
      });
      
      setFilteredAnnouncements(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, announcementData]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/announcement`);
      if (response.data.success) {
        setAnnouncementData(response.data.data);
        setFilteredAnnouncements(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editing
        ? `${BACKEND_URL}/api/announcement/${currentAnnouncement._id}`
        : `${BACKEND_URL}/api/announcement`;
      const method = editing ? "put" : "post";

      const response = await axios[method](url, currentAnnouncement);

      if (response.data.success) {
        toast.success(editing ? t("editSuccess") : t("addSuccess"));
        fetchAnnouncements();
        setModalOpen(false);
        resetForm();
      } else {
        toast.error(editing ? t("editError") : t("addError"));
      }
    } catch (error) {
      toast.error(editing ? t("editError") : t("addError"));
    }
  };

  const handleImageUpload = async (file) => {
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat-app");
    formData.append("cloud_name", "roadsidecoder");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/roadsidecoder/image/upload",
        formData
      );
      setCurrentAnnouncement((prev) => ({ 
        ...prev, 
        img: response.data.secure_url 
      }));
      toast.success(t("imageUploadSuccess"));
    } catch (error) {
      toast.error(t("imageUploadError"));
    } finally {
      setImageUploading(false);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCurrentAnnouncement({
      title_en: "",
      title_ru: "",
      title_uz: "",
      desc_en: "",
      desc_ru: "",
      desc_uz: "",
      img: "",
    });
    setEditing(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/announcement/${id}`);
      if (response.data.success) {
        toast.success(t("deleteSuccess"));
        fetchAnnouncements();
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
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

  // HTML matnni qisqartirish
  const truncateHtmlText = (html, maxLength) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Pagination
  const pageCount = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(offset, offset + itemsPerPage);

  return (
    <div className="announcement-page">
      <Sidebar />
      <div className="announcement-content">
        <div className="announcement-header">
          <div>
            <h1>{t("announcement")}</h1>
            <p className="announcement-subtitle">
              {t("totalAnnouncements")}: <strong>{filteredAnnouncements.length}</strong> {t("announcementsCount")}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(false);
              resetForm();
              setModalOpen(true);
            }}
            className="add-announcement-btn"
          >
            <FiPlus size={20} />
            {t("addAnnouncement")}
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchAnnouncements")}
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
        ) : filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <FiImage size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noAnnouncements")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noAnnouncementsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="announcement-grid">
              {currentAnnouncements.map((ann) => (
                <div key={ann._id} className="announcement-card">
                  <div className="announcement-card-media">
                    {ann.img ? (
                      <img src={ann.img} alt="Announcement" />
                    ) : (
                      <div className="no-media">
                        <FiImage size={48} />
                      </div>
                    )}
                  </div>

                  <div className="announcement-card-content">
                    <h3 className="announcement-title">
                      {ann[`title_${currentLang}`]}
                    </h3>
                    <p className="announcement-excerpt">
                      {truncateHtmlText(ann[`desc_${currentLang}`], 150)}
                    </p>

                    {ann.createdAt && (
                      <div className="announcement-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(ann.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="announcement-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setEditing(true);
                        setCurrentAnnouncement(ann);
                        setModalOpen(true);
                      }}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAnnouncement(ann._id)}
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

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
        >
          <div className="modal-form">
            <h2 className="modal-title">
              {editing ? t("editAnnouncement") : t("addAnnouncement")}
            </h2>

            {/* O'ZBEK TILI */}
            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                value={currentAnnouncement.title_uz}
                onChange={(e) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    title_uz: e.target.value,
                  })
                }
                placeholder={t("titleUz")}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={currentAnnouncement.desc_uz}
                onChange={(value) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    desc_uz: value,
                  })
                }
                modules={modules}
                formats={formats}
                placeholder={t("descUz")}
                className="quill-editor"
              />
            </div>

            {/* RUS TILI */}
            <div className="form-section">
              <h3 className="section-title">{t("russian")}</h3>
              <input
                type="text"
                value={currentAnnouncement.title_ru}
                onChange={(e) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    title_ru: e.target.value,
                  })
                }
                placeholder={t("titleRu")}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={currentAnnouncement.desc_ru}
                onChange={(value) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    desc_ru: value,
                  })
                }
                modules={modules}
                formats={formats}
                placeholder={t("descRu")}
                className="quill-editor"
              />
            </div>

            {/* INGLIZ TILI */}
            <div className="form-section">
              <h3 className="section-title">{t("english")}</h3>
              <input
                type="text"
                value={currentAnnouncement.title_en}
                onChange={(e) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    title_en: e.target.value,
                  })
                }
                placeholder={t("titleEn")}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={currentAnnouncement.desc_en}
                onChange={(value) =>
                  setCurrentAnnouncement({
                    ...currentAnnouncement,
                    desc_en: value,
                  })
                }
                modules={modules}
                formats={formats}
                placeholder={t("descEn")}
                className="quill-editor"
              />
            </div>

            {/* RASM YUKLASH */}
            <div className="form-section">
              <h3 className="section-title">{t("image")}</h3>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <FiImage size={20} />
                  <span>
                    {imageUploading ? t("uploading") : t("uploadImage")}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    disabled={imageUploading}
                    accept="image/*"
                  />
                </label>
              </div>

              {currentAnnouncement.img && !imageUploading && (
                <div className="image-preview">
                  <img src={currentAnnouncement.img} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() =>
                      setCurrentAnnouncement({ ...currentAnnouncement, img: "" })
                    }
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn">
              {editing ? t("edit") : t("addAnnouncement")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AnnouncementPage;