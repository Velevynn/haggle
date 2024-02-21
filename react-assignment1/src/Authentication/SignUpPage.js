import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';

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

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 10px;
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

function SignupForm() {
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNum: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'phoneNum') {
      const numbers = value.replace(/\D/g, '');
      const formattedNumber = numbers.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      setUser({
        ...user,
        [name]: formattedNumber,
      });
    } else {
      setUser({
        ...user,
        [name]: value,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/users/register', user);
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
      } else {
        alert('Failed to register user.');
      }
    } catch (error) {
      console.error('There was an error during the registration process:', error);
    }
  }

  return (
    <Container>
      <Title>Signup Page</Title>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="text"
            name="email"
            id="email"
            value={user.email}
            onChange={handleChange}
            maxLength = "35"
            required />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="phoneNum">Phone Number</Label>
          <Input
            type="tel"
            name="phoneNum"
            id="phoneNum"
            value={user.phoneNum}
            onChange={handleChange}
            maxLength = "10"
            required />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            name="username"
            id="username"
            value={user.username}
            onChange={handleChange}
            minLength = "3"
            maxLength = "25"
            required />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            type="text"
            name="full_name"
            id="full_name"
            value={user.full_name}
            onChange={handleChange}
            maxLength = "40"
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
            minLength = "8"
            maxLength = "20"
            required />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={user.password}
            onChange={handleChange}
            minLength = "8"
            maxLength = "20"
            required />
        </InputGroup>
        <Button type="submit">Register</Button>
      </Form>
    </Container>
  );
}

export default SignupForm;