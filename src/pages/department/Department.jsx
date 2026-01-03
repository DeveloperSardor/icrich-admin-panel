import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Sidebar from "../../components/sidebar/Sidebar";
import Modal from "../../components/news-add/NewsAdd";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiSearch,
  FiX,
  FiFolder,
  FiUsers,
  FiMove
} from "react-icons/fi";
import "./style.css";

const DepartmentForm = () => {
  const { currentLang } = useContext(Context);
  const { t } = useTranslation("global");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [departmentList, setDepartmentList] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: {
      en: "",
      ru: "",
      uz: "",
    },
    img: "",
    order: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepts, setExpandedDepts] = useState({});
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDepartments();
  }, []);

useEffect(() => {
  if (searchQuery.trim() === "") {
    // Sort by order
    const sorted = [...departmentList].sort((a, b) => a.order - b.order);
    setFilteredDepartments(sorted);
  } else {
    const filtered = departmentList.filter((dept) => {
      const searchLower = searchQuery.toLowerCase();
      
      const titleMatch = 
        dept.title?.en?.toLowerCase().includes(searchLower) ||
        dept.title?.ru?.toLowerCase().includes(searchLower) ||
        dept.title?.uz?.toLowerCase().includes(searchLower);
      
      return titleMatch;
    }).sort((a, b) => a.order - b.order); // Sort qo'shish
    
    setFilteredDepartments(filtered);
    setCurrentPage(0);
  }
}, [searchQuery, departmentList]);

 const fetchDepartments = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${BACKEND_URL}/api/department`);
    if (response.data.success) {
      const sorted = [...response.data.data].sort((a, b) => a.order - b.order);
      setDepartmentList(sorted);
      setFilteredDepartments(sorted);
    } else {
      toast.error(t("fetchError"));
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    toast.error(t("fetchError"));
  } finally {
    setLoading(false);
  }
};

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "roadsidecoder");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/roadsidecoder/image/upload",
        data
      );
      
      if (res.data.secure_url) {
        setFormData({ ...formData, img: res.data.secure_url });
        toast.success(t("imageUploadSuccess"));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("imageUploadError"));
    } finally {
      setImageUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: {
        en: "",
        ru: "",
        uz: "",
      },
      img: "",
      order: departmentList.length,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (department) => {
    setEditingId(department._id);
    setFormData({
      title: {
        en: department.title?.en || "",
        ru: department.title?.ru || "",
        uz: department.title?.uz || "",
      },
      img: department.img || "",
      order: department.order || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({
      title: {
        en: "",
        ru: "",
        uz: "",
      },
      img: "",
      order: 0,
    });
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/department/${id}`);
      
      if (response.data.success) {
        toast.success(t("deleteSuccess"));
        fetchDepartments();
      } else {
        toast.error(response.data.message || t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(error.response?.data?.message || t("deleteError"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/department/${editingId}`
        : `${BACKEND_URL}/api/department`;
      const method = editingId ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.data.success) {
        toast.success(
          editingId ? t("editSuccess") : t("addSuccess")
        );
        fetchDepartments();
        closeModal();
      } else {
        toast.error(response.data.message || t("error"));
      }
    } catch (error) {
      console.error("Error submitting department:", error);
      toast.error(error.response?.data?.message || t("error"));
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredDepartments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredDepartments(items);

    // Update orders in backend
    try {
      const updatePromises = items.map((item, index) =>
        axios.put(`${BACKEND_URL}/api/department/${item._id}/reorder`, {
          order: index
        })
      );

      await Promise.all(updatePromises);
      toast.success("Tartib muvaffaqiyatli o'zgartirildi");
      fetchDepartments();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Tartibni o'zgartirishda xatolik");
      fetchDepartments();
    }
  };

  const toggleExpand = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('title.')) {
      const lang = field.split('.')[1];
      setFormData({
        ...formData,
        title: {
          ...formData.title,
          [lang]: value
        }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const pageCount = Math.ceil(filteredDepartments.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentDepartments = filteredDepartments.slice(offset, offset + itemsPerPage);

  return (
    <div className="department-page">
      <Sidebar />
      <div className="department-content">
        <div className="department-header">
          <div>
            <h1>{t("department")}</h1>
            <p className="department-subtitle">
              {t("totalDepartments")}: <strong>{filteredDepartments.length}</strong> {t("departmentsCount")}
            </p>
          </div>
          <button onClick={openAddModal} className="add-department-btn">
            <FiPlus size={20} />
            {t("addDepartment")}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t("searchDepartments")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>{t("loading")}</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="empty-state">
            <FiFolder size={64} />
            <h3>{searchQuery ? t("noSearchResults") : t("noDepartments")}</h3>
            <p>{searchQuery ? t("noSearchResults") : t("noDepartmentsDesc")}</p>
          </div>
        ) : (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="departments">
                {(provided) => (
                  <div
                    className="department-grid"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {currentDepartments.map((department, index) => (
                      <Draggable
                        key={department._id}
                        draggableId={department._id}
                        index={offset + index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`department-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="drag-handle" {...provided.dragHandleProps}>
                              <FiMove size={20} />
                              <span className="order-number">#{department.order}</span>
                            </div>

                            <div className="department-card-media">
                              {department.img ? (
                                <img src={department.img} alt={department.title?.en} />
                              ) : (
                                <div className="no-media">
                                  <FiFolder size={48} />
                                </div>
                              )}
                            </div>

                            <div className="department-card-content">
                              <h3 className="department-title">
                                {currentLang === "en"
                                  ? department.title?.en
                                  : currentLang === "ru"
                                  ? department.title?.ru
                                  : department.title?.uz}
                              </h3>

                              {department.employees && department.employees.length > 0 && (
                                <div className="employees-section">
                                  <button
                                    className="employees-toggle"
                                    onClick={() => toggleExpand(department._id)}
                                  >
                                    <FiUsers size={16} />
                                    <span>{department.employees.length} {t('employee')}</span>
                                  </button>

                                  {expandedDepts[department._id] && (
                                    <div className="employees-list">
                                      {department.employees.map((employee) => (
                                        <div key={employee._id} className="employee-item">
                                          <img 
                                            src={employee.img || '/default-avatar.png'} 
                                            alt={employee.name?.[currentLang]}
                                          />
                                          <div>
                                            <p className="employee-name">
                                              {employee.name?.[currentLang]}
                                            </p>
                                            <p className="employee-position">
                                              {employee.position?.[currentLang]}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="department-card-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEdit(department)}
                                title={t("edit")}
                              >
                                <FiEdit2 size={16} />
                                <span className="action-btn-text">{t("edit")}</span>
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(department._id)}
                                title={t("delete")}
                              >
                                <FiTrash2 size={16} />
                                <span className="action-btn-text">{t("delete")}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {pageCount > 1 && (
              <ReactPaginate
                previousLabel={`← ${t("previous")}`}
                nextLabel={`${t("next")} →`}
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="pagination"
                activeClassName="active"
                previousClassName="pagination-btn"
                nextClassName="pagination-btn"
                disabledClassName="disabled"
                pageClassName="pagination-page"
                forcePage={currentPage}
              />
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <div className="modal-form">
            <h2 className="modal-title">
              {editingId ? t("editDepartment") : t("addDepartment")}
            </h2>

            <div className="form-section">
              <h3 className="section-title">{t("uzbek")}</h3>
              <input
                type="text"
                placeholder="Bo'lim nomi (O'zbekcha)"
                value={formData.title.uz}
                onChange={(e) => handleInputChange("title.uz", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("russian")}</h3>
              <input
                type="text"
                placeholder="Название отдела (Русский)"
                value={formData.title.ru}
                onChange={(e) => handleInputChange("title.ru", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("english")}</h3>
              <input
                type="text"
                placeholder="Department Name (English)"
                value={formData.title.en}
                onChange={(e) => handleInputChange("title.en", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">Tartib raqami</h3>
              <input
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value))}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-section">
              <h3 className="section-title">{t("departmentImage")}</h3>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <FiImage size={20} />
                  <span>
                    {imageUploading ? t("uploading") : t("uploadImage")}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={imageUploading}
                    accept="image/*"
                  />
                </label>
              </div>

              {formData.img && !imageUploading && (
                <div className="image-preview">
                  <img src={formData.img} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleInputChange("img", "")}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={imageUploading}>
              {editingId ? t("save") : t("addDepartment")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DepartmentForm;