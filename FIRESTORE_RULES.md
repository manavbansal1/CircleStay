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
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.recipientId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.recipientId;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.recipientId;
    }
    
    // Viewing Requests collection
    match /viewingRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.requesterId || 
                        request.auth.uid == resource.data.hostId);
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.requesterId;
    }
    
    // Pools collection - for Commons/bill splitting
    match /pools/{poolId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid in resource.data.memberIds || 
                        request.auth.uid == resource.data.creatorId);
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.creatorId;
    }
    
    // Bills collection - for pool expenses
    match /bills/{billId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.paidById;
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

The first set of rules is recommended for production. It ensures:
- Requires authentication for all operations
- Users can only edit their own profiles
- Users can only edit/delete their own listings
- Reviews are immutable once created
- Pool members can read and update their pools
- Only pool creators can delete pools
- Bill creators can delete bills they added
- Notifications are only readable by recipients

