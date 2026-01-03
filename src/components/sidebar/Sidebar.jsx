import React, { useContext, useState } from "react";
import Context from "../../context/Context";
import "./style.css";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import {
  FiHome,
  FiMail,
  FiFileText,
  FiBell,
  FiFile,
  FiUsers,
  FiGrid,
  FiBookOpen,
  FiClipboard,
  FiBriefcase,
  FiCheckSquare,
  FiShield,
  FiGlobe,
  FiMap,
  FiMapPin,
  FiBookmark,
  FiDatabase,
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX
} from "react-icons/fi";

const Sidebar = () => {
  const { currentLang, handleChangeLanguage } = useContext(Context);
  const [t] = useTranslation('global');
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    { path: '/', label: t('dashboard'), icon: <FiHome /> },
    { path: '/contact', label: t('contact'), icon: <FiMail /> },
    { path: '/news', label: t('news'), icon: <FiFileText /> },
    { path: '/announcement', label: t('announcement'), icon: <FiBell /> },
    { path: '/docs', label: t('docs'), icon: <FiFile /> },
    { path: '/leadership', label: t('leader.title'), icon: <FiUsers /> },
    { path: '/department', label: t('department'), icon: <FiGrid /> },
    { path: '/charter', label: t('charter'), icon: <FiBookOpen /> },
    { path: '/audit', label: t('audit'), icon: <FiClipboard /> },
    {
      section: 'vacancy',
      label: t('vacancies'),
      icon: <FiBriefcase />,
      children: [
        { path: '/vacancy', label: t('vacancy') },
        { path: '/vacancy-applications', label: t('vacancyApplications') },
        { path: '/roles', label: t('roles') }
      ]
    },
    {
      section: 'heritage',
      label: t('culturalHeritage'),
      icon: <FiGlobe />,
      children: [
        { path: '/unesko', label: t('unesko') },
        { path: '/national', label: t('nationalList') },
        { path: '/expedition', label: t('expedition') },
        { path: '/local-list', label: t('localList') }
      ]
    },
    { path: '/articles', label: t('articles'), icon: <FiBookmark /> },
    { path: '/useful-resources', label: t('usefulResources'), icon: <FiDatabase /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo/Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="logo-image"
              onError={(e) => {
                // Agar rasm topilmasa, default icon ko'rsatish
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            {/* Fallback icon agar logo topilmasa */}
            <div className="logo-fallback" style={{ display: 'none' }}>
              <FiShield size={32} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => {
              if (item.section) {
                // Expandable section
                const isExpanded = expandedSections[item.section];
                const hasActiveChild = item.children.some(child => isActive(child.path));
                
                return (
                  <li key={index} className="nav-section">
                    <button
                      className={`nav-section-toggle ${hasActiveChild ? 'active' : ''}`}
                      onClick={() => toggleSection(item.section)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-arrow">
                        {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                      </span>
                    </button>
                    <ul className={`nav-submenu ${isExpanded ? 'expanded' : ''}`}>
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            to={child.path}
                            className={`nav-link submenu-link ${isActive(child.path) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="submenu-indicator"></span>
                            <span className="nav-label">{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              } else {
                // Regular link
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        </nav>

        {/* Language Selector */}
        <div className="sidebar-footer">
          <div className="language-selector">
            <label className="language-label">
              <FiGlobe size={18} />
              <span>Til / Language</span>
            </label>
            <select
              value={currentLang}
              onChange={(e) => handleChangeLanguage(e.target.value)}
              className="language-select"
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;