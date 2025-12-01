import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import "./style.css";
import LogoImg from '../../assets/loggoo.png'
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const [t, i18n] = useTranslation('global')
  return (
    <div className="dashboar">
      <header className="dashboard-header">
        <h1 style={{ fontSize : "21px", marginLeft : "6em" }}>{t('title')}</h1>
      </header>
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content">
          <img src={LogoImg} style={{ width : "500px", margin : "2em 30em" }}/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
