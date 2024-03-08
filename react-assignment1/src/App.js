import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './Authentication/SignUpPage';
import LoginPage from './Authentication/LoginPage';
import ForgotPasswordPage from './Authentication/ForgotPasswordPage';
import ResetPasswordPage from './Authentication/ResetPasswordPage';
import ProfilePage from './Profile/ProfilePage.js';

function App() {
  return (
    <BrowserRouter basename="">
      <div className="App">
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/*" element={<SignUpPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;