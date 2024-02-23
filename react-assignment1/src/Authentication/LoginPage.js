import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCheckCircle} from 'react-icons/fa';

// Styled components
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0px;
  color: #666;
  font-size: 12px;

`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 0px;
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

const ValidationIcon = styled.span`
  position: absolute;
  top: 70%;
  right: 10px;
  transform: translateY(-50%);
  color: ${props => props.isValid ? 'green' : 'red'};
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

const SuccessMessage = styled.div`
  color: green;
  margin-top: 5px;
  font-size: 12px;
`;

function LoginPage() {
    const [user, setUser] = useState({
      username: '',
      full_name: '',
      password: '',
      confirmPassword: '',
      email: '',
      phoneNum: '',
    });
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);


  
    const handleChange = (event) => {
      const { name, value } = event.target;
      setUser({
        ...user,
        [name]: value,
      });
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
            if (response.status === 201) {
              alert('User successfully registered!');
              setUser({
                username: '',
                full_name: '',
                password: '',
                confirmPassword: '',
                email: '',
                phoneNum: '',
              });
              setRegistrationSuccess(true);
            } else {
              alert('Failed to register user.');
            }
          } catch (error) {
            console.error('There was an error during the registration process:', error);
            alert('There was an error during the registration process.');
          }
        } else {
          alert("Please ensure all fields are filled out correctly before submitting.");
        }
    };

  return (
    <Container>
        <Title>Login Page</Title>
        <Form onSubmit={handleSubmit}>

            <InputGroup>
            <Label htmlFor="username">Username</Label>
            <Input
                type="text"
                name="username"
                id="username"
                value={user.username}
                onChange={handleChange}
                required />
            </InputGroup>
            <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
                type="password"
                name="password"
                id="password"
                value={user.password}
                onChange={handleChange}
                required />
            </InputGroup>
            {registrationSuccess && <SuccessMessage>User logged in successfully!</SuccessMessage>}
            {!isFormValid && <Button type="submit">Log in</Button>}
        </Form>
        </Container>
  );
}

export default LoginPage;