import React, { useState } from 'react';
import axios from 'axios';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';


const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  margin-top: 35px;
  margin-bottom: 0px;
  padding: 20px;
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

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-start; // Adjusted justify-content
`;


const BackButton = styled.button`
  padding: 6px 12px;
  font-size: 14px;
  background-color: white;
  color: #999;
  margin: 0;
  margin-bottom: 60px;
  margin-right: 0px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  outline: none; /* Remove default outline style */

  &:hover {
    color: #138A3E;
    background-color: white;
    border: none;
  }

  &:focus {
    box-shadow: 0 0 0 2px #138A3E; /* Add a box shadow to indicate focus without shifting */
  }
`;

const Header = styled.h2`
  color: #666;
  font-size: 24px;
  text-align: center;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
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


function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const navigate = useNavigate();

  const hasContent = identifier.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isEmailValid) {
      try {
        await axios.post('http://localhost:6969/users/forgot-password', { email: identifier });
        alert('Please check your email or messages for the password reset link.');
        navigate('/login');
      } catch (error) {
        alert('Failed to send password reset link. Please try again.');
      }
    } else {
      alert('Please enter a valid email address.');
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setIdentifier(email);
    setIsEmailValid(validateEmail(email));
  };

  return (
    <Container>
      <HeaderContainer>
      <BackButton onClick={handleBack}>&#8592; Back</BackButton>
      <Header>Forgot Password?</Header>
      </HeaderContainer>
      <Description>Please enter your email address and we will send you a link to reset your password.</Description>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="email"
            value={identifier}
            onChange={handleEmailChange}
            hasContent={identifier.length > 0}
            required />
          <InputLabel hasContent={hasContent}>Email</InputLabel>
        </InputGroup>
        <Button type="submit" disabled={!isEmailValid}>Send</Button>
      </Form>
    </Container>
  );
}

export default ForgotPasswordPage;