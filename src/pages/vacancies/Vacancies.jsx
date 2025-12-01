import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './style.css';
import Sidebar from '../../components/sidebar/Sidebar';
import Modal from 'react-modal';
import Context from '../../context/Context';
import { useTranslation } from 'react-i18next';

Modal.setAppElement('#root');

const VacanciesPage = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const [t, i18n] = useTranslation('global');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [vacancies, setVacancies] = useState([]);
  const [newVacancy, setNewVacancy] = useState({
    role: '', title_en: '', title_ru: '', title_uz: '', text_en: '', text_ru: '', text_uz: '',
  });
  const [editVacancy, setEditVacancy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchVacancies();
    fetchRoles();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/job-vacancies`);
      setVacancies(response.data.data);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roles`);
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddVacancy = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/job-vacancies`, newVacancy);
      setVacancies([...vacancies, response.data.data]);
      setNewVacancy({
        role: '', title_en: '', title_ru: '', title_uz: '', text_en: '', text_ru: '', text_uz: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding vacancy:', error);
    }
  };

  const handleDeleteVacancy = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/job-vacancies/${id}`);
      setVacancies(vacancies.filter(vacancy => vacancy._id !== id));
    } catch (error) {
      console.error('Error deleting vacancy:', error);
    }
  };

  const handleUpdateVacancy = async () => {
    if (!editVacancy || !editVacancy._id) {
      console.error('No vacancy selected or vacancy ID is missing');
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_URL}/api/job-vacancies/${editVacancy._id}`, {
        role: editVacancy.role,
        title_en: editVacancy.title_en,
        title_ru: editVacancy.title_ru,
        title_uz: editVacancy.title_uz,
        text_en: editVacancy.text_en,
        text_ru: editVacancy.text_ru,
        text_uz: editVacancy.text_uz,
      });

      if (response.data && response.data.data) {
        const updatedVacancies = vacancies.map(vacancy =>
          vacancy._id === editVacancy._id ? response.data.data : vacancy
        );
        setVacancies(updatedVacancies);
      }

      setEditVacancy(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating vacancy:', error);
    }
  };

  const openModal = (vacancy = null) => {
    setEditVacancy(vacancy ? { ...vacancy } : null);
    setNewVacancy({
      role: '', title_en: '', title_ru: '', title_uz: '', text_en: '', text_ru: '', text_uz: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditVacancy(null);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (editVacancy) {
      setEditVacancy({ ...editVacancy, [field]: value });
    } else {
      setNewVacancy({ ...newVacancy, [field]: value });
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="vacancies-content">
        <div className="vacancies-header">
          <h1>{t('vacancies')}</h1> {/* Translated Vacancies title */}
          <button className="add-vacancy-button" onClick={() => openModal()}>{t('addVacancy')}</button> {/* Translated Add Vacancy button */}
        </div>

        <div className="vacancies-grid">
          {vacancies.map(vacancy => (
            <div key={vacancy._id} className="vacancy-card">
              <h3>{vacancy.role[`name_${currentLang}`]}</h3>
              <h4 style={{ marginTop : "1em" }}>{vacancy[`title_${currentLang}`]}</h4> {/* Use dynamic title based on language */}
              <p>{vacancy[`text_${currentLang}`]}</p> {/* Use dynamic text based on language */}
              <div className="card-buttons">
                <button onClick={() => openModal(vacancy)}>{t('edit')}</button> {/* Translated Edit button */}
                <button onClick={() => handleDeleteVacancy(vacancy._id)}>{t('delete')}</button> {/* Translated Delete button */}
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={editVacancy ? t('editVacancy') : t('addVacancy')} // Translated content label
          className="modal"
          overlayClassName="overlay"
        >
          <h2>{editVacancy ? t('editVacancy') : t('addVacancy')}</h2> {/* Modal title translation */}
          
          <select
            value={editVacancy ? editVacancy.role : newVacancy.role}
            onChange={(e) => handleInputChange(e, 'role')}
          >
            <option value="">{t('selectRole')}</option> {/* Translated placeholder */}
            {roles.map(role => (
              <option key={role._id} value={role._id}>
                {currentLang == 'uz' ? role?.name_uz : currentLang == 'ru' ? role?.name_ru : role?.name_uz}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={t('titlePlaceholder') + '(English)'} // Translated placeholder
            value={editVacancy ? editVacancy.title_en : newVacancy.title_en}
            onChange={(e) => handleInputChange(e, 'title_en')}
          />
          <textarea
            placeholder={t('textPlaceholder') + '(English)'} // Translated placeholder
            value={editVacancy ? editVacancy.text_en : newVacancy.text_en}
            onChange={(e) => handleInputChange(e, 'text_en')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + '(Русский)'} // Translated placeholder
            value={editVacancy ? editVacancy.title_ru : newVacancy.title_ru}
            onChange={(e) => handleInputChange(e, 'title_ru')}
          />
          <textarea
            placeholder={t('textPlaceholder') + '(Русский)'} // Translated placeholder
            value={editVacancy ? editVacancy.text_ru : newVacancy.text_ru}
            onChange={(e) => handleInputChange(e, 'text_ru')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + '(Uzbek)'} // Translated placeholder
            value={editVacancy ? editVacancy.title_uz : newVacancy.title_uz}
            onChange={(e) => handleInputChange(e, 'title_uz')}
          />
          <textarea
            placeholder={t('textPlaceholder') + '(Uzbek)'} // Translated placeholder
            value={editVacancy ? editVacancy.text_uz : newVacancy.text_uz}
            onChange={(e) => handleInputChange(e, 'text_uz')}
          />
          <button onClick={editVacancy ? handleUpdateVacancy : handleAddVacancy}>
            {editVacancy ? t('editVacancy') : t('addVacancy')}
          </button>

          <button onClick={closeModal} className="close-modal">{t('cancel')}</button> {/* Translated cancel button */}
        </Modal>
      </div>
    </div>
  );
};

export default VacanciesPage;
