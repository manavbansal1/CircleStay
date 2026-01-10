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
    arrayUnion,
    arrayRemove,
    increment,
    Timestamp
} from 'firebase/firestore';
import { app } from './firebase';
import { createNotification } from './firestore';

const db = getFirestore(app);

// Pool Types
export interface Pool {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    memberIds: string[];
    pendingInvites: string[];
    category?: string;
    icon?: string;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

// Bill Types
export interface Bill {
    id: string;
    poolId: string;
    description: string;
    totalAmount: number;
    paidById: string;
    splitType: 'equal' | 'custom';
    splits: BillSplit[];
    category?: string;
    date: Date;
    receiptUrl?: string;
    createdAt: Date;
}

export interface BillSplit {
    userId: string;
    amount: number;
    paid: boolean;
}

export interface Balance {
    userId: string;
    poolId: string;
    netBalance: number;
    owesTo: { userId: string; amount: number }[];
    owedBy: { userId: string; amount: number }[];
}

// Pool Functions

export async function createPool(data: {
    name: string;
    description?: string;
    creatorId: string;
    category?: string;
    icon?: string;
}): Promise<string> {
    const poolsRef = collection(db, 'pools');
    const newPoolRef = doc(poolsRef);
    const now = new Date();

    await setDoc(newPoolRef, {
        name: data.name,
        ...(data.description && { description: data.description }),
        creatorId: data.creatorId,
        ...(data.category && { category: data.category }),
        ...(data.icon && { icon: data.icon }),
        id: newPoolRef.id,
        memberIds: [data.creatorId],
        pendingInvites: [],
        status: 'active',
        createdAt: now,
        updatedAt: now
    });

    return newPoolRef.id;
}

export async function getPool(poolId: string): Promise<Pool | null> {
    const poolRef = doc(db, 'pools', poolId);
    const poolSnap = await getDoc(poolRef);

    if (poolSnap.exists()) {
        const data = poolSnap.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as Pool;
    }

    return null;
}

export async function getUserPools(userId: string): Promise<Pool[]> {
    const poolsRef = collection(db, 'pools');
    const q = query(
        poolsRef,
        where('memberIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as Pool;
    });
}

export async function inviteToPool(poolId: string, invitedUserIds: string[], inviterId: string): Promise<void> {
    const pool = await getPool(poolId);

    if (!pool) {
        throw new Error('Pool not found');
    }

    // Check if adding these users would exceed max members (10)
    const totalMembers = pool.memberIds.length + pool.pendingInvites.length + invitedUserIds.length;
    if (totalMembers > 10) {
        throw new Error('Pool cannot have more than 10 members');
    }

    const poolRef = doc(db, 'pools', poolId);

    // Add to pending invites
    await updateDoc(poolRef, {
        pendingInvites: arrayUnion(...invitedUserIds),
        updatedAt: new Date()
    });

    // Create notifications for each invited user
    for (const userId of invitedUserIds) {
        await createNotification({
            recipientId: userId,
            senderId: inviterId,
            type: 'pool_invite',
            poolId: poolId,
            message: `invited you to join the pool "${pool.name}"`,
            read: false
        });
    }
}

export async function acceptPoolInvite(poolId: string, userId: string): Promise<void> {
    const poolRef = doc(db, 'pools', poolId);

    await updateDoc(poolRef, {
        memberIds: arrayUnion(userId),
        pendingInvites: arrayRemove(userId),
        updatedAt: new Date()
    });
}

export async function rejectPoolInvite(poolId: string, userId: string): Promise<void> {
    const poolRef = doc(db, 'pools', poolId);

    await updateDoc(poolRef, {
        pendingInvites: arrayRemove(userId),
        updatedAt: new Date()
    });
}

export async function removeFromPool(poolId: string, userId: string): Promise<void> {
    const poolRef = doc(db, 'pools', poolId);

    await updateDoc(poolRef, {
        memberIds: arrayRemove(userId),
        updatedAt: new Date()
    });
}

export async function archivePool(poolId: string): Promise<void> {
    const poolRef = doc(db, 'pools', poolId);

    await updateDoc(poolRef, {
        status: 'archived',
        updatedAt: new Date()
    });
}

// Bill Functions

export async function addBill(data: {
    poolId: string;
    description: string;
    totalAmount: number;
    paidById: string;
    splitType: 'equal' | 'custom';
    splits?: BillSplit[];
    category?: string;
    date?: Date;
    receiptUrl?: string;
}): Promise<string> {
    const pool = await getPool(data.poolId);

    if (!pool) {
        throw new Error('Pool not found');
    }

    const billsRef = collection(db, 'bills');
    const newBillRef = doc(billsRef);
    const now = new Date();

    let splits: BillSplit[];

    if (data.splitType === 'equal') {
        // Split equally among all members
        const amountPerPerson = data.totalAmount / pool.memberIds.length;
        splits = pool.memberIds.map(userId => ({
            userId,
            amount: amountPerPerson,
            paid: userId === data.paidById
        }));
    } else {
        // Use custom splits
        splits = data.splits || [];
    }

    await setDoc(newBillRef, {
        id: newBillRef.id,
        poolId: data.poolId,
        description: data.description,
        totalAmount: data.totalAmount,
        paidById: data.paidById,
        splitType: data.splitType,
        splits,
        ...(data.category && { category: data.category }),
        date: data.date || now,
        ...(data.receiptUrl && { receiptUrl: data.receiptUrl }),
        createdAt: now
    });

    // Update pool's updatedAt
    const poolRef = doc(db, 'pools', data.poolId);
    await updateDoc(poolRef, {
        updatedAt: now
    });

    // Create notifications for all pool members except the person who added the bill
    for (const memberId of pool.memberIds) {
        if (memberId !== data.paidById) {
            await createNotification({
                recipientId: memberId,
                senderId: data.paidById,
                type: 'bill_added',
                poolId: data.poolId,
                billId: newBillRef.id,
                message: `added a bill "${data.description}" ($${data.totalAmount.toFixed(2)}) to ${pool.name}`,
                read: false
            });
        }
    }

    return newBillRef.id;
}

export async function getPoolBills(poolId: string): Promise<Bill[]> {
    const billsRef = collection(db, 'bills');
    const q = query(
        billsRef,
        where('poolId', '==', poolId),
        orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            date: data.date?.toDate(),
            createdAt: data.createdAt?.toDate()
        } as Bill;
    });
}

