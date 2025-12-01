import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Context from './context/Context';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import Login from './pages/login/Login';
import News from './pages/news/News';
import Dashboard from './pages/dashboard/Dashboard';
import AnnouncementPage from './pages/announcement/Announcement';
import DocsPage from './pages/docs/Docs';
import Leadership from './pages/leadership/Leadership';
import DepartmentPage from './pages/department/Department';
import Chapter from './pages/charter/Charter';
import Vacancies from './pages/vacancies/Vacancies';
import RolesPage from './pages/role-page/RolesPage';
import AuditPage from './pages/audit/Audit'
import VacancyApplications from './pages/vacancy-appeals/VacancyAppeals';
import UneskoPage from './pages/unesko/Unesko';
import NationalListPage from './pages/national-list/NationalList';
import ExpeditionsPage from './pages/expedition/Expeditions';
import LocalList from './pages/local-list/LocalList';
import Articles from './pages/articles/Articles';
import Contacts from './pages/contact/Contact';
import UsefulResources from './pages/useful-resources/UsefulResources';
import Audit from './pages/audit/Audit';

// Tilni olish va saqlash uchun funksiyalar
const getInitialLang = () => localStorage.getItem('currentLang') || 'en';

const App = () => {
  const { t, i18n } = useTranslation('global');
  const [currentLang, setCurrentLang] = useState(getInitialLang);

  useEffect(() => {
    i18n.changeLanguage(currentLang);
  }, [currentLang, i18n]);

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    localStorage.setItem('currentLang', lang);
  };

  return (
    <Context.Provider value={{ currentLang, handleChangeLanguage }}>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/announcement" element={<ProtectedRoute><AnnouncementPage /></ProtectedRoute>} />
        <Route path="/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
        <Route path="/leadership" element={<ProtectedRoute><Leadership /></ProtectedRoute>} />
        <Route path="/department" element={<ProtectedRoute><DepartmentPage /></ProtectedRoute>} />
        <Route path="/charter" element={<ProtectedRoute><Chapter /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
        <Route path="/vacancy" element={<ProtectedRoute><Vacancies /></ProtectedRoute>} />
        <Route path="/vacancy-applications" element={<ProtectedRoute><VacancyApplications /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
        <Route path="/unesko" element={<ProtectedRoute><UneskoPage /></ProtectedRoute>} />
        <Route path="/national" element={<ProtectedRoute><NationalListPage /></ProtectedRoute>} />
        <Route path="/expedition" element={<ProtectedRoute><ExpeditionsPage /></ProtectedRoute>} />
        <Route path="/local-list" element={<ProtectedRoute><LocalList /></ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
        <Route path="/useful-resources" element={<ProtectedRoute><UsefulResources /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      </Routes>
    </Context.Provider>
  );
};

export default App;
