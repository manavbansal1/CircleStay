import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        // Query users by email
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('email', '==', email.toLowerCase().trim()),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        return NextResponse.json({
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName
        });
    } catch (error) {
        console.error('Error searching for user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
