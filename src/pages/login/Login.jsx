// src/pages/login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './style.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('global'); // Destructured useTranslation
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const handleLogin = async (e) => {
    e.preventDefault();
  
    // try {
    //   const response = await fetch('http://localhost:5000/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ login, password }),
    //   });
  
    //   // Check if the response content type is JSON
    //   const contentType = response.headers.get('Content-Type');
    //   const isJson = contentType && contentType.includes('application/json');
  
    //   // Parse JSON only if content type is JSON
    //   const result = isJson ? await response.json() : null;
  
    //   if (response.ok) {
    //     toast.success(t('loginSuccess')); // Use translation for success message
    //     localStorage.setItem('authToken', result?.token); // Save token
    //     navigate('/'); // Redirect to dashboard
    //   } else {
    //     const errorMessage = result?.message || t('loginFailed');
    //     toast.error(errorMessage); // Display error message
    //   }
    // } catch (error) {
    //   toast.error(error.message || t('somethingWrong')); // Handle network or other errors
    // }

 if(!login){
    return toast.error(`Login!!`)
 }
 if(!password){
    return toast.error(`Password!!`)
 }
    try{
     const { data } = await axios.post(`${BACKEND_URL}/api/admin/login`, {
       login,
       password
     })
     console.log(data);
     
     if(data.success){
        console.log(data.data);
        console.log('saloim');
        
         toast.success(data.message)
         localStorage.setItem('adminData', {...data.token, data :data.data})
         navigate('/')
     }else{
      throw new Error(toast.error(data.message))
     }
    }catch(error){
        toast.error(error.message)
    }
  };
  

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className='login-page'>
    <div className="login-container">
      <div className="language-switcher">
        <button onClick={() => changeLanguage('en')}>EN</button>
        <button onClick={() => changeLanguage('uz')}>UZ</button>
        <button onClick={() => changeLanguage('ru')}>RU</button>
      </div>

      <div className="login-form">
        <h2>{t('welcomeBack')}</h2>
        <p>{t('pleaseLog')}</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('login')}</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder={t('enterLogin')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enterPassword')}
              required
            />
          </div>
          <button type="submit" className="login-button">
            {t('login')}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
