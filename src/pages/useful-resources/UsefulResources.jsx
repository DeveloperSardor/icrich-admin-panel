import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar"; // Adjust this import if needed
import "./style.css";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";

const Resources = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");

  const [resourcesData, setResourcesData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentResource, setCurrentResource] = useState({
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
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/resources`);
        if (response.data.success) {
          setResourcesData(response.data.data);
        } else {
          toast.error(t("fetchError"));
        }
      } catch (error) {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentResource.pdf_link && !currentResource.youtube_link) {
      toast.error(t("error.youtube_or_pdf_required"));
      return;
    }

    if (currentResource.pdf_link && currentResource.youtube_link) {
      toast.error(t("error.only_one_allowed"));
      return;
    }

    const resourceData = {
      ...currentResource,
      pdf_link: currentResource.pdf_link,
      youtube_link: currentResource.youtube_link,
    };

    try {
      const url = editing
        ? `${BACKEND_URL}/api/resources/${currentResource._id}`
        : `${BACKEND_URL}/api/resources`;
      const method = editing ? "put" : "post";

      const response = await axios[method](url, resourceData);

      if (response.data.success) {
        toast.success(editing ? t("") : t(""));
        setResourcesData(
          editing
            ? resourcesData.map((res) =>
                res._id === currentResource._id ? response.data.data : res
              )
            : [response.data.data, ...resourcesData]
        );
        setModalOpen(false);
        resetForm();
      } else {
        toast.error(editing ? t("editError") : t("addError"));
      }
    } catch (error) {
      toast.error(editing ? t("editError") : t("addError"));
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const resetForm = () => {
    setCurrentResource({
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

  const renderResources = () => {
    const offset = currentPage * itemsPerPage;
    const currentItems = resourcesData.slice(offset, offset + itemsPerPage);
  
    return (
      <div className="resources-container">
        {currentItems.map((res) => (
          <div key={res._id} className="resource-card">
            <h3>{res[`title_${currentLang}`]}</h3>
            <p>{res[`text_${currentLang}`]?.slice(0, 100)}...</p>
  
            {/* Check if the resource has a YouTube link */}
            {res.youtube_link && (
              <div className="youtube-section">
                {/* Extract video ID from the YouTube URL */}
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${res.youtube_link.split('youtu.be/')[1]}`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
  
            {/* Check if the resource has a PDF link */}
            {res.pdf_link && (
              <div className="pdf-section">
                <a
                  href={res.pdf_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-pdf-btn"
                >
                  📄 PDF
                </a>
              </div>
            )}
  
            <div className="resources-actions">
              <button
                className="edit__btn"
                onClick={() => {
                  setEditing(true);
                  setCurrentResource(res);
                  setModalOpen(true);
                }}
              >
                {t("edit")}
              </button>
              <button onClick={() => handleDeleteResource(res._id)}>
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  

  const handleDeleteResource = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/resources/${id}`);
      if (response.data.success) {
        setResourcesData(resourcesData.filter((res) => res._id !== id));
        toast.success(t(""));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="resources-page">
      <div className="page-layout">
        <Sidebar />

        <div className="resources-content">
          <h1>{t("usefulResources")}</h1>
          <button
            style={{ marginLeft: "23em" }}
            onClick={() => {
              setEditing(false);
              setModalOpen(true);
            }}
          >
            {t("add")}
          </button>

          {loading ? <p>{t("loading")}</p> : renderResources()}

          <ReactPaginate
            previousLabel={`← ${t("previous")}`}
            nextLabel={`${t("next")} →`}
            breakLabel="..."
            pageCount={Math.ceil(resourcesData.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="pagination"
            activeClassName="active"
          />

          <Modal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            contentLabel="Resources Modal"
          >
            <h2 className="add_title">{editing ? t("edit") : t("add")}</h2>
            <form className="modal__form" onSubmit={handleSubmit}>
              {["en", "ru", "uz"].map((lang) => (
                <div key={lang}>
                  <input
                    type="text"
                    placeholder={`${t("titlePlaceholder")} (${lang.toUpperCase()})`}
                    value={currentResource[`title_${lang}`]}
                    onChange={(e) =>
                      setCurrentResource({
                        ...currentResource,
                        [`title_${lang}`]: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder={`${t("textPlaceholder")} (${lang.toUpperCase()})`}
                    value={currentResource[`text_${lang}`]}
                    onChange={(e) =>
                      setCurrentResource({
                        ...currentResource,
                        [`text_${lang}`]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              <label>{t("pdfLink")}</label>
              <input
                type="text"
                placeholder={t("pdfLinkPlaceholder")}
                value={currentResource.pdf_link}
                onChange={(e) =>
                  setCurrentResource({ ...currentResource, pdf_link: e.target.value })
                }
              />

              <label>{t("youtubeLink")}</label>
              <input
                type="text"
                placeholder={t("youtubeLinkPlaceholder")}
                value={currentResource.youtube_link}
                onChange={(e) =>
                  setCurrentResource({ ...currentResource, youtube_link: e.target.value })
                }
              />

              {currentResource.pdf_link && (
                <div className="pdf-preview">
                  <a
                    href={currentResource.pdf_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {t("viewPdf")}
                  </a>
                </div>
              )}

              {currentResource.youtube_link && (
                <div className="youtube-preview">
                  <a
                    href={currentResource.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🎥 {t("viewYouTube")}
                  </a>
                </div>
              )}

              <button type="submit">{editing ? t("edit") : t("add")}</button>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Resources;
