import React, { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import SignUpPage from './Authentication/SignUpPage';
import Marketplace from './pages/Marketplace';
import NavBar from './components/NavBar';
import Form from "./Form";
import Table from "./Table";
import axios from "axios";

function App() {
  const [listings, setListings] = useState([]);


  function updateList(listing) {
    makePostCall(listing).then((result) => {
      //if (result && result.status === 201)
      // Change listing to result of post call once database is set up
      setListings([...listings, listing]);
      console.log(result);
    });
  }

  function removeOneListing(index) {
    const listing = listings[index].id;

    const updated = listings.filter((listing, i) => {
      return i !== index;
    });
    setListings(updated);

    /*
    makeDeleteCall(listing).then((result) => {
      if (result.status === 204) {
        const updated = listings.filter((listing, i) => {
          return i !== index;
        });
        setListings(updated);
      }
    }); */
  }

  async function makeDeleteCall(id) {
    try {
      const response = await axios.delete(
        `http://localhost:8000/users/${id}`
      );
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function makePostCall(person) {
    try {
      const response = await axios.post(
        `http://localhost:8000/users`,
        person
      );
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return (
    <div className="container"> 
      <BrowserRouter basename="/">
        <NavBar />
        <Routes>
          <Route 
            path="/listings" 
            element={<Table
              characterData={listings}
              removeCharacter={removeOneListing}
            />}
          />
          <Route
            path="/SignUpPage"
            element={<SignUpPage />}
          />
          <Route path="/form" element={<Form 
          handleSubmit = {updateList} 
          />} />
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