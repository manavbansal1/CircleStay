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

// Notification Types
export interface Notification {
    id: string;
    recipientId: string;
    senderId: string;
    type: 'viewing_request' | 'review' | 'message' | 'pool_invite' | 'bill_added' | 'payment_received';
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

    await setDoc(userRef, {
        uid,
        trustScore: 50,
        createdAt: now,
        updatedAt: now,
        ...data
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
    await updateDoc(userRef, {
        ...data,
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
    const q = query(notificationsRef, where('recipientId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Notification;
    });
}

export async function markNotificationAsRead(notificationId: string) {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        read: true
    });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('recipientId', '==', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
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
