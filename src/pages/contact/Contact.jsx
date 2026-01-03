import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import { 
  FiUser, 
  FiPhone, 
  FiMessageSquare, 
  FiTrash2, 
  FiClock,
  FiMail
} from "react-icons/fi";
import "./style.css";

const Contacts = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang; // Bu qatorni qo'shing
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation("global");

  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/contact`);
      if (response.data.success) {
        setContactsData(response.data.data);
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    
    const monthsUz = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
    ];
    
    const monthsRu = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
    
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // currentLang asosida til tanlash
    const months = currentLang === 'ru' ? monthsRu : 
                   currentLang === 'en' ? monthsEn : monthsUz;
    
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}-${month} ${year}, ${hours}:${minutes}`;
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm(t("confirmDelete") || "Rostdan ham o'chirmoqchimisiz?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/contact/${id}`);
      if (response.data.success) {
        setContactsData(contactsData.filter((contact) => contact._id !== id));
        toast.success(t("deleteSuccess") || "Muvaffaqiyatli o'chirildi");
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError") || "Xatolik yuz berdi");
    } finally {
      setDeleteLoading(null);
    }
  };

  const renderContacts = () => {
    const offset = currentPage * itemsPerPage;
    const currentItems = contactsData.slice(offset, offset + itemsPerPage);

    if (currentItems.length === 0) {
      return (
        <div className="empty-state">
          <FiMail size={64} />
          <h3>{t("noContacts") || "Hozircha xabarlar yo'q"}</h3>
          <p>{t("noContactsDesc") || "Yangi xabarlar kelganda shu yerda ko'rinadi"}</p>
        </div>
      );
    }

    return (
      <div className="contacts-grid">
        {currentItems.map((contact) => (
          <div key={contact._id} className="contact-card">
            <div className="contact-header">
              <div className="contact-avatar">
                <FiUser size={24} />
              </div>
              <div className="contact-info">
                <h3 className="contact-name">{contact.name}</h3>
                <div className="contact-phone">
                  <FiPhone size={14} />
                  <span>{contact.phone}</span>
                </div>
              </div>
            </div>

            <div className="contact-message">
              <div className="message-icon">
                <FiMessageSquare size={16} />
              </div>
              <p>{contact.message}</p>
            </div>

            <div className="contact-footer">
              <div className="contact-date">
                <FiClock size={14} />
                <span>{formatDate(contact.createdAt)}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteContact(contact._id)}
                disabled={deleteLoading === contact._id}
              >
                {deleteLoading === contact._id ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    {t("delete") || "O'chirish"}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="contacts-page">
      <Sidebar />
      <div className="contacts-content">
        <div className="contacts-header">
          <div>
            <h1>{t("contacts") || "Xabarlar"}</h1>
            <p className="contacts-subtitle">
              {t("totalContacts") || "Jami"}: <strong>{contactsData.length}</strong> {t("messages") || "ta xabar"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>{t("loading") || "Yuklanmoqda..."}</p>
          </div>
        ) : (
          <>
            {renderContacts()}

            {contactsData.length > itemsPerPage && (
              <ReactPaginate
                previousLabel={`← ${t("previous") || "Oldingi"}`}
                nextLabel={`${t("next") || "Keyingi"} →`}
                breakLabel="..."
                pageCount={Math.ceil(contactsData.length / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="pagination"
                activeClassName="active"
                previousClassName="pagination-btn"
                nextClassName="pagination-btn"
                disabledClassName="disabled"
                pageClassName="pagination-page"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Contacts;