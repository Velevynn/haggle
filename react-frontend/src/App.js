import React, { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import SignUpPage from './Authentication/SignUpPage';
import Marketplace from './pages/Marketplace';
import AddListing from './pages/AddListing'
import NavBar from './components/NavBar';
import About from './pages/About';

function App() {


  return (
    <div className="container"> 
      <BrowserRouter basename="/">
        <NavBar />
        <Routes>
          <Route
            path="/sign-up"
            element={<SignUpPage />}
          />
          <Route 
            path = "/about"
            element={<About />}
          />
          <Route 
            path = "/"
            element = {<Marketplace />}
          />
          <Route 
            path = "/marketplace"
            element = {<Marketplace />}
          />
          <Route 
            path = "/new-listing"
            element = {<AddListing />}
          />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;