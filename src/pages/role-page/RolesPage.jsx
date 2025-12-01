import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './style.css';
import Sidebar from '../../components/sidebar/Sidebar';
import Modal from 'react-modal';
import Context from '../../context/Context';
import { useTranslation } from 'react-i18next';

Modal.setAppElement('#root');

const RolesPage = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const [t, i18n] = useTranslation('global');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({
    name_en: '', name_ru: '', name_uz: ''
  });
  const [editRole, setEditRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roles`);
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddRole = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/roles`, newRole);
      setRoles([...roles, response.data.data]);
      setNewRole({ name_en: '', name_ru: '', name_uz: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/roles/${id}`);
      setRoles(roles.filter(role => role._id !== id));
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!editRole || !editRole._id) {
      console.error('No role selected or role ID is missing');
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_URL}/api/roles/${editRole._id}`, editRole);
      if (response.data && response.data.data) {
        const updatedRoles = roles.map(role =>
          role._id === editRole._id ? response.data.data : role
        );
        setRoles(updatedRoles);
      }

      setEditRole(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const openModal = (role = null) => {
    setEditRole(role ? { ...role } : null);
    setNewRole({ name_en: '', name_ru: '', name_uz: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditRole(null);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (editRole) {
      setEditRole({ ...editRole, [field]: value });
    } else {
      setNewRole({ ...newRole, [field]: value });
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="roles-content">
        <div className="roles-header">
          <h1>{t('roles')}</h1>
          <button className="add-role-button" onClick={() => openModal()}>{t('addRole')}</button>
        </div>

        <div className="roles-grid">
          {roles.map(role => (
            <div key={role._id} className="role-card">
              <h3>{currentLang == 'en' ? role?.name_en : currentLang == 'ru' ? role?.name_ru : role?.name_uz}</h3>
              <div className="card-buttons">
                <button onClick={() => openModal(role)}>{t('edit')}</button>
                <button onClick={() => handleDeleteRole(role._id)}>{t('delete')}</button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={editRole ? t('editRole') : t('addRole')}
          className="modal"
          overlayClassName="overlay"
        >
          <h2>{editRole ? t('editRole') : t('addRole')}</h2>
          <input
            type="text"
            placeholder={t('titlePlaceholder') + ' (English)'}
            value={editRole ? editRole.name_en : newRole.name_en}
            onChange={(e) => handleInputChange(e, 'name_en')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + ' (Русский)'}
            value={editRole ? editRole.name_ru : newRole.name_ru}
            onChange={(e) => handleInputChange(e, 'name_ru')}
          />
          <input
            type="text"
            placeholder={t('titlePlaceholder') + " (Uzbek)"}
            value={editRole ? editRole.name_uz : newRole.name_uz}
            onChange={(e) => handleInputChange(e, 'name_uz')}
          />
          <button onClick={editRole ? handleUpdateRole : handleAddRole}>
            {editRole ? t('editRole') : t('addRole')}
          </button>
          <button onClick={closeModal} className="close-modal">{t('cancel')}</button>
        </Modal>
      </div>
    </div>
  );
};

export default RolesPage;
