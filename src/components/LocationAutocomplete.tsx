"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from 'lucide-react';

interface LocationAutocompleteProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    required?: boolean;
}

export function LocationAutocomplete({
    value,
    onChange,
    placeholder = "Enter location",
    className = "",
    label,
    required = false
}: LocationAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            setError("Google Maps API key not configured");
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google?.maps?.places) {
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
            // Cleanup script if component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !inputRef.current) return;

        try {
            // Initialize autocomplete
            autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                types: ['geocode', 'establishment'],
                fields: ['formatted_address', 'geometry', 'address_components']
            });

            // Listen for place selection
            const listener = autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                
                if (place?.formatted_address && place?.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    
                    // Call onChange with all three parameters
                    onChange(place.formatted_address, lat, lng);
                }
            });

            return () => {
                // Cleanup listener
                if (listener) {
                    google.maps.event.removeListener(listener);
                }
            };
        } catch (err) {
            console.error('Error initializing autocomplete:', err);
            setError("Error initializing location search");
        }
    }, [isLoaded, onChange]);

    if (error) {
        return (
            <div className="space-y-2">
                {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={className}
                    required={required}
                />
                <p className="text-xs text-amber-600">⚠️ Location autocomplete unavailable. Please enter manually.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={className}
                    required={required}
                    disabled={!isLoaded}
                />
                {!isLoaded && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
            </div>
            {isLoaded && (
                <p className="text-xs text-gray-500">Start typing to see location suggestions</p>
            )}
        </div>
    );
}
