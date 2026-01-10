"use client"

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createListing } from '@/lib/firestore';
import { Button } from '@/components/Button';
import { ImageUpload } from '@/components/ImageUpload';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { MapView } from '@/components/MapView';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from './page.module.css';

export default function CreateListingPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [locationLat, setLocationLat] = useState<number | undefined>();
    const [locationLng, setLocationLng] = useState<number | undefined>();
    const [bedrooms, setBedrooms] = useState('1');
    const [bathrooms, setBathrooms] = useState('1');
    const [amenities, setAmenities] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [availableFrom, setAvailableFrom] = useState('');
    const [propertyType, setPropertyType] = useState('apartment');
    const [connectionType, setConnectionType] = useState<'Direct' | '2nd Degree' | '3rd Degree'>('Direct');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!user) {
            setError('You must be logged in to create a listing');
            setLoading(false);
            return;
        }

        if (images.length === 0) {
            setError('Please upload at least one image');
            setLoading(false);
            return;
        }

        try {
            await createListing({
                hostId: user.uid,
                title,
                description,
                price: parseFloat(price),
                location,
                images,
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                amenities: amenities.split(',').map(a => a.trim()).filter(a => a),
                availableFrom: new Date(availableFrom),
                type: propertyType,
                connectionType: connectionType
            });

            router.push('/marketplace');
        } catch (err: any) {
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Create Listing</h1>
                        <p className={styles.subtitle}>Share your space with the CircleStay community</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Basic Information</h2>
                            <div className={styles.grid}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="title" className={styles.label}>Title *</label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={styles.input}
                                        placeholder="Cozy Room in Mission District"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="price" className={styles.label}>Monthly Price ($) *</label>
                                    <input
                                        id="price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={styles.input}
                                        placeholder="850"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <LocationAutocomplete
                                    value={location}
                                    onChange={(address, lat, lng) => {
                                        setLocation(address);
                                        setLocationLat(lat);
                                        setLocationLng(lng);
                                    }}
                                    label="Location"
                                    placeholder="Mission District, San Francisco, CA"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            {/* Map Preview */}
                            {(locationLat && locationLng) && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Location Preview</label>
                                    <MapView
                                        address={location}
                                        lat={locationLat}
                                        lng={locationLng}
                                        height="350px"
                                        zoom={16}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        📍 Red marker shows the exact location of your property
                                    </p>
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="description" className={styles.label}>Description *</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={styles.textarea}
                                    placeholder="Describe your space, neighborhood, and what makes it special..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Property Details</h2>
                            <div className={styles.grid}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="propertyType" className={styles.label}>Property Type *</label>
                                    <select
                                        id="propertyType"
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                        className={styles.select}
                                        required
                                    >
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="room">Room</option>
                                        <option value="studio">Studio</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="connectionType" className={styles.label}>Connection Type *</label>
                                    <select
                                        id="connectionType"
                                        value={connectionType}
                                        onChange={(e) => setConnectionType(e.target.value as 'Direct' | '2nd Degree' | '3rd Degree')}
                                        className={styles.select}
                                        required
                                    >
                                        <option value="Direct">Direct Network</option>
                                        <option value="2nd Degree">Friends of Friends</option>
                                        <option value="3rd Degree">Extended Network</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.grid}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="bedrooms" className={styles.label}>Bedrooms *</label>
                                    <select
                                        id="bedrooms"
                                        value={bedrooms}
                                        onChange={(e) => setBedrooms(e.target.value)}
                                        className={styles.select}
                                        required
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="bathrooms" className={styles.label}>Bathrooms *</label>
                                    <select
                                        id="bathrooms"
                                        value={bathrooms}
                                        onChange={(e) => setBathrooms(e.target.value)}
                                        className={styles.select}
                                        required
                                    >
                                        {[1, 1.5, 2, 2.5, 3].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="availableFrom" className={styles.label}>Available From *</label>
                                <input
                                    id="availableFrom"
                                    type="date"
                                    value={availableFrom}
                                    onChange={(e) => setAvailableFrom(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="amenities" className={styles.label}>Amenities (comma-separated)</label>
                                <input
                                    id="amenities"
                                    type="text"
                                    value={amenities}
                                    onChange={(e) => setAmenities(e.target.value)}
                                    className={styles.input}
                                    placeholder="WiFi, Parking, Laundry, Kitchen"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Photos *</h2>
                            <ImageUpload
                                value={images}
                                onChange={setImages}
                                maxImages={5}
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Creating...' : 'Create Listing'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
