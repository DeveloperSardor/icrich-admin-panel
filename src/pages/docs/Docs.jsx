import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './style.css';
import Sidebar from '../../components/sidebar/Sidebar';
import Modal from 'react-modal';
import Context from '../../context/Context';
import { useTranslation } from 'react-i18next';

Modal.setAppElement('#root');

const DocsPage = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const [t, i18n] = useTranslation('global');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [docs, setDocs] = useState([]);
  const [newDoc, setNewDoc] = useState({
    title_en: '', text_en: '', title_ru: '', text_ru: '', title_uz: '', text_uz: '', link: ''
  });
  const [editDoc, setEditDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/docs`);
      setDocs(response.data.data);
    } catch (error) {
      console.error('Error fetching docs:', error);
    }
  };

  const handleAddDoc = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/docs`, newDoc);
      setDocs([...docs, response.data.data]);
      setNewDoc({ title_en: '', text_en: '', title_ru: '', text_ru: '', title_uz: '', text_uz: '', link: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding doc:', error);
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/docs/${id}`);
      setDocs(docs.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Error deleting doc:', error);
    }
  };

  const handleUpdateDoc = async () => {
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

      if (response.data && response.data.data) {
        const updatedDocs = docs.map(doc =>
          doc._id === editDoc._id ? response.data.data : doc
        );
        setDocs(updatedDocs);
      }

      setEditDoc(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating doc:', error);
    }
  };

  const openModal = (doc = null) => {
    setEditDoc(doc ? { ...doc } : null);
    setNewDoc({ title_en: '', text_en: '', title_ru: '', text_ru: '', title_uz: '', text_uz: '', link: '' });
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

      if (response.data && response.data.data) {
        const updatedDocs = docs.map(doc =>
          doc._id === editDoc._id ? response.data.data : doc
        );
        setDocs(updatedDocs);
      }

      setEditDoc(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating doc:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="docs-content">
        <div className="docs-header">
          <h1>{t('docs')}</h1> {/* Translated Docs title */}
          <button className="add-doc-button" onClick={() => openModal()}>{t('addDoc')}</button> {/* Translated Add Document button */}
        </div>

        <div className="docs-grid">
          {docs.map(doc => (
            <div key={doc._id} className="doc-card">
              <h3>{doc[`title_${currentLang}`]}</h3> {/* Use dynamic title based on language */}
              <p>{doc[`text_${currentLang}`]}</p> {/* Use dynamic text based on language */}
              <a href={doc.link} target="_blank" rel="noopener noreferrer">{t('viewDocument')}</a> {/* Translated Link Text */}
              <div className="card-buttons">
                <button onClick={() => openModal(doc)}>{t('edit')}</button> {/* Translated Edit button */}
                <button onClick={() => handleDeleteDoc(doc._id)}>{t('delete')}</button> {/* Translated Delete button */}
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={editDoc ? t('editDoc') : t('addDoc')} // Translated content label
          className="modal"
          overlayClassName="overlay"
        >
          <h2>{editDoc ? t('editDoc') : t('addDoc')}</h2> {/* Modal title translation */}
          <input
            type="text"
            placeholder={t('titlePlaceholder') + ' (English)'} // Translated placeholder
            value={editDoc ? editDoc.title_en : newDoc.title_en}
            onChange={(e) => handleInputChange(e, 'title_en')}
          />
          <textarea
            placeholder={t('textPlaceholder') + ' (English)'} // Translated placeholder
            value={editDoc ? editDoc.text_en : newDoc.text_en}
            onChange={(e) => handleInputChange(e, 'text_en')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + ' (Русский)'} // Translated placeholder
            value={editDoc ? editDoc.title_ru : newDoc.title_ru}
            onChange={(e) => handleInputChange(e, 'title_ru')}
          />
          <textarea
            placeholder={t('textPlaceholder') + " (Русский)"} // Translated placeholder
            value={editDoc ? editDoc.text_ru : newDoc.text_ru}
            onChange={(e) => handleInputChange(e, 'text_ru')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + " (Uzbek)"} // Translated placeholder
            value={editDoc ? editDoc.title_uz : newDoc.title_uz}
            onChange={(e) => handleInputChange(e, 'title_uz')}
          />
          <textarea
            placeholder={t('textPlaceholder') + " (Uzbek)"} // Translated placeholder
            value={editDoc ? editDoc.text_uz : newDoc.text_uz}
            onChange={(e) => handleInputChange(e, 'text_uz')}
          />
          <input
            type="text"
            placeholder={t('linkPlaceholder')} // Translated placeholder
            value={editDoc ? editDoc.link : newDoc.link}
            onChange={(e) => handleInputChange(e, 'link')}
          />
          <button onClick={editDoc ? handleEditDoc : handleAddDoc}>
            {editDoc ? t('updateDoc') : t('addDoc')}
          </button>

          <button onClick={closeModal} className="close-modal">{t('cancel')}</button> {/* Translated cancel button */}
        </Modal>
      </div>
    </div>
  );
};

export default DocsPage;
