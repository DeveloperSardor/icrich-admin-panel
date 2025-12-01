// Audit.jsx
import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "react-modal";
import Context from "../../context/Context";
import { toast } from 'react-hot-toast';
import "./style.css";

const Audit = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const contextDatas = useContext(Context);
  const currentLang = contextDatas.currentLang;
  const [t] = useTranslation("global");

  const [docs, setDocs] = useState([]);
  const [formData, setFormData] = useState({
    title_en: "", title_ru: "", title_uz: "",
    desc_en: "", desc_ru: "", desc_uz: "",
    pdf_link: ""
  });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/audit`);
      setDocs(response.data.data);
    } catch (error) {
      console.error("Error fetching docs:", error);
    }
  };

  const handleAddOrUpdateDoc = async () => {
    try {
      let response;
      if (editId) {
        response = await axios.put(`${BACKEND_URL}/api/audit/${editId}`, formData);
      } else {
        response = await axios.post(`${BACKEND_URL}/api/audit`, formData);
      }

      if (response?.data?.success) {
        if (editId) {
          const updatedDocs = docs.map(doc => doc._id === editId ? response.data.data : doc);
          setDocs(updatedDocs);
          toast.success(currentLang === "uz" ? "Muvaffaqiyatli o'zgartirildi" : currentLang === "ru" ? "Успешно обновлено" : "Successfully updated");
        } else {
          setDocs([...docs, response.data.data]);
          toast.success(currentLang === "uz" ? "Muvaffaqiyatli qo'shildi" : currentLang === "ru" ? "Успешно добавлено" : "Successfully added");
        }
      } else {
        toast.error(currentLang === "uz" ? "Xatolik yuz berdi" : currentLang === "ru" ? "Произошла ошибка" : "An error occurred");
      }
    } catch (error) {
      console.error("Error saving doc:", error);
      toast.error(currentLang === "uz" ? "Xatolik yuz berdi" : currentLang === "ru" ? "Произошла ошибка" : "An error occurred");
    } finally {
      closeModal();
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/audit/${id}`);
      setDocs(docs.filter(doc => doc._id !== id));
    } catch (error) {
      console.error("Error deleting doc:", error);
    }
  };

  const openModal = (doc = null) => {
    if (doc) {
      setFormData({
        title_en: doc.title_en || "",
        title_ru: doc.title_ru || "",
        title_uz: doc.title_uz || "",
        desc_en: doc.desc_en || "",
        desc_ru: doc.desc_ru || "",
        desc_uz: doc.desc_uz || "",
        pdf_link: doc.pdf_link || ""
      });
      setEditId(doc._id);
    } else {
      setFormData({
        title_en: "", title_ru: "", title_uz: "",
        desc_en: "", desc_ru: "", desc_uz: "",
        pdf_link: ""
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title_en: "", title_ru: "", title_uz: "",
      desc_en: "", desc_ru: "", desc_uz: "",
      pdf_link: ""
    });
    setEditId(null);
  };

  const handleInputChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="page-container" style={{ overflowY: 'auto', height: '100vh' }}>
      <Sidebar />
      <div className="docs-content" style={{ padding: '20px', flexGrow: 1 }}>
        <div className="docs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{t("audit")}</h1>
          <button className="add-doc-button" onClick={() => openModal()}>
            {t("addAudit")}
          </button>
        </div>

        <div className="docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {docs.map((doc) => (
            <div key={doc?._id} className="doc-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3>
                {currentLang === "uz"
                  ? doc?.title_uz
                  : currentLang === "ru"
                  ? doc?.title_ru
                  : doc?.title_en}
              </h3>
              <p>
                {currentLang === "uz"
                  ? doc?.desc_uz
                  : currentLang === "ru"
                  ? doc?.desc_ru
                  : doc?.desc_en}
              </p>

              {doc?.pdf_link && (
                <a
                  href={doc.pdf_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-link"
                  style={{ color: '#007bff', textDecoration: 'underline', display: 'inline-block', marginTop: '10px' }}
                >
                  {t("viewPDF") || "View PDF"}
                </a>
              )}

              <div className="card-buttons" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="edit_btnn" onClick={() => openModal(doc)}>
                  {t("edit")}
                </button>
                <button className="delete_btnn" onClick={() => handleDeleteDoc(doc?._id)}>
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={editId ? t("editDoc") : t("addAudit")}
          className="modal"
          overlayClassName="overlay"
        >
          <h2>{editId ? t("edit") : t("addDoc")}</h2>

          <input type="text" placeholder={`${t("titlePlaceholder")} (English)`} value={formData.title_en} onChange={(e) => handleInputChange(e, "title_en")} />
          <input type="text" placeholder={`${t("titlePlaceholder")} (Русский)`} value={formData.title_ru} onChange={(e) => handleInputChange(e, "title_ru")} />
          <input type="text" placeholder={`${t("titlePlaceholder")} (Uzbek)`} value={formData.title_uz} onChange={(e) => handleInputChange(e, "title_uz")} />

          <input type="text" placeholder={`${t("textPlaceholder")} (English)`} value={formData.desc_en} onChange={(e) => handleInputChange(e, "desc_en")} />
          <input type="text" placeholder={`${t("textPlaceholder")} (Русский)`} value={formData.desc_ru} onChange={(e) => handleInputChange(e, "desc_ru")} />
          <input type="text" placeholder={`${t("textPlaceholder")} (Uzbek)`} value={formData.desc_uz} onChange={(e) => handleInputChange(e, "desc_uz")} />

          <input type="text" placeholder={t("pdfLinkPlaceholder") || "PDF link"} value={formData.pdf_link} onChange={(e) => handleInputChange(e, "pdf_link")} />

          <button onClick={handleAddOrUpdateDoc}>
            {editId ? t("save") : t("addAudit")}
          </button>
          <button onClick={closeModal} className="close-modal">
            {t("cancel")}
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default Audit;
