import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar"; // Import the Sidebar component
import "./style.css";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";

const AnnouncementPage = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");

  const [announcementData, setAnnouncementData] = useState([]);
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
  const itemsPerPage = 6;
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch announcements data
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/announcement`);
        if (response.data.success) {
          setAnnouncementData(response.data.data);
        } else {
          toast.error(t("fetchError"));
        }
      } catch (error) {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Handle Add/Edit Announcement
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
        const updatedData = editing
          ? announcementData.map((ann) =>
              ann._id === currentAnnouncement._id ? response.data.data : ann
            )
          : [response.data.data, ...announcementData];

        setAnnouncementData(updatedData);
        setModalOpen(false);
        resetForm();
      } else {
        toast.error(editing ? t("editError") : t("addError"));
      }
    } catch (error) {
      toast.error(editing ? t("editError") : t("addError"));
    }
  };

  // Handle Image Upload to Cloudinary
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
      setCurrentAnnouncement((prev) => ({ ...prev, img: response.data.secure_url }));
      toast.success(t("imageUploadSuccess"));
    } catch (error) {
      toast.error(t("imageUploadError"));
    } finally {
      setImageUploading(false);
    }
  };

  // Handle Page Click for Pagination
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Reset form
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
  };

  // Render Announcement Cards
  const renderAnnouncements = () => {
    const offset = currentPage * itemsPerPage;
    const currentItems = announcementData.slice(offset, offset + itemsPerPage);

    return (
      <div className="announcement-container">
        {currentItems.map((ann) => (
          <div key={ann._id} className="announcement-card">
            <h3>{ann[`title_${currentLang}`]}</h3>
            <p>{ann[`desc_${currentLang}`]?.slice(0, 100)}...</p>
            {ann.img && <img src={ann.img} alt="Announcement" />}
            <div className="announcement-actions">
              <button
                className="edit__btn"
                onClick={() => {
                  setEditing(true);
                  setCurrentAnnouncement(ann);
                  setModalOpen(true);
                }}
              >
                {t("edit")}
              </button>
              <button onClick={() => handleDeleteAnnouncement(ann._id)}>
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handle Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/announcement/${id}`);
      if (response.data.success) {
        setAnnouncementData(announcementData.filter((ann) => ann._id !== id));
        toast.success(t("deleteSuccess"));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="announcement-page">
      <div className="page-layout">
        <Sidebar />

        <div className="announcement-content">
          <h1>{t("announcement")}</h1>
          <button
            onClick={() => {
              setEditing(false);
              setModalOpen(true);
            }}
            style={{ marginLeft : "20em" }}
          >
            {t("addAnnouncement")}
          </button>

          {loading ? <p>{t("loading")}</p> : renderAnnouncements()}

          <ReactPaginate
  previousLabel={`← ${t("previous")}`}
  nextLabel={`${t("next")} →`}
  breakLabel="..."
  pageCount={Math.ceil(announcementData.length / itemsPerPage)}
  marginPagesDisplayed={2}
  pageRangeDisplayed={3}
  onPageChange={handlePageClick}
  containerClassName="pagination"
  activeClassName="active"
  previousClassName="pagination-previous"
  nextClassName="pagination-next"
  disabledClassName="disabled"
/>


          {/* Modal for Add/Edit */}
          <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} contentLabel="Announcement Modal">
            <h2 className="add_title">{editing ? t("edit") : t("addAnnouncement")}</h2>
            <form className="modal__form" onSubmit={handleSubmit}>
              {["en", "ru", "uz"].map((lang) => (
                <div key={lang}>
                  <input
                    type="text"
                    placeholder={`${t("titlePlaceholder")} (${lang.toUpperCase()})`}
                    value={currentAnnouncement[`title_${lang}`]}
                    onChange={(e) =>
                      setCurrentAnnouncement({
                        ...currentAnnouncement,
                        [`title_${lang}`]: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder={`${t("textPlaceholder")} (${lang.toUpperCase()})`}
                    value={currentAnnouncement[`desc_${lang}`]}
                    onChange={(e) =>
                      setCurrentAnnouncement({
                        ...currentAnnouncement,
                        [`desc_${lang}`]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
              <label>{t("image")}</label>
              {imageUploading ? (
                <p>{t("uploading")}</p>
              ) : (
                <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
              )}
              {currentAnnouncement.img && !imageUploading && (
                <img src={currentAnnouncement.img} alt="Announcement" height="100" width="120px" />
              )}
              <button type="submit">{editing ? t("edit") : t("addAnnouncement")}</button>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;
