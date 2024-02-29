import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import logoImage from '../assets/haggle-horizontal.png';
import { Link, useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  margin-top: 100px;
  padding: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  margin-top: 8px;
  margin-bottom: 0px;
  color: #666;
  font-size: 12px;

`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 0px;
  padding: 0px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  padding-right: 30px; /* Make room for the checkmark */
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 12px;
`;

const Button = styled.button`
    padding: 8px;
    background-color: #0056b3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #003d82;
    }
`;

function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isFormValid, setIsFormValid] = useState(false); // Define isFormValid state
  const [errorMessage, setErrorMessage] = useState(''); // Use this if you want to display error messages
  const navigate = useNavigate(); // make sure to import useNavigate from 'react-router-dom'

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:6969/users/login', credentials);
      localStorage.setItem('token', response.data.token); // Store the token
      navigate('/profile'); // Navigate to profile page
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  useEffect(() => {
    const isValid = credentials.username.length > 0 && credentials.password.length > 0;
    setIsFormValid(isValid);
  }, [credentials]);

  return (
    <Container>
      <img src={logoImage} alt="Logo" style={{ display: 'block', margin: '0 auto 20px', maxWidth: '200px', height: 'auto' }} />
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="username">
              Username
          </Label> {/* or Email */}
          <Input
            type="text"
            name="username"
            id="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">
              Password
          </Label>
          <Input
            type="password"
            name="password"
            id="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </InputGroup>
        <Label>
              Don't have an account? {}
              <Link to="/signup" style={{ display: 'inline', color: '#0056b3'}}>
                Sign up
              </Link>
            </Label>
        <Button type="submit" disabled={!isFormValid}>
            Log In
        </Button>
      </Form>
    </Container>
  );
}

export default LoginPage;