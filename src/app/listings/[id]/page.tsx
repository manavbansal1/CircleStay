"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getListing, getUserProfile, createViewingRequest, createNotification, deleteListing } from '@/lib/firestore';
import type { Listing, UserProfile } from '@/lib/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { AreaInsightsCard } from '@/components/AreaInsightsCard';
import { AreaChatbot } from '@/components/AreaChatbot';
import { MapPin, Bed, Bath, Calendar, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import styles from './page.module.css';

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [listing, setListing] = useState<Listing | null>(null);
    const [host, setHost] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function loadListing() {
            if (!params.id || typeof params.id !== 'string') return;

            try {
                const listingData = await getListing(params.id);
                if (listingData) {
                    setListing(listingData);
                    const hostData = await getUserProfile(listingData.hostId);
                    setHost(hostData);
                }
            } catch (error) {
                console.error('Error loading listing:', error);
            } finally {
                setLoading(false);
            }
        }

        loadListing();
    }, [params.id]);

    const handleRequestViewing = async () => {
        if (!user || !listing) return;

        setRequesting(true);
        try {
            await createViewingRequest({
                listingId: listing.id,
                requesterId: user.uid,
                hostId: listing.hostId,
                message: requestMessage,
                status: 'pending'
            });

            await createNotification({
                recipientId: listing.hostId,
                senderId: user.uid,
                type: 'viewing_request',
                listingId: listing.id,
                message: `requested to view your listing "${listing.title}"`,
                read: false
            });

            setShowRequestModal(false);
            setRequestMessage('');
            alert('Viewing request sent successfully!');
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    const handleDelete = async () => {
        if (!listing) return;

        setDeleting(true);
        try {
            await deleteListing(listing.id);
            router.push('/marketplace');
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Failed to delete listing. Please try again.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading listing...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!listing) {
        return (
            <ProtectedRoute>
                <div className={styles.page}>
                    <div className={styles.container}>
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
                            <Button onClick={() => router.push('/marketplace')}>
                                Back to Marketplace
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const isOwnListing = user?.uid === listing.hostId;

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {/* Main Content */}
                        <div className={styles.mainContent}>
                            {/* Image Gallery */}
                            <div className={styles.imageGallery}>
                                {listing.images.length > 0 && (
                                    <>
                                        <img
                                            src={listing.images[selectedImage]}
                                            alt={listing.title}
                                            className={styles.mainImage}
                                        />
                                        {listing.images.length > 1 && (
                                            <div className={styles.thumbnails}>
                                                {listing.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`${listing.title} ${index + 1}`}
                                                        className={styles.thumbnail}
                                                        onClick={() => setSelectedImage(index)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <h1 className={styles.title}>{listing.title}</h1>
                            <p className={styles.price}>${listing.price}/month</p>
                            <p className={styles.location}>
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {listing.location}
                            </p>

                            <p className={styles.description}>{listing.description}</p>

                            {/* Details */}
                            <div className={styles.details}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        <Bed className="inline h-4 w-4 mr-1" />
                                        Bedrooms
                                    </span>
                                    <span className={styles.detailValue}>{listing.bedrooms}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        <Bath className="inline h-4 w-4 mr-1" />
                                        Bathrooms
                                    </span>
                                    <span className={styles.detailValue}>{listing.bathrooms}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Available From
                                    </span>
                                    <span className={styles.detailValue}>
                                        {format(listing.availableFrom, 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>

                            {/* Amenities */}
                            {listing.amenities.length > 0 && (
                                <div className={styles.amenities}>
                                    <h3 className="font-semibold mb-2">Amenities</h3>
                                    <div className={styles.amenitiesList}>
                                        {listing.amenities.map((amenity, index) => (
                                            <span key={index} className={styles.amenityTag}>
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Area Insights */}
                            <AreaInsightsCard 
                                address={listing.location}
                                lat={undefined}
                                lng={undefined}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className={styles.sidebar}>
                            <div className={styles.hostSection}>
                                <h3 className={styles.hostHeader}>Hosted by</h3>
                                <div className={styles.hostInfo}>
                                    {host?.photoURL ? (
                                        <img
                                            src={host.photoURL}
                                            alt={host.displayName}
                                            className={styles.hostImage}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <p className={styles.hostName}>{host?.displayName || 'Unknown'}</p>
                                        <p className="text-sm text-muted-foreground">{host?.location}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => router.push(`/profile/${listing.hostId}`)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    View Profile
                                </Button>
                            </div>

                            {!isOwnListing ? (
                                <Button
                                    onClick={() => setShowRequestModal(true)}
                                    className="w-full"
                                    size="lg"
                                >
                                    Request to View
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setShowDeleteModal(true)}
                                    variant="outline"
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    size="lg"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Listing
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Delete Listing</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this listing? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1"
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Request to View</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Send a viewing request to the host. They'll receive a notification with your profile.
                        </p>
                        <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Add a message (optional)"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-24 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowRequestModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRequestViewing}
                                disabled={requesting}
                                className="flex-1"
                            >
                                {requesting ? 'Sending...' : 'Send Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Area Chatbot */}
            {listing && (
                <AreaChatbot 
                    address={listing.location}
                    areaContext={`Property: ${listing.title}, Location: ${listing.location}, Type: ${listing.type}, Price: $${listing.price}/month`}
                />
            )}
        </ProtectedRoute>
    );
}
