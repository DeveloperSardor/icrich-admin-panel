import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import Sidebar from '../../components/sidebar/Sidebar';
import Modal from '../../components/news-add/NewsAdd';
import Context from '../../context/Context';
import { useTranslation } from 'react-i18next';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiCalendar,
  FiSearch,
  FiX,
  FiExternalLink
} from 'react-icons/fi';
import './style.css';

const DocsPage = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const { t } = useTranslation('global');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [newDoc, setNewDoc] = useState({
    title_en: '', text_en: '', title_ru: '', text_ru: '', title_uz: '', text_uz: '', link: ''
  });
  const [editDoc, setEditDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDocs();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocs(docs);
    } else {
      const filtered = docs.filter((doc) => {
        const searchLower = searchQuery.toLowerCase();
        
        const titleMatch = 
          doc.title_en?.toLowerCase().includes(searchLower) ||
          doc.title_ru?.toLowerCase().includes(searchLower) ||
          doc.title_uz?.toLowerCase().includes(searchLower);
        
        const textMatch = 
          doc.text_en?.toLowerCase().includes(searchLower) ||
          doc.text_ru?.toLowerCase().includes(searchLower) ||
          doc.text_uz?.toLowerCase().includes(searchLower);
        
        return titleMatch || textMatch;
      });
      
      setFilteredDocs(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, docs]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/docs`);
      if (response.data.success) {
        setDocs(response.data.data);
        setFilteredDocs(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoc = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/docs`, newDoc);
      if (response.data.success) {
        toast.success(t("addSuccess"));
        fetchDocs();
        setNewDoc({ 
          title_en: '', text_en: '', title_ru: '', text_ru: '', 
          title_uz: '', text_uz: '', link: '' 
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding doc:', error);
      toast.error(t("addError"));
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/docs/${id}`);
      if (response.data.success) {
        toast.success(t("deleteSuccess"));
        setDocs(docs.filter(doc => doc._id !== id));
      }
    } catch (error) {
      console.error('Error deleting doc:', error);
      toast.error(t("deleteError"));
    }
  };

  const handleEditDoc = async () => {
    if (!editDoc || !editDoc._id) {
      console.error('No document selected or document ID is missing');
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_URL}/api/docs/${editDoc._id}`, {
        title_en: editDoc.title_en,
        text_en: editDoc.text_en,
        title_ru: editDoc.title_ru,
        text_ru: editDoc.text_ru,
        title_uz: editDoc.title_uz,
        text_uz: editDoc.text_uz,
        link: editDoc.link,
      });

      if (response.data && response.data.success) {
        toast.success(t("editSuccess"));
        fetchDocs();
        setEditDoc(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating doc:', error);
      toast.error(t("editError"));
    }
  };

  const openModal = (doc = null) => {
    setEditDoc(doc ? { ...doc } : null);
    setNewDoc({ 
      title_en: '', text_en: '', title_ru: '', text_ru: '', 
      title_uz: '', text_uz: '', link: '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditDoc(null);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (editDoc) {
      setEditDoc({ ...editDoc, [field]: value });
    } else {
      setNewDoc({ ...newDoc, [field]: value });
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

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination
  const pageCount = Math.ceil(filteredDocs.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentDocs = filteredDocs.slice(offset, offset + itemsPerPage);

  return (
    <div className="docs-page">
      <Sidebar />
      <div className="docs-content">
        <div className="docs-header">
          <div>
            <h1>{t("docs")}</h1>
            <p className="docs-subtitle">
              {t("totalDocs")}: <strong>{filteredDocs.length}</strong> {t("docsCount")}
            </p>
          </div>
          <button onClick={() => openModal()} className="add-doc-btn">
            <FiPlus size={20} />
            {t("addDoc")}
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchDocs")}
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
        ) : filteredDocs.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noDocs")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noDocsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="docs-grid">
              {currentDocs.map(doc => (
                <div key={doc._id} className="doc-card">
                  <div className="doc-icon">
                    <FiFileText size={32} />
                  </div>

                  <div className="doc-content">
                    <h3 className="doc-title">{doc[`title_${currentLang}`]}</h3>
                    <p className="doc-text">{doc[`text_${currentLang}`]}</p>

                    {doc.createdAt && (
                      <div className="doc-meta">
                        <FiCalendar size={14} />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    )}

                    {doc.link && (
                      <a 
                        href={doc.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <FiExternalLink size={16} />
                        {t("openDocument")}
                      </a>
                    )}
                  </div>

                  <div className="doc-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openModal(doc)}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                      <span className="action-btn-text">{t("edit")}</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteDoc(doc._id)}
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
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={editDoc ? handleEditDoc : handleAddDoc}
        >
          <div className="modal-form">
            <h2 className="modal-title">
              {editDoc ? t("editDoc") : t("addDoc")}
            </h2>

            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                placeholder={t("titleUz")}
                value={editDoc ? editDoc.title_uz : newDoc.title_uz}
                onChange={(e) => handleInputChange(e, 'title_uz')}
                className="form-input"
                required
              />
              <textarea
                placeholder={t("textUz")}
                value={editDoc ? editDoc.text_uz : newDoc.text_uz}
                onChange={(e) => handleInputChange(e, 'text_uz')}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("russian")}</h3>
              <input
                type="text"
                placeholder={t("titleRu")}
                value={editDoc ? editDoc.title_ru : newDoc.title_ru}
                onChange={(e) => handleInputChange(e, 'title_ru')}
                className="form-input"
                required
              />
              <textarea
                placeholder={t("textRu")}
                value={editDoc ? editDoc.text_ru : newDoc.text_ru}
                onChange={(e) => handleInputChange(e, 'text_ru')}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("english")}</h3>
              <input
                type="text"
                placeholder={t("titleEn")}
                value={editDoc ? editDoc.title_en : newDoc.title_en}
                onChange={(e) => handleInputChange(e, 'title_en')}
                className="form-input"
                required
              />
              <textarea
                placeholder={t("textEn")}
                value={editDoc ? editDoc.text_en : newDoc.text_en}
                onChange={(e) => handleInputChange(e, 'text_en')}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("documentLink")}</h3>
              <input
                type="url"
                placeholder={t("linkPlaceholder")}
                value={editDoc ? editDoc.link : newDoc.link}
                onChange={(e) => handleInputChange(e, 'link')}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {editDoc ? t("updateDoc") : t("addDoc")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DocsPage;