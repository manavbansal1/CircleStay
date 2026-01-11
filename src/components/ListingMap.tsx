"use client";

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface ListingMapProps {
    address: string;
    lat?: number;
    lng?: number;
}

export function ListingMap({ address, lat, lng }: ListingMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadMap = async () => {
            try {
                // Check if Google Maps is already loaded
                if (typeof window !== 'undefined' && (window as any).google) {
                    if (isMounted) {
                        initializeMap();
                    }
                    return;
                }

                // Check if script is already being loaded
                const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
                if (existingScript) {
                    const onScriptLoad = () => {
                        if (isMounted) {
                            initializeMap();
                        }
                    };
                    existingScript.addEventListener('load', onScriptLoad);
                    return () => {
                        existingScript.removeEventListener('load', onScriptLoad);
                    };
                }

                // Load Google Maps script only if not already present
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    if (isMounted) {
                        initializeMap();
                    }
                };
                script.onerror = () => {
                    if (isMounted) {
                        setError('Failed to load map');
                    }
                };
                document.head.appendChild(script);
            } catch (err) {
                console.error('Error loading map:', err);
                if (isMounted) {
                    setError('Failed to load map');
                }
            }
        };

        const initializeMap = async () => {
            if (!mapRef.current || !isMounted) return;

            try {
                const google = (window as any).google;
                
                // If lat/lng provided, use them directly
                if (lat && lng) {
                    const map = new google.maps.Map(mapRef.current, {
                        center: { lat, lng },
                        zoom: 15,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    });

                    new google.maps.Marker({
                        position: { lat, lng },
                        map,
                        title: address,
                    });

                    mapInstanceRef.current = map;
                    if (isMounted) {
                        setMapLoaded(true);
                    }
                    return;
                }

                // Otherwise, geocode the address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address }, (results: any, status: any) => {
                    if (!isMounted) return;
                    
                    if (status === 'OK' && results[0]) {
                        const location = results[0].geometry.location;
                        
                        if (!mapRef.current) return;
                        
                        const map = new google.maps.Map(mapRef.current, {
                            center: location,
                            zoom: 15,
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                        });

                        new google.maps.Marker({
                            position: location,
                            map,
                            title: address,
                        });

                        mapInstanceRef.current = map;
                        setMapLoaded(true);
                    } else {
                        setError('Unable to find location on map');
                    }
                });
            } catch (err) {
                console.error('Error initializing map:', err);
                if (isMounted) {
                    setError('Failed to initialize map');
                }
            }
        };

        loadMap();

        return () => {
            isMounted = false;
            mapInstanceRef.current = null;
        };
    }, [address, lat, lng]);

    if (error) {
        return (
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg">Location</h3>
            
            {/* Loading or error state - render outside map div */}
            {!mapLoaded && !error && (
                <div className="w-full h-[400px] rounded-lg border border-border/50 bg-secondary/30 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
            
            {/* Map container - only render when ready, let Google Maps control it completely */}
            <div
                ref={mapRef}
                className="w-full h-[400px] rounded-lg border border-border/50 overflow-hidden"
                style={{ 
                    backgroundColor: '#f5f5f5',
                    display: mapLoaded ? 'block' : 'none'
                }}
            />
            
            <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {address}
            </p>
        </div>
    );
}
