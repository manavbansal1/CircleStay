"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/firestore';
import type { Notification, UserProfile } from '@/lib/firestore';
import { User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const router = useRouter();
    const [sender, setSender] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function loadSender() {
            try {
                const profile = await getUserProfile(notification.senderId);
                setSender(profile);
            } catch (error) {
                console.error('Error loading sender:', error);
            }
        }

        loadSender();
    }, [notification.senderId]);

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Navigate to sender's profile
        router.push(`/profile/${notification.senderId}`);
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
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{sender?.displayName || 'Someone'}</span>
                        {' '}
                        {notification.message}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                    </div>
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
