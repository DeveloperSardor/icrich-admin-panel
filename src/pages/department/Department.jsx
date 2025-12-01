import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import Sidebar from "../../components/sidebar/Sidebar";
import Context from "../../context/Context";
import { useTranslation } from "react-i18next";

Modal.setAppElement("#root");

const DepartmentForm = () => {
  const { currentLang } = useContext(Context);
  const [departmentList, setDepartmentList] = useState([]);
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [titleUz, setTitleUz] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Department");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch department list on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/department`);
        const data = await response.json();
        setDepartmentList(data.data || []);
      } catch (error) {
        console.error("Error fetching department list:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Handle image upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "roadsidecoder");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/roadsidecoder/image/upload",
        { method: "POST", body: data }
      );
      const result = await res.json();
      if (result.secure_url) {
        setImgUrl(result.secure_url);
        setUploadError("");
      } else {
        setUploadError("Image upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Image upload failed.");
    }
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleRu("");
    setTitleUz("");
    setImgUrl("");
    setModalTitle("Add Department");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (department) => {
    setEditingId(department._id);
    setTitleEn(department.title_en);
    setTitleRu(department.title_ru);
    setTitleUz(department.title_uz);
    setImgUrl(department.img);
    setModalTitle("Edit Department");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleRu("");
    setTitleUz("");
    setImgUrl("");
    setModalTitle("Add Department");
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/department/${id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          setDepartmentList((prevList) =>
            prevList.filter((item) => item._id !== id)
          );
          alert("Department deleted successfully.");
        } else {
          alert("Failed to delete department. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        alert("An error occurred while deleting. Please try again.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      title_en: titleEn,
      title_ru: titleRu,
      title_uz: titleUz,
      img: imgUrl,
    };
  
    // Log the data being sent to server for debugging
    console.log("Data being sent to server:", updatedData);
  
    try {
      const response = editingId
        ? await fetch(`${BACKEND_URL}/api/department/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          })
        : await fetch(`${BACKEND_URL}/api/department`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          });
  
      const result = await response.json();
      console.log("Server response status:", response.status);
      console.log("Server response body:", result);
  
      if (response.ok) {
        if (editingId) {
          // Update the department list on successful edit
          setDepartmentList((prevList) =>
            prevList.map((item) =>
              item._id === editingId ? { ...item, ...updatedData } : item
            )
          );
        } else {
          // Add new department on successful create
          setDepartmentList((prevList) => [
            ...prevList,
            { ...updatedData, _id: result.data._id },
          ]);
        }
  
        alert(
          editingId
            ? "Department updated successfully"
            : "Department added successfully"
        );
        closeModal();
      } else {
        const errorMessage = result.message || "Failed to save department. Please try again.";
        console.error("Error:", errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting department:", error);
      alert("An error occurred while saving department. Please try again.");
    }
  };
  
  

  const [t, i18] = useTranslation("global");

  return (
    <div>
      <Sidebar />
      <div style={styles.mainContent}>
        <button onClick={openAddModal} style={styles.addButton}>
          {t("addDepartment")}
        </button>

        <div style={styles.cardGrid}>
          {departmentList.map((department) => (
            <div key={department._id} style={styles.card}>
              <img
                src={department.img}
                alt={department.title_en}
                style={styles.cardImage}
              />
              <h3>
                {currentLang === "en"
                  ? department.title_en
                  : currentLang === "ru"
                  ? department.title_ru
                  : department.title_uz}
              </h3>
              <div style={styles.cardButtons}>
                <button
                  onClick={() => handleEdit(department)}
                  style={styles.editButton}
                >
                  {t("editDepartment")}
                </button>
                <button
                  onClick={() => handleDelete(department._id)}
                  style={styles.deleteButton}
                >
                  {t("deleteDepartment")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={styles.modal}>
        <h2 style={styles.modalTitle}>{modalTitle}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Title (Русский)"
            value={titleRu}
            onChange={(e) => setTitleRu(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Title (O‘zbekcha)"
            value={titleUz}
            onChange={(e) => setTitleUz(e.target.value)}
            style={styles.input}
            required
          />
          <input type="file" onChange={handleFileChange} style={styles.input} />
          {imgUrl && <img src={imgUrl} alt="Preview" style={styles.preview} />}
          {uploadError && <p style={styles.errorText}>{uploadError}</p>}
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>
              {editingId ? t("save") : t("addDepartment")}
            </button>

            <button type="button" onClick={closeModal} style={styles.cancelButton}>
              {t("cancel")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  mainContent: {
    padding: "20px",
    marginLeft: "20em",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    width: "350px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "center",
  },
  cardImage: {
    width: "100%",
    height: "250px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  cardButtons: {
    display: "flex",
    marginTop : "1em",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "6px 8px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "6px 8px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
  },
  modal: {
    content: {
      padding: "20px",
      width: "400px",
      margin: "auto",
      borderRadius: "8px",
    },
  },
  modalTitle: {
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    margin: "10px 0",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  preview: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default DepartmentForm;
