# Firestore Security Rules Setup

You're getting a "Missing or insufficient permissions" error because Firestore security rules need to be configured.

## Quick Fix (Development/Testing)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **circlestay-6d30a**
3. Navigate to **Firestore Database** → **Rules**
4. Replace the rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings collection - authenticated users can read all, write their own
    match /listings/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.hostId;
    }
    
    // Reviews collection - authenticated users can read all, create reviews
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.reviewerId;
      allow update, delete: if false; // Reviews cannot be edited or deleted
    }
  }
}
```

5. Click **Publish**

## Alternative: Test Mode (Less Secure - Only for Development)

If you want to quickly test without authentication checks:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 10);
    }
  }
}
```

**WARNING**: This allows anyone to read/write for 30 days. Only use for testing!

## Production Rules (Recommended)

For production, use the first set of rules which:
- Requires authentication for all operations
- Users can only edit their own profiles
- Users can only edit/delete their own listings
- Reviews are immutable once created