export async function getBill(billId: string): Promise<Bill | null> {
    const billRef = doc(db, 'bills', billId);
    const billSnap = await getDoc(billRef);

    if (billSnap.exists()) {
        const data = billSnap.data();
        return {
            ...data,
            date: data.date?.toDate(),
            createdAt: data.createdAt?.toDate()
        } as Bill;
    }

    return null;
}

export async function markBillPaid(billId: string, userId: string): Promise<void> {
    const bill = await getBill(billId);

    if (!bill) {
        throw new Error('Bill not found');
    }

    const updatedSplits = bill.splits.map(split => {
        if (split.userId === userId) {
            return { ...split, paid: true };
        }
        return split;
    });

    const billRef = doc(db, 'bills', billId);
    await updateDoc(billRef, {
        splits: updatedSplits
    });

    // Notify the person who paid
    await createNotification({
        recipientId: bill.paidById,
        senderId: userId,
        type: 'payment_received',
        poolId: bill.poolId,
        billId: billId,
        message: `marked their payment as settled for "${bill.description}"`,
        read: false
    });
}

export async function deleteBill(billId: string): Promise<void> {
    const billRef = doc(db, 'bills', billId);
    await deleteDoc(billRef);
}

// Balance Calculation Functions

export async function calculateBalances(poolId: string): Promise<Map<string, Balance>> {
    const bills = await getPoolBills(poolId);
    const pool = await getPool(poolId);

    if (!pool) {
        throw new Error('Pool not found');
    }

    // Initialize balances for all members
    const balances = new Map<string, Balance>();
    pool.memberIds.forEach(userId => {
        balances.set(userId, {
            userId,
            poolId,
            netBalance: 0,
            owesTo: [],
            owedBy: []
        });
    });

    // Process each bill
    bills.forEach(bill => {
        bill.splits.forEach(split => {
            if (!split.paid && split.userId !== bill.paidById) {
                // This person owes money
                const userBalance = balances.get(split.userId)!;
                userBalance.netBalance -= split.amount;

                const existingDebt = userBalance.owesTo.find(d => d.userId === bill.paidById);
                if (existingDebt) {
                    existingDebt.amount += split.amount;
                } else {
                    userBalance.owesTo.push({ userId: bill.paidById, amount: split.amount });
                }

                // The person who paid is owed money
                const paidByBalance = balances.get(bill.paidById)!;
                paidByBalance.netBalance += split.amount;

                const existingCredit = paidByBalance.owedBy.find(c => c.userId === split.userId);
                if (existingCredit) {
                    existingCredit.amount += split.amount;
                } else {
                    paidByBalance.owedBy.push({ userId: split.userId, amount: split.amount });
                }
            }
        });
    });

    return balances;
}

export async function getUserPoolBalance(poolId: string, userId: string): Promise<Balance | null> {
    const balances = await calculateBalances(poolId);
    return balances.get(userId) || null;
}
