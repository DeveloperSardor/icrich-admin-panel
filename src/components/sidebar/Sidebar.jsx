import React, { useContext } from "react";
import Context from "../../context/Context"; // Adjust the path to your Context file
import "./style.css";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { currentLang, handleChangeLanguage } = useContext(Context);
const [t, i18n] = useTranslation('global')

  return (
    <aside className="dashboard-sidebar">
      <nav>
        <ul>
          <li><Link to={'/'}>{t('dashboard')}</Link></li>
          <li><Link to={'/contact'}>{t('contact')}</Link></li>
          <li><Link to={'/news'}>{t('news')}</Link></li>
          <li><Link to={'/announcement'}>{t('announcement')}</Link></li>
          <li><Link to={'/docs'}>{t('docs')}</Link></li>
          <li><Link to={'/leadership'}>{t('leader.title')}</Link></li>
          <li><Link to={'/department'}>{t('department')}</Link></li>
          <li><Link to={'/charter'}>{t('charter')}</Link></li>
          <li><Link to={'/audit'}>{t('audit')}</Link></li>
          <li><Link to={'/vacancy'}>{t('vacancy')}</Link></li>
          <li><Link to={'/vacancy-applications'}>{t('vacancyApplications')}</Link></li>
          <li><Link to={'/roles'}>{t('roles')}</Link></li>
          <li><Link to={'/unesko'}>{t('unesko')}</Link></li>
          <li><Link to={'/national'}>{t('nationalList')}</Link></li>
          <li><Link to={'/expedition'}>{t('expedition')}</Link></li>
          <li><Link to={'/local-list'}>{t('localList')}</Link></li>
          <li><Link to={'/articles'}>{t('articles')}</Link></li>
          <li><Link to={'/useful-resources'}>{t('usefulResources')}</Link></li>
        </ul> 
      </nav>
      <div className="language-changer">
        <p>Current Language: {currentLang.toUpperCase()}</p>
        <select
          value={currentLang}
          onChange={(e) => handleChangeLanguage(e.target.value)}
          className="language-select"
        >
          <option value="en">English</option>
          <option value="uz">O'zbekcha</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;
