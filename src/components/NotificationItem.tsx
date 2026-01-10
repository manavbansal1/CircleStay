"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/firestore';
import { acceptPoolInvite, rejectPoolInvite, getPool } from '@/lib/firestore-pools';
import type { Notification, UserProfile } from '@/lib/firestore';
import { User, Clock, Check, X, Users, Receipt, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './Button';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onActionComplete?: () => void;
}

export function NotificationItem({ notification, onMarkAsRead, onActionComplete }: NotificationItemProps) {
    const router = useRouter();
    const [sender, setSender] = useState<UserProfile | null>(null);
    const [poolName, setPoolName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);

    useEffect(() => {
        async function loadSender() {
            try {
                const profile = await getUserProfile(notification.senderId);
                setSender(profile);
            } catch (error) {
                console.error('Error loading sender:', error);
            }
        }

        async function loadPoolName() {
            if (notification.poolId) {
                try {
                    const pool = await getPool(notification.poolId);
                    setPoolName(pool?.name || 'Unknown Pool');
                } catch (error) {
                    console.error('Error loading pool:', error);
                }
            }
        }

        loadSender();
        loadPoolName();
    }, [notification.senderId, notification.poolId]);

    const handleAcceptInvite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.poolId) return;

        setLoading(true);
        try {
            await acceptPoolInvite(notification.poolId, notification.recipientId);
            setActionTaken(true);
            onMarkAsRead(notification.id);
            onActionComplete?.();
        } catch (error) {
            console.error('Error accepting invite:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectInvite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.poolId) return;

        setLoading(true);
        try {
            await rejectPoolInvite(notification.poolId, notification.recipientId);
            setActionTaken(true);
            onMarkAsRead(notification.id);
            onActionComplete?.();
        } catch (error) {
            console.error('Error rejecting invite:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.type === 'pool_invite' && notification.poolId) {
            router.push(`/commons/${notification.poolId}`);
        } else if (notification.type === 'bill_added' && notification.poolId) {
            router.push(`/commons/${notification.poolId}`);
        } else if (notification.type === 'payment_received' && notification.poolId) {
            router.push(`/commons/${notification.poolId}`);
        } else if (notification.listingId) {
            router.push(`/listings/${notification.listingId}`);
        } else {
            router.push(`/profile/${notification.senderId}`);
        }
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'pool_invite':
                return <Users className="h-5 w-5 text-primary" />;
            case 'bill_added':
                return <Receipt className="h-5 w-5 text-accent" />;
            case 'payment_received':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            default:
                return <User className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`p-4 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''
                }`}
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    {sender?.photoURL ? (
                        <img
                            src={sender.photoURL}
                            alt={sender.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            {getNotificationIcon()}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{sender?.displayName || 'Someone'}</span>
                        {' '}
                        {notification.message}
                    </p>

                    {poolName && (notification.type === 'pool_invite' || notification.type === 'bill_added' || notification.type === 'payment_received') && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Pool: {poolName}
                        </p>
                    )}

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                    </div>

                    {/* Pool Invite Actions */}
                    {notification.type === 'pool_invite' && !actionTaken && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                                size="sm"
                                onClick={handleAcceptInvite}
                                disabled={loading}
                                className="flex-1"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRejectInvite}
                                disabled={loading}
                                className="flex-1"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Decline
                            </Button>
                        </div>
                    )}

                    {actionTaken && notification.type === 'pool_invite' && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            You responded to this invitation
                        </p>
                    )}
                </div>

                {!notification.read && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

