const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token from cookies
 */
async function verifyAuth(req, res, next) {
    try {
        // Get token from cookie
        const idToken = req.cookies.authToken;

        if (!idToken) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };

        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
}

/**
 * Optional auth - doesn't fail if no token, just adds user if present
 */
async function optionalAuth(req, res, next) {
    try {
        const idToken = req.cookies.authToken;

        if (idToken) {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified
            };
        }

        next();
    } catch (error) {
        // Continue without user
        next();
    }
}

module.exports = { verifyAuth, optionalAuth };
