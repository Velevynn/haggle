import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { css } from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash  } from 'react-icons/fa';
import logoImage from '../assets/haggle-horizontal.png';
import { Link, useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  margin-top: 70px;
  padding: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const LoginContainer = styled.div`
  max-width: 400px;
  min-height: 60px;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const HeaderLabel = styled.label`
  color: #666;
  font-size: 17px;
  text-align: center;
`;

const LinkedLabel = styled.label`
  color: #666;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
`;

const LoginLabel = styled.label`
  color: #666;
  font-size: 14px;
  text-align: center;
  margin: 25px;
  font-weight: normal;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 2px;
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
  padding-top: 14px;
  padding-bottom: 6px;
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

const ValidationIcon = styled.span`
  position: absolute;
  top: 65%;
  right: 10px;
  transform: translateY(-85%);
  color: ${props => props.isValid ? '#138A3E' : 'red'};
`;

const Button = styled.button`
  padding: 8px;
  background-color: #16A44A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;

  &:hover {
      background-color: #138A3E;
      border-color: #16A44A;
  }

  &:disabled {
    background-color: #8CCBA1;
    cursor: not-allowed;
    border-color: transparent;
  }
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 5px;
  font-size: 12px;
`;

const PasswordRules = styled.div`
  background-color: #f7f7f7;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  position: absolute;
  right: -350px;
  top: 0px;
  width: 300px;
`;

const VisibilityToggle = styled.span`
  position: absolute;
  top: 20%;
  right: 10px;
  color: #666;
  cursor: pointer;
`;


function SignUpPage() {
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    password: '',
    email: '',
    phoneNum: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validate each input field
  const isInputValid = (name, value) => {
    const passwordRules = {
      minLength: value.length >= 8,
      containsNumber: /[0-9]/.test(value),
      containsSpecialChar: /[\W_]/.test(value),
    };

    const phoneNumRules = {
      minLength: value.length == 10,
      maxLength: value.length == 10,
      containsNumber: /[0-9]/.test(value),
    };


    switch (name) {
      case 'username':
        return value.length >= 3 && value.length <= 25;
      case 'full_name':
        return value.length > 0 && value.length <= 40;
      case 'password':
        return Object.values(passwordRules).every(valid => valid);
      case 'email':
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      case 'phoneNum':
        return Object.values(phoneNumRules).every(valid => valid);
      default:
        return false;
    }
  };

  useEffect(() => {
    const isValid = Object.keys(user).every((key) =>
      isInputValid(key, user[key])
    );
    setIsFormValid(isValid);
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormValid) {
      try {
        const response = await axios.post('http://localhost:6969/users/register', user, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        navigate('/profile');
      } catch (error) {
        console.error('There was an error during the registration process:', error);
        alert(error.response.data.error || 'There was an error during the registration process.');
      }
    } else {
      alert("Please ensure all fields are filled out correctly before submitting.");
    }
  };

  return (
    <>
    <Container>
        <img src={logoImage} alt="Haggle Logo" style={{ display: 'block', margin: '0 auto 0px', maxWidth: '200px', height: 'auto' }} />        <Form onSubmit={handleSubmit}>

          <HeaderLabel>
            Join our community of Cal Poly students to buy, sell, and trade.
          </HeaderLabel>

          <InputGroup style={{ marginTop: '20px' }}>
              <Input
                type="email"
                name="email"
                id="email"
                value={user.email}
                maxLength = "50"
                onChange={handleChange}
                hasContent={user.email.length > 0}
                required />
              <InputLabel htmlFor="email" hasContent={user.email.length > 0}>Email</InputLabel>
              <ValidationIcon isValid={isInputValid('email', user.email)}>
                {user.email.length > 0 ? (isInputValid('email', user.email) ? <FaCheckCircle /> : <FaTimesCircle />) : null}
              </ValidationIcon>
            </InputGroup>

            <InputGroup>
                <Input
                    type="tel"
                    name="phoneNum"
                    id="phoneNum"
                    value={user.phoneNum}
                    maxLength = "10"
                    onChange={handleChange}
                    hasContent={user.phoneNum.length > 0}
                    required />
                <InputLabel htmlFor="phoneNum" hasContent={user.phoneNum.length > 0}>Mobile Number</InputLabel>
                <ValidationIcon isValid={isInputValid('phoneNum', user.phoneNum)}>
                    {user.phoneNum.length > 0 ? (isInputValid('phoneNum', user.phoneNum) ? <FaCheckCircle /> : <FaTimesCircle />) : null}
                </ValidationIcon>
            </InputGroup>

            <InputGroup>
                <Input
                    type="text"
                    name="username"
                    id="username"
                    value={user.username}
                    maxLength = "25"
                    onChange={handleChange}
                    required />
                <InputLabel htmlFor="username" hasContent={user.username.length > 0}>Username</InputLabel>
                <ValidationIcon isValid={isInputValid('username', user.username)}>
                    {user.username.length > 0 ? (isInputValid('username', user.username) ? <FaCheckCircle /> : <FaTimesCircle />) : null}
                </ValidationIcon>
            </InputGroup>

            <InputGroup>
                <Input
                    type="text"
                    name="full_name"
                    id="full_name"
                    maxLength = "40"
                    value={user.full_name}
                    onChange={handleChange}
                    required />
                <InputLabel htmlFor="full_name" hasContent={user.full_name.length > 0}>Full Name</InputLabel>
                <ValidationIcon isValid={isInputValid('full_name', user.full_name)}>
                    {user.full_name.length > 0 ? (isInputValid('full_name', user.full_name) ? <FaCheckCircle /> : <FaTimesCircle />) : null}
                </ValidationIcon>
            </InputGroup>

            <InputGroup>
              <Input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                minLength = "8"
                value={user.password}
                onChange={handleChange}
                required />
              <InputLabel htmlFor="password" hasContent={user.password.length > 0}>Password</InputLabel>
              <PasswordRules>
                <div style={{ color: user.password.length >= 8 &&  user.password.length <= 20? 'green' : 'red' }}>At least 8 characters.</div>
                <div style={{ color: /[0-9]/.test(user.password) ? 'green' : 'red' }}>At least one number.</div>
                <div style={{ color: /[\W_]/.test(user.password) ? 'green' : 'red' }}>At least one special character.</div>
              </PasswordRules>
              <VisibilityToggle onClick={togglePasswordVisibility}>
                {passwordVisible ? <FaEye /> : <FaEyeSlash />}
              </VisibilityToggle>
            </InputGroup>
            
            <LinkedLabel>
            By signing up you agree to our {}
              <Link to="/login" style={{ display: 'inline', color: '#0056b3'}}>
                Terms
              </Link>
            , {}
              <Link to="/login" style={{ display: 'inline', color: '#0056b3'}}>
                Privacy Policy
              </Link>
            {} and {}

            <Link to="/login" style={{ display: 'inline', color: '#0056b3'}}>
                Cookies Policy
            </Link>

          </LinkedLabel>

            {registrationSuccess && <SuccessMessage>
                User signed up successfully!
            </SuccessMessage>}
            <Button type="submit" disabled={!isFormValid}>
                Sign Up
            </Button>
        </Form>

        </Container>
        <LoginContainer>
          <LoginLabel>
            Already have an account? {}
            <Link to="/login" style={{ display: 'inline', color: '#0056b3'}}>
              Log in
            </Link>
          </LoginLabel>
      </LoginContainer>
      </>
  );
}

export default SignUpPage;