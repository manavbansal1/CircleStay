"use client"

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface MapViewProps {
    address?: string;
    lat?: number;
    lng?: number;
    zoom?: number;
    height?: string;
    className?: string;
    showMarker?: boolean;
}

export function MapView({
    address,
    lat,
    lng,
    zoom = 15,
    height = "400px",
    className = "",
    showMarker = true
}: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            setError("Google Maps API key not configured");
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setError("Failed to load Google Maps");
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        // Initialize map if not already done
        if (!mapInstanceRef.current) {
            const initialCenter = (lat && lng) 
                ? { lat, lng } 
                : { lat: 37.7749, lng: -122.4194 }; // Default to SF only if no coords
            
            mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                zoom: (lat && lng) ? zoom : 10,
                center: initialCenter,
                mapTypeControl: false,
                streetViewControl: true,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "on" }]
                    }
                ]
            });
        }

        // If we have coordinates, update map
        if (lat && lng) {
            const position = { lat, lng };
            
            // Always update center and zoom when coordinates change
            mapInstanceRef.current?.setCenter(position);
            mapInstanceRef.current?.setZoom(zoom);

            if (showMarker) {
                // Remove old marker
                if (markerRef.current) {
                    markerRef.current.setMap(null);
                    markerRef.current = null;
                }

                // Add new marker with custom icon
                markerRef.current = new google.maps.Marker({
                    position,
                    map: mapInstanceRef.current,
                    title: address || "Property Location",
                    animation: google.maps.Animation.DROP,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#DC2626',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 3,
                        scale: 12
                    },
                    label: {
                        text: '🏠',
                        fontSize: '18px'
                    }
                });

                // Add info window
                const infoWindow = new google.maps.InfoWindow({
                    content: `<div style="padding: 8px; font-family: sans-serif;">
                        <strong style="color: #8B563C;">${address || 'Property Location'}</strong>
                        <br><small style="color: #666;">📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
                    </div>`
                });

                markerRef.current.addListener('click', () => {
                    infoWindow.open(mapInstanceRef.current, markerRef.current);
                });
            }
        } else if (address && !lat && !lng) {
            // Geocode address if no coordinates provided
            setIsGeocoding(true);
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                setIsGeocoding(false);
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    const position = { lat: location.lat(), lng: location.lng() };
                    
                    mapInstanceRef.current?.setCenter(position);
                    mapInstanceRef.current?.setZoom(zoom);

                    if (showMarker) {
                        if (markerRef.current) {
                            markerRef.current.setMap(null);
                        }
                        markerRef.current = new google.maps.Marker({
                            position,
                            map: mapInstanceRef.current,
                            title: address || "Property Location",
                            animation: google.maps.Animation.DROP,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: '#DC2626',
                                fillOpacity: 1,
                                strokeColor: '#FFFFFF',
                                strokeWeight: 3,
                                scale: 12
                            },
                            label: {
                                text: '🏠',
                                fontSize: '18px'
                            }
                        });

                        // Add info window
                        const infoWindow = new google.maps.InfoWindow({
                            content: `<div style="padding: 8px; font-family: sans-serif;">
                                <strong style="color: #8B563C;">${address || 'Property Location'}</strong>
                                <br><small style="color: #666;">📍 ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</small>
                            </div>`
                        });

                        markerRef.current.addListener('click', () => {
                            infoWindow.open(mapInstanceRef.current, markerRef.current);
                        });
                    }
                } else {
                    setError("Could not find location on map");
                }
            });
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
        };
    }, [isLoaded, lat, lng, address, zoom, showMarker]);

    if (error) {
        return (
            <div 
                className={`bg-gray-100 rounded-lg flex flex-col items-center justify-center ${className}`}
                style={{ height }}
            >
                <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{error}</p>
            </div>
        );
    }

    if (!isLoaded || isGeocoding) {
        return (
            <div 
                className={`bg-gray-100 rounded-lg flex flex-col items-center justify-center ${className}`}
                style={{ height }}
            >
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-600">
                    {isGeocoding ? "Finding location..." : "Loading map..."}
                </p>
            </div>
        );
    }

    return (
        <div 
            ref={mapRef} 
            className={`rounded-lg overflow-hidden shadow-md ${className}`}
            style={{ height }}
        />
    );
}
