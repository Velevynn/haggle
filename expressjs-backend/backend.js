const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const PORT = 6969;
const secretKey = 'YourSecretKey';

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: ''
};

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.query("CREATE DATABASE IF NOT EXISTS haggle_db");
    console.log("Database created or already exists.");

    await connection.query("USE haggle_db");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userID INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE, -- Ensure username is unique
        full_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL, -- Consider hashing passwords for security
        email VARCHAR(255) NOT NULL UNIQUE, -- Ensure email is unique and not null
        phoneNumber VARCHAR(20) NOT NULL UNIQUE, -- Ensure phoneNumber is unique and not null
        joinedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resetPasswordToken VARCHAR(255), -- Field for storing the password reset token
        resetPasswordExpires DATETIME -- Field for storing the expiration date of the token
      );
    `);
    console.log("Table 'users' created or already exists.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS listings (
        listingID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL, -- Link to users table
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        postDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expirationDate TIMESTAMP,
        bookmarkCount INT DEFAULT 0,
        quantity INT NOT NULL,
        FOREIGN KEY (userID) REFERENCES users(userID) -- Foreign key to reference users
      );
    `);
    console.log("Table 'listings' created or already exists.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transactionID INT AUTO_INCREMENT PRIMARY KEY,
        buyerID INT NOT NULL,
        sellerID INT NOT NULL,
        listingID INT NOT NULL,
        transactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (buyerID) REFERENCES users(userID),
        FOREIGN KEY (sellerID) REFERENCES users(userID),
        FOREIGN KEY (listingID) REFERENCES listings(listingID)
      );
    `);
    console.log("Table 'transactions' created or already exists.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS listingsDetails (
        detailsID INT AUTO_INCREMENT PRIMARY KEY,
        sellerID INT NOT NULL,
        listingID INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        isBookmarked BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sellerID) REFERENCES users(userID),
        FOREIGN KEY (listingID) REFERENCES listings(listingID)
      );
    `);
    console.log("Table 'listingsDetails' created or already exists.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        reviewID INT AUTO_INCREMENT PRIMARY KEY,
        reviewerID INT NOT NULL,
        revieweeID INT NOT NULL, -- Assuming reviews can be about sellers
        listingID INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        FOREIGN KEY (reviewerID) REFERENCES users(userID),
        FOREIGN KEY (revieweeID) REFERENCES users(userID),
        FOREIGN KEY (listingID) REFERENCES listings(listingID)
      );
    `);
    console.log("Table 'reviews' created or already exists.");

    await connection.end();
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

app.post('/users/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query("USE haggle_db");

    // Verify if email exists
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the resetToken and expiration time to the user's record in the database
    await connection.execute('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [resetToken, resetExpires, email]);

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: 'no-reply.haggle@outlook.com',
        pass: 'haggle1234!'
      }
    });
  
    const mailOptions = {
      from: 'no-reply.haggle@outlook.com', // Replace with your email
      to: email, // The user's email address
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetUrl}">Reset Password</a></p>`
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send forgot password email' });
      } else {
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Reset link sent to your email address' });
      }
    });

    
    res.json({ message: 'Reset link sent to your email address' });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    res.status(500).json({ error: 'Failed to send forgot password email' });
  }
});

app.post('/users/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query("USE haggle_db");

    // Verify token and its expiration
    const [users] = await connection.execute('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()', [token]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE userID = ?', [hashedPassword, users[0].userID]);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) return res.status(403).send({ message: "Token is required" });

  const token = bearerHeader.split(' ')[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

app.post('/users/check', async (req, res) => {
  const { username, email, phoneNum } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query("USE haggle_db");
    
    let conflict = null;

    // Check if username exists
    const [usernameResult] = await connection.execute(
      'SELECT 1 FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    if (usernameResult.length > 0) conflict = 'Username';

    // Check if email exists
    const [emailResult] = await connection.execute(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (emailResult.length > 0) conflict = 'Email';

    // Check if phone number exists
    const [phoneResult] = await connection.execute(
      'SELECT 1 FROM users WHERE phoneNumber = ? LIMIT 1',
      [phoneNum]
    );
    if (phoneResult.length > 0) conflict = 'Phone Number';

    if (conflict) {
      res.status(409).json({
        exists: true,
        message: `${conflict} already exists.`,
        conflict
      });
    } else {
      res.status(200).json({
        exists: false,
        message: 'No conflicts with username, email, or phone number.'
      });
    }
  } catch (error) {
    console.error('Error checking user details:', error);
    res.status(500).json({ error: 'Failed to check user details' });
  }
});


app.post('/users/register', async (req, res) => {
  const { username, full_name, password, email, phoneNum: phoneNumber } = req.body;
  
  // It appears bcrypt was intended to be used but not imported. Ensure bcrypt is imported.
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query("USE haggle_db");

    const [result] = await connection.execute(
      'INSERT INTO users (username, full_name, password, email, phoneNumber) VALUES (?, ?, ?, ?, ?)',
      [username, full_name, hashedPassword, email, phoneNumber]
    );

    const token = jwt.sign({ username: username }, secretKey, { expiresIn: '24h' });
    await connection.end();
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      // Handle duplicate entry error
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
});

app.post('/users/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log('Received login request with:', { identifier, password });

  if (typeof identifier !== 'string' || typeof password !== 'string') {
    console.log('Validation error: Identifier or password is not a string.');
    return res.status(400).json({ error: 'Identifier and password are required and must be strings.' });
  }

  try {
    console.log('Attempting to connect to DB...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to DB.');
    await connection.query("USE haggle_db");

    let query = 'SELECT * FROM users WHERE ';
    let queryParams = [];

    if (identifier.includes('@')) {
      query += 'email = ?';
      queryParams.push(identifier);
      console.log('Attempting to find user by email...');
    } else if (/\d/.test(identifier)) {
      query += 'phoneNumber = ?';
      queryParams.push(identifier);
      console.log('Attempting to find user by phone number...');
    } else {
      query += 'username = ?';
      queryParams.push(identifier);
      console.log('Attempting to find user by username...');
    }

    console.log(`Constructed query: ${query}`);
    console.log(`Query parameters:`, queryParams);

    const [users] = await connection.execute(query, queryParams);
    console.log('Query executed. Number of users found:', users.length);

    if (users.length > 0) {
      const user = users[0];
      console.log('User found:', user);
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password verification result:', validPassword);

      if (validPassword) {
        const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '24h' });
        console.log('JWT token generated:', token);
        await connection.end();
        console.log('Database connection closed.');
        res.status(200).json({ message: 'User logged in successfully', token });
      } else {
        console.log('Password verification failed.');
        res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      console.log('No user found matching the criteria.');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/users/profile', verifyToken, async (req, res) => {
  const username = req.user.username; // Extracted from token

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query("USE haggle_db");

    const [user] = await connection.execute(
      'SELECT username, full_name, email, phoneNumber FROM users WHERE username = ?',
      [username]
    );

    if (user.length > 0) {
      res.status(200).json(user[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

setupDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;