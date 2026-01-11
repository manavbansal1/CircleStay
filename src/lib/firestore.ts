import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    DocumentData
} from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

// User Profile Types
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    age?: number;
    location?: string;
    monthlyIncome?: number;
    bio?: string;
    occupation?: string;
    trustScore: number;
    idVerified: boolean;
    idVerificationDate?: Date;
    ratingsCount: number;
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
}

// Listing Types
export interface Listing {
    id: string;
    hostId: string;
    title: string;
    description: string;
    price: number;
    location: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    availableFrom: Date;
    type?: string;
    vouchCount: number;
    connectionType: 'Direct' | '2nd Degree' | '3rd Degree';
    createdAt: Date;
    updatedAt: Date;
}

// Review Types
export interface Review {
    id: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    type: 'tenant' | 'landlord';
    createdAt: Date;
}

// User Rating Types (for pool members)
export interface UserRating {
    id: string;
    raterId: string;
    ratedUserId: string;
    poolId?: string;
    billId?: string;
    rating: number; // 1-5
    comment?: string;
    category: 'payment' | 'reliability' | 'communication' | 'general';
    createdAt: Date;
}

// Notification Types
export interface Notification {
    id: string;
    recipientId: string;
    senderId: string;
    senderEmail?: string;
    type: 'viewing_request' | 'review' | 'message' | 'pool_invite' | 'bill_added' | 'payment_received' | 'pool_joined';
    listingId?: string;
    poolId?: string;
    billId?: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

// Viewing Request Types
export interface ViewingRequest {
    id: string;
    listingId: string;
    requesterId: string;
    hostId: string;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    createdAt: Date;
}

// User Profile Functions
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    const now = new Date();

    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    // Ensure email is stored in lowercase for case-insensitive searches
    if (cleanData.email) {
        cleanData.email = cleanData.email.toLowerCase();
    }

    await setDoc(userRef, {
        uid,
        trustScore: 50,
        idVerified: false,
        ratingsCount: 0,
        averageRating: 0,
        createdAt: now,
        updatedAt: now,
        ...cleanData
    });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as UserProfile;
    }

    return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    
    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(userRef, {
        ...cleanData,
        updatedAt: new Date()
    });
}

// Listing Functions
export async function createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) {
    const listingsRef = collection(db, 'listings');
    const newListingRef = doc(listingsRef);
    const now = new Date();

    await setDoc(newListingRef, {
        ...data,
        id: newListingRef.id,
        vouchCount: 0,
        createdAt: now,
        updatedAt: now
    });

    return newListingRef.id;
}

export async function getListing(id: string): Promise<Listing | null> {
    const listingRef = doc(db, 'listings', id);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
        const data = listingSnap.data();
        return {
            ...data,
            availableFrom: data.availableFrom?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as Listing;
    }

    return null;
}

export async function getAllListings(): Promise<Listing[]> {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            availableFrom: data.availableFrom?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as Listing;
    });
}

export async function updateListing(id: string, data: Partial<Listing>) {
    const listingRef = doc(db, 'listings', id);
    await updateDoc(listingRef, {
        ...data,
        updatedAt: new Date()
    });
}

export async function deleteListing(id: string) {
    const listingRef = doc(db, 'listings', id);
    await deleteDoc(listingRef);
}

export async function getUserListings(hostId: string): Promise<Listing[]> {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('hostId', '==', hostId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            availableFrom: data.availableFrom?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as Listing;
    });
}

// Review Functions
export async function createReview(data: Omit<Review, 'id' | 'createdAt'>) {
    const reviewsRef = collection(db, 'reviews');
    const newReviewRef = doc(reviewsRef);

    await setDoc(newReviewRef, {
        ...data,
        id: newReviewRef.id,
        createdAt: new Date()
    });

    return newReviewRef.id;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('revieweeId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Review;
    });
}

export async function getAverageRating(userId: string): Promise<number> {
    const reviews = await getUserReviews(userId);

    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}

