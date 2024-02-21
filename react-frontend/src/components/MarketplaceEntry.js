import React from "react";
import './marketplace-entry.css';
import missing from '../resources/missing.jpg';


function Entry({title, description, price }) {
  return (
    <div className="entry-container">
      <div className="image-container">
        <img src={missing} alt="Entry Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div className="text-container">
        <h2 style={{ fontSize: '25px', fontWeight: 600, margin: '10px 0' }}>{title}</h2>
        <p style={{ color: 'green', fontWeight: 'bold', margin: 0 }}>${price}</p>
      </div>
    </div>
  );
}

export default Entry;