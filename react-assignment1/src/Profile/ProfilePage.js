import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaEdit, FaSave } from 'react-icons/fa';
import profileImagePlaceholder from '../assets/profile-placeholder.png';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  margin-top: 50px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin: 20px auto;
  display: block;
`;

const ProfileField = styled.div`
  margin: 10px 0;
`;

const ProfileLabel = styled.span`
  font-weight: bold;
`;

const ProfileValue = styled.span`
  margin-left: 10px;
`;

const EditButton = styled.button`
  padding: 8px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #003d82;
  }
`;

function ProfilePage() {
  const [userProfile, setUserProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    bio: '',
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:6969/users/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    try {
      const response = await axios.put('http://localhost:6969/users/profile', userProfile, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        alert('Profile successfully updated!');
        setEditMode(false);
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('There was an error updating the profile:', error);
    }
  };

  return (
    <Container>
      <ProfileImage src={profileImagePlaceholder} alt="Profile" />
      {editMode ? (
        <form onSubmit={(e) => { e.preventDefault(); saveChanges(); }}>
          {Object.keys(userProfile).map((key) => (
            <ProfileField key={key}>
              <ProfileLabel>{key.replace('_', ' ')}:</ProfileLabel>
              <input
                type="text"
                name={key}
                value={userProfile[key]}
                onChange={handleInputChange}
              />
            </ProfileField>
          ))}
          <EditButton type="submit"><FaSave /> Save Changes</EditButton>
        </form>
      ) : (
        <>
          {Object.entries(userProfile).map(([key, value]) => (
            <ProfileField key={key}>
              <ProfileLabel>{key.replace('_', ' ')}:</ProfileLabel>
              <ProfileValue>{value}</ProfileValue>
            </ProfileField>
          ))}
          <EditButton onClick={toggleEditMode}><FaEdit /> Edit Profile</EditButton>
        </>
      )}
    </Container>
  );
}

export default ProfilePage;