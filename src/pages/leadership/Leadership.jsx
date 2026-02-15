import React, { useState, useEffect, useContext } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Upload, Check, AlertCircle,
  Users, Calendar, Mail, Phone, Briefcase, Award, Clock, Filter
} from 'lucide-react';
import Context from '../../context/Context';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/sidebar/Sidebar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style.css';

const LeadershipAdmin = () => {
  const { t } = useTranslation('global');
  const { currentLang } = useContext(Context);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [leaders, setLeaders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: { uz: '', ru: '', en: '' },
    position: { uz: '', ru: '', en: '' },
    bio: { uz: '', ru: '', en: '' },
    role: 'employee',
    departmentId: '',
    email: '',
    phone: '',
    workPhone: '',
    img: '',
    academicDegree: '',
    scientificInterests: [],
    schedule: {
      days: [],
      start: '',
      end: ''
    },
    order: 0,
    isActive: true
  });

  // ReactQuill sozlamalari
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  const daysOptions = [
    { value: 'monday', label: { uz: 'Dushanba', ru: 'Понедельник', en: 'Monday' } },
    { value: 'tuesday', label: { uz: 'Seshanba', ru: 'Вторник', en: 'Tuesday' } },
    { value: 'wednesday', label: { uz: 'Chorshanba', ru: 'Среда', en: 'Wednesday' } },
    { value: 'thursday', label: { uz: 'Payshanba', ru: 'Четверг', en: 'Thursday' } },
    { value: 'friday', label: { uz: 'Juma', ru: 'Пятница', en: 'Friday' } }
  ];

  const roleOptions = [
    { value: 'leadership', label: { uz: 'Rahbariyat', ru: 'Руководство', en: 'Leadership' }, icon: '👔' },
    { value: 'employee', label: { uz: 'Xodim', ru: 'Сотрудник', en: 'Employee' }, icon: '👤' }
  ];

  useEffect(() => {
    fetchLeaders();
    fetchDepartments();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/leadership`);
      const data = await response.json();
      if (data.success) {
        setLeaders(data.data);
      }
    } catch (error) {
      showNotification(t('leadership.notifications.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/department`);
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'chat-app');
    uploadData.append('cloud_name', 'roadsidecoder');

    try {
      setUploadProgress(30);
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/roadsidecoder/image/upload',
        { method: 'POST', body: uploadData }
      );
      const data = await response.json();
      setUploadProgress(100);

      if (data.secure_url) {
        setFormData(prev => ({ ...prev, img: data.secure_url }));
        showNotification(t('leadership.notifications.imageUploaded'));
      }
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      setUploadProgress(0);
      showNotification(t('leadership.notifications.imageUploadFailed'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.uz || !formData.name.ru || !formData.name.en) {
      showNotification(t('leadership.notifications.nameRequired'), 'error');
      return;
    }
    if (!formData.position.uz || !formData.position.ru || !formData.position.en) {
      showNotification(t('leadership.notifications.positionRequired'), 'error');
      return;
    }
    if (formData.role === 'employee' && !formData.departmentId) {
      showNotification(t('leadership.notifications.departmentRequired'), 'error');
      return;
    }
    if (!formData.img) {
      showNotification(t('leadership.notifications.imageRequired'), 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        position: formData.position,
        bio: formData.bio,
        role: formData.role,
        email: formData.email || '',
        phone: formData.phone || '',
        workPhone: formData.workPhone || '',
        img: formData.img,
        academicDegree: formData.academicDegree || '',
        scientificInterests: formData.scientificInterests || [],
        schedule: formData.schedule || { days: [], start: '', end: '' },
        order: formData.order || 0,
        isActive: formData.isActive
      };

      if (formData.role === 'employee') {
        if (formData.departmentId && typeof formData.departmentId === 'object') {
          submitData.departmentId = formData.departmentId._id || formData.departmentId;
        } else {
          submitData.departmentId = formData.departmentId;
        }
      }

      const url = editingId
        ? `${BACKEND_URL}/api/leadership/${editingId}`
        : `${BACKEND_URL}/api/leadership`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification(editingId ? t('leadership.notifications.updateSuccess') : t('leadership.notifications.addSuccess'));
        fetchLeaders();
        closeModal();
      } else {
        showNotification(data.message || t('leadership.notifications.error'), 'error');
      }
    } catch (error) {
      showNotification(t('leadership.notifications.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('leadership.confirmDelete'))) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/leadership/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        showNotification(t('leadership.notifications.deleteSuccess'));
        fetchLeaders();
      }
    } catch (error) {
      showNotification(t('leadership.notifications.deleteError'), 'error');
    }
  };

  const openModal = (leader = null) => {
    if (leader) {
      setEditingId(leader._id);
      setFormData({
        name: leader.name,
        position: leader.position,
        bio: leader.bio || { uz: '', ru: '', en: '' },
        role: leader.role || 'employee',
        departmentId: leader.departmentId?._id || '',
        email: leader.email || '',
        phone: leader.phone || '',
        workPhone: leader.workPhone || '',
        img: leader.img || '',
        academicDegree: leader.academicDegree || '',
        scientificInterests: leader.scientificInterests || [],
        schedule: leader.schedule || { days: [], start: '', end: '' },
        order: leader.order || 0,
        isActive: leader.isActive !== false
      });
    } else {
      setEditingId(null);
      setFormData({
        name: { uz: '', ru: '', en: '' },
        position: { uz: '', ru: '', en: '' },
        bio: { uz: '', ru: '', en: '' },
        role: 'employee',
        departmentId: '',
        email: '',
        phone: '',
        workPhone: '',
        img: '',
        academicDegree: '',
        scientificInterests: [],
        schedule: { days: [], start: '', end: '' },
        order: 0,
        isActive: true
      });
    }
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setActiveTab('basic');
  };

  const filteredLeaders = leaders.filter(leader => {
    const matchesSearch = leader.name?.[currentLang]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || leader.departmentId?._id === filterDepartment;
    const matchesRole = !filterRole || leader.role === filterRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const stats = {
    total: leaders.length,
    leadership: leaders.filter(l => l.role === 'leadership').length,
    employees: leaders.filter(l => l.role === 'employee').length,
    active: leaders.filter(l => l.isActive).length
  };

  // HTML matnni qisqartirish
  const truncateHtmlText = (html, maxLength) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: '20em', padding: '2rem' }}>
        {notification && (
          <div style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            backgroundColor: notification.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: notification.type === 'error' ? '#991b1b' : '#065f46',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'slideIn 0.3s ease-out',
            border: `1px solid ${notification.type === 'error' ? '#fecaca' : '#a7f3d0'}`
          }}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            <span style={{ fontWeight: '500' }}>{notification.message}</span>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
              }}>
                <Users style={{ color: 'white' }} size={32} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {t('leadership.title')}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {t('leadership.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <Plus size={20} />
              {t('leadership.addNew')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { label: t('leadership.stats.total'), value: stats.total, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
              { label: t('leadership.stats.leadership'), value: stats.leadership, icon: Briefcase, color: '#8b5cf6', bg: '#ede9fe' },
              { label: t('leadership.stats.employees'), value: stats.employees, icon: Users, color: '#10b981', bg: '#d1fae5' },
              { label: t('leadership.stats.active'), value: stats.active, icon: Check, color: '#f59e0b', bg: '#fef3c7' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                padding: '1.25rem',
                backgroundColor: stat.bg,
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem'
                }}>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{stat.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Filter size={20} style={{ color: '#64748b' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>
              {t('leadership.filters')}
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} size={20} />
              <input
                type="text"
                placeholder={t('leadership.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">{t('leadership.allRoles')}</option>
              <option value="leadership">👔 {t('leadership.role.leadership')}</option>
              <option value="employee">👤 {t('leadership.role.employee')}</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">{t('leadership.allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.title?.[currentLang]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}>
                <div style={{ width: '100%', height: '18rem', backgroundColor: '#f1f5f9' }}></div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ height: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
                  <div style={{ height: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.25rem', width: '66%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredLeaders.map(leader => (
              <div key={leader._id} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '1px solid #f1f5f9'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', height: '18rem', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img
                    src={leader.img || 'https://via.placeholder.com/400'}
                    alt={leader.name?.[currentLang]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: leader.role === 'leadership' ? '#8b5cf6' : '#10b981',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>{leader.role === 'leadership' ? '👔' : '👤'}</span>
                    {leader.role === 'leadership' ? t('leadership.role.leadership') : t('leadership.role.employee')}
                  </div>
                  {!leader.isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '0.5rem'
                    }}>
                      {t('leadership.inactive')}
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {leader.name?.[currentLang] || 'No name'}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#8b5cf6',
                    marginBottom: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {leader.position?.[currentLang] || 'No position'}
                  </p>

                  {leader.bio?.[currentLang] && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5'
                    }}>
                      {truncateHtmlText(leader.bio[currentLang], 100)}
                    </p>
                  )}

                  {leader.academicDegree && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#fef3c7',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      <Award size={14} />
                      <span>{leader.academicDegree}</span>
                    </div>
                  )}

                  {leader.departmentId && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#64748b'
                    }}>
                      <Briefcase size={14} />
                      <span>{leader.departmentId?.title?.[currentLang]}</span>
                    </div>
                  )}

                  {leader.schedule?.days?.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#0c4a6e',
                      marginBottom: '1rem'
                    }}>
                      <Clock size={14} />
                      <span>
                        {leader.schedule.start && `${leader.schedule.start}-${leader.schedule.end}`}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => openModal(leader)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.75rem',
                        backgroundColor: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #e0f2fe',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e0f2fe';
                        e.target.style.borderColor = '#bae6fd';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f0f9ff';
                        e.target.style.borderColor = '#e0f2fe';
                      }}
                    >
                      <Edit2 size={16} />
                      {t('leadership.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(leader._id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.75rem',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fee2e2',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fee2e2';
                        e.target.style.borderColor = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.borderColor = '#fee2e2';
                      }}
                    >
                      <Trash2 size={16} />
                      {t('leadership.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLeaders.length === 0 && !loading && (
          <div style={{
            backgroundColor: 'white',
            padding: '4rem 2rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <Users size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
              {t('leadership.notFound')}
            </h3>
            <p style={{ color: '#64748b' }}>{t('leadership.notFoundDesc')}</p>
          </div>
        )}
      </div>

      {/* MODAL - Kengaytirilgan va Yaxshilangan */}
      {isModalOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    animation: 'fadeIn 0.2s ease-out',
    overflowY: 'auto'
  }}
  onClick={closeModal}
  >
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      maxWidth: '65rem', // 90rem dan 65rem ga kichiklashtirildi
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'slideUp 0.3s ease-out'
    }}
    onClick={(e) => e.stopPropagation()}
    >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {editingId ? t('leadership.edit') : t('leadership.addNew')}
              </h2>
              <button
                onClick={closeModal}
                type="button"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '0.5rem',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden'
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '1rem 2rem 0',
                borderBottom: '2px solid #f1f5f9',
                backgroundColor: '#fafafa'
              }}>
                {['basic', 'contact', 'schedule', 'other'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                      backgroundColor: 'transparent',
                      color: activeTab === tab ? '#667eea' : '#64748b',
                      fontWeight: activeTab === tab ? '600' : '500',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab === 'basic' && `📝 ${t('leadership.form.basic')}`}
                    {tab === 'contact' && `📞 ${t('leadership.form.contact')}`}
                    {tab === 'schedule' && `📅 ${t('leadership.form.schedule')}`}
                    {tab === 'other' && `⚙️ ${t('leadership.form.other')}`}
                  </button>
                ))}
              </div>

              {/* Form Content - Scrollable */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem',
                backgroundColor: '#ffffff'
              }}>
                {activeTab === 'basic' && (
                  <div>
                    {/* Role Selection */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.roleLabel')} *
                      </label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {roleOptions.map(role => (
                          <label key={role.value} style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            border: formData.role === role.value ? '2px solid #667eea' : '2px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            backgroundColor: formData.role === role.value ? '#f0f9ff' : 'white',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={formData.role === role.value}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                role: e.target.value,
                                departmentId: e.target.value === 'leadership' ? '' : prev.departmentId
                              }))}
                              style={{ width: '1.25rem', height: '1.25rem' }}
                            />
                            <span style={{ fontSize: '1.5rem' }}>{role.icon}</span>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>
                              {role.label[currentLang]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.imageLabel')} *
                      </label>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {formData.img && (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={formData.img}
                              alt="Preview"
                              style={{
                                width: '10rem',
                                height: '10rem',
                                objectFit: 'cover',
                                borderRadius: '0.75rem',
                                border: '2px solid #e2e8f0'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                              style={{
                                position: 'absolute',
                                top: '-0.5rem',
                                right: '-0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '2rem',
                                height: '2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        <label style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '10rem',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: '#f8fafc'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                        >
                          <Upload style={{ color: '#94a3b8', marginBottom: '0.75rem' }} size={40} />
                          <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '500' }}>
                            {t('leadership.form.imageUpload')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            {t('leadership.form.imageFormat')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                      {uploadProgress > 0 && (
                        <div style={{
                          marginTop: '1rem',
                          height: '0.5rem',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '9999px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            backgroundColor: '#667eea',
                            transition: 'width 0.3s',
                            width: `${uploadProgress}%`
                          }}></div>
                        </div>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.nameLabel')} *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {['uz', 'ru', 'en'].map(lang => (
                          <div key={lang}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              fontWeight: '600'
                            }}>
                              {lang}
                            </label>
                            <input
                              type="text"
                              value={formData.name[lang]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                name: { ...prev.name, [lang]: e.target.value }
                              }))}
                              placeholder={`${t('leadership.form.nameLabel')} (${lang.toUpperCase()})`}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Position Fields */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.positionLabel')} *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {['uz', 'ru', 'en'].map(lang => (
                          <div key={lang}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              fontWeight: '600'
                            }}>
                              {lang}
                            </label>
                            <input
                              type="text"
                              value={formData.position[lang]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                position: { ...prev.position, [lang]: e.target.value }
                              }))}
                              placeholder={`${t('leadership.form.positionLabel')} (${lang.toUpperCase()})`}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Academic Degree */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        <Award size={18} />
                        {t('leadership.form.academicDegreeLabel')}
                      </label>
                      <input
                        type="text"
                        value={formData.academicDegree}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicDegree: e.target.value }))}
                        placeholder={t('leadership.form.academicDegreePlaceholder')}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.95rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>

                    {/* Department (if employee) */}
                    {formData.role === 'employee' && (
                      <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '0.75rem'
                        }}>
                          {t('leadership.form.departmentLabel')} *
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                          required
                        >
                          <option value="">{t('leadership.form.selectDepartment')}</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>
                              {dept.title?.[currentLang]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Bio with ReactQuill */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.bioLabel')}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        {['uz', 'ru', 'en'].map(lang => (
                          <div key={lang}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              fontWeight: '600'
                            }}>
                              {lang}
                            </label>
                            <ReactQuill
                              theme="snow"
                              value={formData.bio[lang]}
                              onChange={(value) => setFormData(prev => ({
                                ...prev,
                                bio: { ...prev.bio, [lang]: value }
                              }))}
                              modules={modules}
                              formats={formats}
                              placeholder={`${t('leadership.form.bioLabel')} (${lang.toUpperCase()})`}
                              style={{
                                backgroundColor: 'white',
                                borderRadius: '0.5rem'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        <Mail size={18} />
                        {t('leadership.form.emailLabel')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@mail.com"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.95rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        <Phone size={18} />
                        {t('leadership.form.phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+998 XX XXX XX XX"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.95rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        <Phone size={18} />
                        {t('leadership.form.workPhoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={formData.workPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, workPhone: e.target.value }))}
                        placeholder="+998 XX XXX XX XX"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.95rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    backgroundColor: '#f8fafc'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '1.5rem',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Calendar size={20} />
                      {t('leadership.form.scheduleTitle')}
                    </h3>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '1rem'
                      }}>
                        {t('leadership.form.scheduleDays')}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {daysOptions.map(day => (
                          <label key={day.value} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            backgroundColor: formData.schedule.days.includes(day.value) ? '#f0f9ff' : 'white',
                            borderColor: formData.schedule.days.includes(day.value) ? '#667eea' : '#e2e8f0',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="checkbox"
                              checked={formData.schedule.days.includes(day.value)}
                              onChange={(e) => {
                                const days = e.target.checked
                                  ? [...formData.schedule.days, day.value]
                                  : formData.schedule.days.filter(d => d !== day.value);
                                setFormData(prev => ({
                                  ...prev,
                                  schedule: { ...prev.schedule, days }
                                }));
                              }}
                              style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '500' }}>{day.label[currentLang]}</span>
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#0f172a',
                            marginBottom: '0.75rem'
                          }}>
                            <Clock size={18} />
                            {t('leadership.form.startTime')}
                          </label>
                          <input
                            type="time"
                            value={formData.schedule.start}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, start: e.target.value }
                            }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              fontSize: '0.95rem',
                              backgroundColor: 'white',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#0f172a',
                            marginBottom: '0.75rem'
                          }}>
                            <Clock size={18} />
                            {t('leadership.form.endTime')}
                          </label>
                          <input
                            type="time"
                            value={formData.schedule.end}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, end: e.target.value }
                            }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              fontSize: '0.95rem',
                              backgroundColor: 'white',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'other' && (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '0.75rem'
                      }}>
                        {t('leadership.form.orderLabel')}
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.95rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        backgroundColor: formData.isActive ? '#f0fdf4' : '#fef2f2',
                        borderColor: formData.isActive ? '#10b981' : '#ef4444',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                        />
                        <div>
                          <span style={{
                            fontWeight: '600',
                            color: '#0f172a',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            {t('leadership.form.activeStatus')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {t('leadership.form.activeStatusDesc')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '2px solid #f1f5f9',
                backgroundColor: '#fafafa',
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1.5rem',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></div>
                      {t('leadership.form.saving')}
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {editingId ? t('leadership.form.save') : t('leadership.form.add')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '0.875rem 1.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                  }}
                >
                  <X size={20} />
                  {t('leadership.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-track {
          background: #f1f5f9;
          borderRadius: 10px;
        }

        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          borderRadius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        input:focus, select:focus, textarea:focus, .quill-editor:focus-within {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ql-container {
          font-size: 0.95rem;
          min-height: 150px;
        }

        .ql-editor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
};

export default LeadershipAdmin;