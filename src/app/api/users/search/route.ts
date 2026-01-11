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

        const normalizedEmail = email.toLowerCase().trim();

        // Query users by email (case-insensitive)
        // First try exact match with lowercase
        const usersRef = collection(db, 'users');
        let q = query(
            usersRef,
            where('email', '==', normalizedEmail),
            limit(1)
        );

        let querySnapshot = await getDocs(q);

        // If not found, try fetching all users and do case-insensitive search
        // This is less efficient but handles cases where email wasn't stored in lowercase
        if (querySnapshot.empty) {
            console.log(`No exact match for ${normalizedEmail}, trying case-insensitive search...`);
            
            const allUsersQuery = query(usersRef);
            const allUsersSnapshot = await getDocs(allUsersQuery);
            
            let foundUser = null;
            allUsersSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email && data.email.toLowerCase() === normalizedEmail) {
                    foundUser = data;
                }
            });

            if (!foundUser) {
                console.log(`No user found with email: ${normalizedEmail}`);
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            console.log(`Found user via case-insensitive search:`, {
                uid: foundUser.uid,
                email: foundUser.email
            });

            return NextResponse.json({
                uid: foundUser.uid,
                email: foundUser.email,
                displayName: foundUser.displayName
            });
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        console.log(`Found user with email ${normalizedEmail}:`, {
            uid: userData.uid,
            email: userData.email
        });

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
