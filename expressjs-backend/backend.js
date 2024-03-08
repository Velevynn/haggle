const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('/Users/alexzaharia/Documents/csc308/haggle/config/sms-haggle-firebase-adminsdk-abnd1-4d16ab5917.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const PORT = 6969;
const secretKey = 'YourSecretKey';

app.use(cors());
app.use(express.json());


// OAuth2 Client Setup
const CLIENT_ID = '71122616560-7cmo4s6vqkii6m0dujcf1lhbqpl2pbkn.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04WwQjQJNXiaJCgYIARAAGAQSNwF-L9IrFFlckojRj8XLVxgwmE1-UfJZh8gBxvZYlzOqA0QkyKQ5VmpJPFjec9eTTMxdz8WvE7g';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(recipient, subject, body) {
  const gmail = google.gmail({version: 'v1', auth: oAuth2Client});

  const emailLines = [
    `Content-Type: text/plain; charset="UTF-8"\n`,
    `MIME-Version: 1.0\n`,
    `Content-Transfer-Encoding: 7bit\n`,
    `to: ${recipient}\n`,
    `from: "NO-REPLY" noreply.haggle@gmail.com\n`,
    `subject: ${subject}\n\n`,
    `${body}`
  ];

  const email = emailLines.join('');
  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

app.post('/users/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return res.status(404).json({ error: 'User not found' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetExpires = Date.now() + 3600000; // 1 hour from now

  snapshot.forEach(async doc => {
    await usersRef.doc(doc.id).update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
  });

  // Email sending logic remains the same
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  await sendEmail(email, 'Password Reset Request', `Reset link: ${resetUrl}`);
  res.json({ message: 'Reset link sent to your email address' });
});

// Modified to use Firebase
app.post('/users/reset-password', async (req, res) => {
  const { token, password } = req.body;

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('resetPasswordToken', '==', token).where('resetPasswordExpires', '>', Date.now()).get();

  if (snapshot.empty) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  snapshot.forEach(async doc => {
    await usersRef.doc(doc.id).update({
      password: hashedPassword,
      resetPasswordToken: admin.firestore.FieldValue.delete(),
      resetPasswordExpires: admin.firestore.FieldValue.delete()
    });
  });

  res.json({ message: 'Password has been reset successfully' });
});

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) return res.status(403).send({ message: "Authorization token is required" });

  const token = bearerHeader.split(' ')[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

async function collectionExists(collectionName) {
  const collections = await db.listCollections();
  return collections.some((col) => col.id === collectionName);
}

async function createUsersCollection() {
  const collectionName = 'users';
  if (!(await collectionExists(collectionName))) {
    try {
      await db.collection(collectionName).doc('sample').set({}); // Create a dummy document to force the creation of the collection
      console.log('Users collection created successfully!');
    } catch (error) {
      console.error('Error creating users collection:', error);
    }
  } else {
    console.log('Users collection already exists.');
  }
}

// Call the function to create the collection
createUsersCollection();

app.post('/users/register', async (req, res) => {
  const { email, password, username, fullName, phoneNumber } = req.body;

  try {
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      displayName: username,
      phoneNumber: phoneNumber,
    });

    const uid = userRecord.uid;

    console.log(uid);

    const joinedDate = admin.firestore.FieldValue.serverTimestamp();

    console.log(joinedDate);

    const userData = {
      username: username,
      fullName: fullName,
      email: email,
      phoneNumber: phoneNumber,
      joinedDate: joinedDate
    }
    // Create a new document in the "users" collection with the user's UID as the document ID
    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({ message: 'User successfully registered', uid: uid });
  } catch (error) {
    console.error('Error during the registration process:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/users/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    let usersRef = db.collection('users');
    let queryRef = identifier.includes('@') ? usersRef.where('email', '==', identifier) : usersRef.where('username', '==', identifier);
    const snapshot = await queryRef.get();

    if (snapshot.empty) {
      console.log('No matching user.');
      return res.status(404).json({ error: 'User not found' });
    }

    snapshot.forEach(doc => {
      const user = doc.data();
      bcrypt.compare(password, user.password).then(match => {
        if (match) {
          const token = jwt.sign({ uid: doc.id, email: user.email, username: user.username }, secretKey, { expiresIn: '24h' });
          res.status(200).json({ message: 'User logged in successfully', token });
        } else {
          res.status(401).json({ error: 'Invalid password' });
        }
      });
    });
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/users/profile', verifyToken, async (req, res) => {
  // Since the token verification middleware sets 'req.user',
  // you can access 'uid' directly from 'req.user.uid' assuming that's what you included in the JWT token.
  const uid = req.user.uid;

  try {
    // Fetch the user document from Firestore using the uid.
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally, you can limit what user information to send back for privacy/security reasons.
    const userProfile = userDoc.data();
    // Remove sensitive information from the profile data before sending it back.
    delete userProfile.password; // Assuming you don't store passwords in Firestore as you should use Firebase Auth for managing passwords.

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;