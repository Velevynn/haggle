import React, { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import SignUpPage from './Authentication/SignUpPage';
import Marketplace from './pages/Marketplace';
import NavBar from './components/NavBar';
import axios from "axios";

function App() {


  return (
    <div className="container"> 
      <BrowserRouter basename="/">
        <NavBar />
        <Routes>
          <Route
            path="/SignUpPage"
            element={<SignUpPage />}
          />
          <Route 
            path = "/marketplace"
            element = {<Marketplace />}
          />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;