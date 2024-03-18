import React, { useState, useEffect } from 'react';
import axios from 'axios';
import profileImagePlaceholder from '../assets/profile-placeholder.png';
import { useNavigate } from 'react-router-dom';
import { Container, Button, ButtonContainer, ProfileImage, ProfileField, ProfileLabel, ProfileValue} from '../Authentication/AuthenticationStyling';

function ProfilePage() {
  const [userProfile, setUserProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    phoneNumber: '',
  });

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    navigate('/login'); // Navigate to the login page
  };

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if there's no token
      return;
    }

    try {
      // Send delete request to your backend
      await axios.delete(`http://localhost:6969/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      localStorage.removeItem('token'); // Remove the token from localStorage
      navigate('/login'); // Navigate to the login page after successful deletion
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirect to login if there's no token
        return;
      }

      try {
        const response = await axios.get(`http://localhost:6969/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  return (
    <Container>
      <ProfileImage src={profileImagePlaceholder} alt="Profile" />
      <form>
        {Object.entries(userProfile).map(([key, value]) => (
          <ProfileField key={key}>
            <ProfileLabel>{key.replace('_', ' ')}:</ProfileLabel>
            <ProfileValue>{value}</ProfileValue>
          </ProfileField>
        ))}
      </form>
      <ButtonContainer>
        <Button onClick={handleChangePassword}>Change Password</Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
        <Button onClick={handleDeleteProfile}>Delete Profile</Button>
      </ButtonContainer>
    </Container>
  );
}

export default ProfilePage;