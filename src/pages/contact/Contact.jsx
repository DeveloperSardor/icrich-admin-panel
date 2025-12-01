import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/sidebar/Sidebar";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import "./style.css"; // Custom styles for design

const Contacts = () => {
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation("global");

  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
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

    fetchContacts();
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const renderContacts = () => {
    const offset = currentPage * itemsPerPage;
    const currentItems = contactsData.slice(offset, offset + itemsPerPage);

    return (
      <div className="contacts-container">
        {currentItems.map((contact) => (
          <div key={contact._id} className="contact-card">
            <h3>{contact.name}</h3>
            <p>{contact.phone}</p>
            <p>{contact.message.slice(0, 100)}...</p>
            <div className="contact-actions">
              <button onClick={() => handleDeleteContact(contact._id)}>
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteContact = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/contact/${id}`);
      if (response.data.success) {
        setContactsData(contactsData.filter((contact) => contact._id !== id));
        toast.success(t("deleteSuccess"));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="contacts-page">
      <div className="page-layout">
        <Sidebar />
        <div className="contacts-content">
          <h1>{t("contact")}</h1>
          {loading ? <p>{t("loading")}</p> : renderContacts()}

          <ReactPaginate
            previousLabel={`← ${t("previous")}`}
            nextLabel={`${t("next")} →`}
            breakLabel="..."
            pageCount={Math.ceil(contactsData.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="pagination"
            activeClassName="active"
            previousClassName="pagination-previous"
            nextClassName="pagination-next"
            disabledClassName="disabled"
          />
        </div>
      </div>
    </div>
  );
};

export default Contacts;
