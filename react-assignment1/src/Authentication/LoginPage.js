import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { css } from 'styled-components';
import logoImage from '../assets/haggle-horizontal.png';
import { FaEye, FaEyeSlash  } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Styled components
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  margin-top: 35px;
  margin-bottom: 15px;
  padding: 40px;
  padding-bottom: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 0px;
`;

const InputLabel = styled.label`
  position: absolute;
  top: -15%;
  left: 4%;
  font-size: 14px;
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
  font-weight: normal;

  ${props => props.hasContent && css`
    transform: translate(0%, -45%);
    font-size: 10px;
    font-weight: normal;
    color: #999;
  `}
`;

const Input = styled.input`
  position: absolute
  width: 100%;
  padding-top: ${(props) => (props.hasContent ? "20px" : "12px")};
  padding-bottom: ${(props) => (props.hasContent ? "8px" : "8px")}
  line-height: ${props => props.hasContent ? "24px" : "18px"};
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 12px;
  transition: border 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: #007b00;
    box-shadow: 0 0 8px rgba(0, 183, 0, 0.8);
  }
`;

const VisibilityToggle = styled.span`
  position: absolute;
  top: 20%;
  right: 10px;
  color: #666;
  cursor: pointer;
`;

const ForgotPasswordLabel= styled.label`
color: #666;
font-size: 12px;
text-align: center;
margin-top: 20px;
margin-bottom: 10px;
font-weight: normal;
`;

const LinkedLabel = styled.label`
  color: #666;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
  font-weight: normal
`;

const Button = styled.button`
  padding: 8px;
  background-color: #16A44A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s, box-shadow 0.3s; // Added box-shadow to the transition for a smooth effect

  &:hover {
    background-color: #138A3E; // Darker green on hover
    border-color: #138A3E;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2); // Subtle shadow for depth, adjust as needed
  }

  &:focus,
  &:active {
    background-color: #16A44A; // Keep the original green color
    outline: none; // Removes the default focus outline
    border-color: #16A44A; // Ensures the border color stays consistent
    box-shadow: 0 0 0 2px rgba(22, 164, 74, 0.5); // Optional: Adds a custom focus glow
  }

  &:disabled {
    background-color: #8CCBA1;
    cursor: not-allowed;
    border-color: transparent;
  }
`;

const SignUpContainer = styled.div`
  max-width: 400px;
  min-height: 60px;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const SignUpLabel = styled.label`
  color: #666;
  font-size: 14px;
  text-align: center;
  margin: 25px;
  font-weight: normal;
`;

function LoginPage() {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [isFormValid, setIsFormValid] = useState(false); // Define isFormValid state
  const [errorMessage, setErrorMessage] = useState(''); // Use this if you want to display error messages
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate(); // make sure to import useNavigate from 'react-router-dom'

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.identifier, credentials.password);
      console.log('Logged in user:', userCredential.user);
      navigate('/profile');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    const isValid = credentials.identifier.length > 0 && credentials.password.length > 0;
    setIsFormValid(isValid);
  }, [credentials]);

  return (
    <>
      <Container>
        <img src={logoImage} alt="Logo" style={{ display: 'block', margin: '0 auto 20px', maxWidth: '200px', height: 'auto' }} />
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              name="identifier"
              id="identifier"
              value={credentials.identifier}
              onChange={handleChange}
              hasContent={credentials.identifier.length > 0}
              required/>
            <InputLabel htmlFor="identifier" hasContent={credentials.identifier.length > 0}>Email, Phone, or Username</InputLabel>
          </InputGroup>

          <InputGroup>
            <Input
              type={passwordVisible ? "text" : "password"}
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              hasContent={credentials.password.length > 0}
              required/>
            <InputLabel htmlFor="password" hasContent={credentials.password.length > 0}>Password</InputLabel>
            <VisibilityToggle onClick={togglePasswordVisibility}>
                {passwordVisible ? <FaEye /> : <FaEyeSlash />}
              </VisibilityToggle>
          </InputGroup>

          <Button type="submit" disabled={!isFormValid}>
              Log in
          </Button>

          <LinkedLabel>
              By logging in you agree to our {}
                <Link to="/terms-of-service" style={{ display: 'inline', color: '#0056b3', fontWeight: 'bold'}}>
                  Terms of Service
                </Link>
              {} and acknowledge our {}
                <Link to="/privacy-policy" style={{ display: 'inline', color: '#0056b3', fontWeight: 'bold'}}>
                  Privacy Policy
                </Link>
            </LinkedLabel>

            <ForgotPasswordLabel>
            <Link to="/forgot-password" style={{ display: 'inline', color: '#0056b3'}}>
              Forgot password?
            </Link>
          </ForgotPasswordLabel>
        </Form>
      </Container>

      <SignUpContainer>
        <SignUpLabel>
          Don't have an account? {}
          <Link to="/signup" style={{ display: 'inline', color: '#0056b3', fontWeight: 'bold'}}>
            Sign up
          </Link>
        </SignUpLabel>
      </SignUpContainer>
    </>
  );
}

export default LoginPage;