// Notification Functions
export async function createNotification(data: Omit<Notification, 'id' | 'createdAt'>) {
    const notificationsRef = collection(db, 'notifications');
    const newNotificationRef = doc(notificationsRef);

    await setDoc(newNotificationRef, {
        ...data,
        id: newNotificationRef.id,
        read: false,
        createdAt: new Date()
    });

    return newNotificationRef.id;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('recipientId', '==', userId));
    const querySnapshot = await getDocs(q);

    const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Notification;
    });

    // Sort by createdAt in descending order (newest first)
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationAsRead(notificationId: string) {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        read: true
    });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('recipientId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    // Filter unread notifications in JavaScript to avoid composite index
    const unreadCount = querySnapshot.docs.filter(doc => doc.data().read === false).length;
    return unreadCount;
}

// Viewing Request Functions
export async function createViewingRequest(data: Omit<ViewingRequest, 'id' | 'createdAt'>) {
    const requestsRef = collection(db, 'viewingRequests');
    const newRequestRef = doc(requestsRef);

    await setDoc(newRequestRef, {
        ...data,
        id: newRequestRef.id,
        status: 'pending',
        createdAt: new Date()
    });

    return newRequestRef.id;
}

export async function getViewingRequest(requestId: string): Promise<ViewingRequest | null> {
    const requestRef = doc(db, 'viewingRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists()) {
        const data = requestSnap.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate()
        } as ViewingRequest;
    }

    return null;
}

export async function updateViewingRequestStatus(requestId: string, status: 'accepted' | 'declined') {
    const requestRef = doc(db, 'viewingRequests', requestId);
    await updateDoc(requestRef, {
        status
    });
}

// User Rating Functions
export async function addUserRating(data: {
    raterId: string;
    ratedUserId: string;
    rating: number;
    comment?: string;
    category: 'payment' | 'reliability' | 'communication' | 'general';
    poolId?: string;
    billId?: string;
}): Promise<string> {
    // Check if rating already exists for this bill (prevent duplicate ratings)
    if (data.billId) {
        const ratingsRef = collection(db, 'userRatings');
        const existingQuery = query(
            ratingsRef,
            where('raterId', '==', data.raterId),
            where('ratedUserId', '==', data.ratedUserId),
            where('billId', '==', data.billId)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
            throw new Error('You have already rated this user for this payment');
        }
    }

    const ratingsRef = collection(db, 'userRatings');
    const newRatingRef = doc(ratingsRef);

    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    await setDoc(newRatingRef, {
        ...cleanData,
        id: newRatingRef.id,
        createdAt: new Date()
    });

    // Update the rated user's trust score
    await updateUserTrustScore(data.ratedUserId);

    return newRatingRef.id;
}

export async function getUserRatings(userId: string): Promise<UserRating[]> {
    const ratingsRef = collection(db, 'userRatings');
    const q = query(ratingsRef, where('ratedUserId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate()
        } as UserRating;
    });
}

export async function updateUserTrustScore(userId: string): Promise<void> {
    const ratings = await getUserRatings(userId);
    const userProfile = await getUserProfile(userId);

    if (!userProfile) return;

    // Calculate average rating
    const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    // Base trust score calculation:
    // - Start with 50 base points
    // - ID verification: +20 points
    // - Average rating: (rating / 5) * 30 points (max 30 points)
    // - Number of ratings bonus: min(ratingsCount * 2, 20) (max 20 points)
    
    let trustScore = 50;

    // ID verification bonus
    if (userProfile.idVerified) {
        trustScore += 20;
    }

    // Rating score (0-30 points)
    trustScore += (averageRating / 5) * 30;

    // Activity bonus based on number of ratings (0-20 points)
    const activityBonus = Math.min(ratings.length * 2, 20);
    trustScore += activityBonus;

    // Round to nearest integer
    trustScore = Math.round(trustScore);

    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        trustScore,
        averageRating,
        ratingsCount: ratings.length,
        updatedAt: new Date()
    });
}

export async function verifyUserID(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        idVerified: true,
        idVerificationDate: new Date(),
        updatedAt: new Date()
    });

    // Recalculate trust score with ID verification bonus
    await updateUserTrustScore(userId);
}

export async function canRateUser(raterId: string, ratedUserId: string, billId?: string): Promise<boolean> {
    if (!billId) return true;

    const ratingsRef = collection(db, 'userRatings');
    const q = query(
        ratingsRef,
        where('raterId', '==', raterId),
        where('ratedUserId', '==', ratedUserId),
        where('billId', '==', billId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.empty;
}
