const express = require('express');
const { admin } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Email and password are required'
            });
        }

        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: displayName || email.split('@')[0]
        });

        // Create custom token for immediate login
        const customToken = await admin.auth().createCustomToken(userRecord.uid);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName
            },
            customToken
        });
    } catch (error) {
        console.error('Signup error:', error);

        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                error: 'Email already exists',
                message: 'This email is already registered'
            });
        }

        res.status(500).json({
            error: 'Signup failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Set authentication cookie from ID token
 */
router.post('/login', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'ID token is required'
            });
        }

        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Set cookie with 7 days expiration
        const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

        res.cookie('authToken', idToken, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            error: 'Login failed',
            message: 'Invalid credentials'
        });
    }
});

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', verifyAuth, async (req, res) => {
    try {
        // Get full user details from Firebase
        const userRecord = await admin.auth().getUser(req.user.uid);

        res.json({
            success: true,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                photoURL: userRecord.photoURL,
                createdAt: userRecord.metadata.creationTime
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});

module.exports = router;
