import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';



export default App;
