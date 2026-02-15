import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiSearch,
  FiX,
  FiCalendar,
  FiUsers
} from "react-icons/fi";
import "./style.css";

const VacanciesPage = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [vacancies, setVacancies] = useState([]);
  const [filteredVacancies, setFilteredVacancies] = useState([]);r
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    role: "",
    title_en: "",
    title_ru: "",
    title_uz: "",
    text_en: "",
    text_ru: "",
    text_uz: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchVacancies();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVacancies(vacancies);
    } else {
      const filtered = vacancies.filter((vacancy) => {
        const searchLower = searchQuery.toLowerCase();

        const titleMatch =
          vacancy.title_en?.toLowerCase().includes(searchLower) ||
          vacancy.title_ru?.toLowerCase().includes(searchLower) ||
          vacancy.title_uz?.toLowerCase().includes(searchLower);

        // HTML taglarini olib tashlash
        const stripHtml = (html) => {
          const tmp = document.createElement("DIV");
          tmp.innerHTML = html || "";
          return tmp.textContent || tmp.innerText || "";
        };

        const textMatch =
          stripHtml(vacancy.text_en || "").toLowerCase().includes(searchLower) ||
          stripHtml(vacancy.text_ru || "").toLowerCase().includes(searchLower) ||
          stripHtml(vacancy.text_uz || "").toLowerCase().includes(searchLower);

        const roleMatch = vacancy.role?.name_en?.toLowerCase().includes(searchLower) ||
          vacancy.role?.name_ru?.toLowerCase().includes(searchLower) ||
          vacancy.role?.name_uz?.toLowerCase().includes(searchLower);

        return titleMatch || textMatch || roleMatch;
      });

      setFilteredVacancies(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, vacancies]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/job-vacancies`);
      if (response.data.success) {
        setVacancies(response.data.data);
        setFilteredVacancies(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roles`);
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/job-vacancies/${editingId}`
        : `${BACKEND_URL}/api/job-vacancies`;
      const method = editingId ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.data.success) {
        toast.success(editingId ? t("editSuccess") : t("addSuccess"));
        fetchVacancies();
        closeModal();
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      console.error("Error submitting vacancy:", error);
      toast.error(t("error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/job-vacancies/${id}`);
      if (response.data.success) {
        toast.success(t("deleteSuccess"));
        setVacancies(vacancies.filter((vacancy) => vacancy._id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting vacancy:", error);
      toast.error(t("deleteError"));
    }
  };

  const openModal = (vacancy = null) => {
    setEditingId(vacancy ? vacancy._id : null);
    setFormData(
      vacancy
        ? {
            role: vacancy.role?._id || "",
            title_en: vacancy.title_en || "",
            title_ru: vacancy.title_ru || "",
            title_uz: vacancy.title_uz || "",
            text_en: vacancy.text_en || "",
            text_ru: vacancy.text_ru || "",
            text_uz: vacancy.text_uz || "",
          }
        : {
            role: "",
            title_en: "",
            title_ru: "",
            title_uz: "",
            text_en: "",
            text_ru: "",
            text_uz: "",
          }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      role: "",
      title_en: "",
      title_ru: "",
      title_uz: "",
      text_en: "",
      text_ru: "",
      text_uz: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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

  // HTML matnni qisqartirish
  const truncateHtmlText = (html, maxLength) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageCount = Math.ceil(filteredVacancies.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentVacancies = filteredVacancies.slice(offset, offset + itemsPerPage);

  return (
    <div className="vacancies-page">
      <Sidebar />
      <div className="vacancies-content">
        <div className="vacancies-header">
          <div>
            <h1>{t("vacancies")}</h1>
            <p className="vacancies-subtitle">
              {t("totalVacancies")}: <strong>{filteredVacancies.length}</strong>{" "}
              {t("vacanciesCount")}
            </p>
          </div>
          <button onClick={() => openModal()} className="add-vacancy-btn">
            <FiPlus size={20} />
            {t("addVacancy")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchVacancies")}
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
        ) : filteredVacancies.length === 0 ? (
          <div className="empty-state">
            <FiBriefcase size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noVacancies")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noVacanciesDesc")}</p>
          </div>
        ) : (
          <>
            <div className="vacancies-grid">
              {currentVacancies.map((vacancy) => (
                <div key={vacancy._id} className="vacancy-card">
                  <div className="vacancy-icon">
                    <FiBriefcase size={32} />
                  </div>

                  <div className="vacancy-content-card">
                    <div className="vacancy-role">
                      {currentLang === "en"
                        ? vacancy.role?.name_en
                        : currentLang === "ru"
                        ? vacancy.role?.name_ru
                        : vacancy.role?.name_uz}
                    </div>

                    <h3 className="vacancy-title">
                      {currentLang === "en"
                        ? vacancy.title_en
                        : currentLang === "ru"
                        ? vacancy.title_ru
                        : vacancy.title_uz}
                    </h3>

                    <p className="vacancy-description">
                      {truncateHtmlText(
                        currentLang === "en"
                          ? vacancy.text_en
                          : currentLang === "ru"
                          ? vacancy.text_ru
                          : vacancy.text_uz,
                        120
                      )}
                    </p>

                    {vacancy.createdAt && (
                      <div className="vacancy-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(vacancy.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="vacancy-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openModal(vacancy)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(vacancy._id)}
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

        <Modal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit}>
          <div className="modal-form">
            <h2 className="modal-title">
              {editingId ? t("editVacancy") : t("addVacancy")}
            </h2>

            <div className="form-section">
              <h3 className="section-title">{t("selectRole")}</h3>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="form-select"
                required
              >
                <option value="">{t("selectRole")}</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {currentLang === "en"
                      ? role.name_en
                      : currentLang === "ru"
                      ? role.name_ru
                      : role.name_uz}
                  </option>
                ))}
              </select>
            </div>

            {/* O'ZBEK TILI */}
            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                placeholder="Sarlavha (O'zbekcha)"
                value={formData.title_uz}
                onChange={(e) => handleInputChange("title_uz", e.target.value)}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={formData.text_uz}
                onChange={(value) => handleInputChange("text_uz", value)}
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
                placeholder="Заголовок (Русский)"
                value={formData.title_ru}
                onChange={(e) => handleInputChange("title_ru", e.target.value)}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={formData.text_ru}
                onChange={(value) => handleInputChange("text_ru", value)}
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
                placeholder="Title (English)"
                value={formData.title_en}
                onChange={(e) => handleInputChange("title_en", e.target.value)}
                className="form-input"
                required
              />
              <ReactQuill
                theme="snow"
                value={formData.text_en}
                onChange={(value) => handleInputChange("text_en", value)}
                modules={modules}
                formats={formats}
                placeholder="Description (English)"
                className="quill-editor"
              />
            </div>

            <button type="submit" className="submit-btn">
              {editingId ? t("save") : t("addVacancy")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default VacanciesPage;