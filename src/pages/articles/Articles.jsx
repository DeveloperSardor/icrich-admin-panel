import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import "./style.css";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";

const Articles = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");

  const [articlesData, setArticlesData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentArticle, setCurrentArticle] = useState({
    title_en: "",
    title_ru: "",
    title_uz: "",
    desc_en: "",
    desc_ru: "",
    desc_uz: "",
    pdf_file: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/articles`);
        if (response.data.success) {
          setArticlesData(response.data.data);
        } else {
          toast.error(t("fetchError"));
        }
      } catch (error) {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentArticle.pdf_file) {
      toast.error(t("pdfRequired"));
      return;
    }

    const articleData = {
      ...currentArticle,
      pdf_file: currentArticle.pdf_file,
    };

    try {
      const url = editing
        ? `${BACKEND_URL}/api/articles/${currentArticle._id}`
        : `${BACKEND_URL}/api/articles`;
      const method = editing ? "put" : "post";

      const response = await axios[method](url, articleData);

      if (response.data.success) {
        toast.success(editing ? t("editSuccess") : t("addSuccess"));
        setArticlesData(
          editing
            ? articlesData.map((art) =>
                art._id === currentArticle._id ? response.data.data : art
              )
            : [response.data.data, ...articlesData]
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
    setCurrentArticle({
      title_en: "",
      title_ru: "",
      title_uz: "",
      desc_en: "",
      desc_ru: "",
      desc_uz: "",
      pdf_file: "",
    });
  };

  const renderArticles = () => {
    const offset = currentPage * itemsPerPage;
    const currentItems = articlesData.slice(offset, offset + itemsPerPage);

    return (
      <div className="articles-container">
        {currentItems.map((art) => (
          <div key={art._id} className="articles-card">
            <h3>{art[`title_${currentLang}`]}</h3>
            <p>{art[`desc_${currentLang}`]?.slice(0, 100)}...</p>

            {art.pdf_file && (
              <div className="pdf-section">
                <button
                  onClick={() => window.open(art.pdf_file, "_blank")}
                  className="view-pdf-btn"
                >
                  📄 {t("viewPdf")}
                </button>
              </div>
            )}

            <div className="articles-actions">
              <button
                className="edit__btn"
                onClick={() => {
                  setEditing(true);
                  setCurrentArticle(art);
                  setModalOpen(true);
                }}
              >
                {t("edit")}
              </button>
              <button onClick={() => handleDeleteArticle(art._id)}>
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteArticle = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/articles/${id}`);
      if (response.data.success) {
        setArticlesData(articlesData.filter((art) => art._id !== id));
        toast.success(t("deleteSuccess"));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="articles-page">
      <div className="page-layout">
        <Sidebar />

        <div className="articles-content">
          <h1>{t("articles")}</h1>
          <button
            style={{ marginLeft: "23em" }}
            onClick={() => {
              setEditing(false);
              setModalOpen(true);
            }}
          >
            {t("add")}
          </button>

          {loading ? <p>{t("loading")}</p> : renderArticles()}

          <ReactPaginate
            previousLabel={`← ${t("previous")}`}
            nextLabel={`${t("next")} →`}
            breakLabel="..."
            pageCount={Math.ceil(articlesData.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="pagination"
            activeClassName="active"
          />

          <Modal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            contentLabel="Articles Modal"
          >
            <h2 className="add_title">{editing ? t("edit") : t("add")}</h2>
            <form className="modal__form" onSubmit={handleSubmit}>
              {["en", "ru", "uz"].map((lang) => (
                <div key={lang}>
                  <input
                    type="text"
                    placeholder={`${t("titlePlaceholder")} (${lang.toUpperCase()})`}
                    value={currentArticle[`title_${lang}`]}
                    onChange={(e) =>
                      setCurrentArticle({
                        ...currentArticle,
                        [`title_${lang}`]: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder={`${t("textPlaceholder")} (${lang.toUpperCase()})`}
                    value={currentArticle[`desc_${lang}`]}
                    onChange={(e) =>
                      setCurrentArticle({
                        ...currentArticle,
                        [`desc_${lang}`]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              <label>{t("pdfLink")}</label>
              <input
                type="text"
                placeholder={t("pdfLinkPlaceholder")}
                value={currentArticle.pdf_file}
                onChange={(e) =>
                  setCurrentArticle({ ...currentArticle, pdf_file: e.target.value })
                }
              />

              {currentArticle.pdf_file && (
                <div className="pdf-preview">
                  <a
                    href={currentArticle.pdf_file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {t("viewPdf")}
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

export default Articles;
