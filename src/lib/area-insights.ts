import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AreaInsights {
    livabilityScore: number;
    transitScore: number;
    safetyScore: number;
    amenitiesScore: number;
    summary: string;
    attractions: string[];
    transitOptions: string[];
    loading?: boolean;
    error?: string;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function getAreaInsights(address: string, lat?: number, lng?: number): Promise<AreaInsights> {
    try {
        // Get nearby places using Google Maps Places API
        let coordinates = { lat, lng };
        
        // If no coordinates provided, geocode the address
        if (!lat || !lng) {
            const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`
            );
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.results && geocodeData.results.length > 0) {
                coordinates = {
                    lat: geocodeData.results[0].geometry.location.lat,
                    lng: geocodeData.results[0].geometry.location.lng
                };
            }
        }

        if (!coordinates.lat || !coordinates.lng) {
            throw new Error('Unable to determine location coordinates');
        }

        // Get nearby places (restaurants, parks, transit, etc.)
        const placesResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=1500&key=${MAPS_API_KEY}`
        );
        const placesData = await placesResponse.json();

        // Categorize places
        const restaurants = placesData.results?.filter((p: any) => 
            p.types?.includes('restaurant') || p.types?.includes('cafe')
        ).length || 0;
        
        const transitStops = placesData.results?.filter((p: any) => 
            p.types?.includes('transit_station') || p.types?.includes('bus_station') || p.types?.includes('subway_station')
        ).length || 0;
        
        const parks = placesData.results?.filter((p: any) => 
            p.types?.includes('park')
        ).length || 0;
        
        const schools = placesData.results?.filter((p: any) => 
            p.types?.includes('school')
        ).length || 0;

        const hospitals = placesData.results?.filter((p: any) => 
            p.types?.includes('hospital')
        ).length || 0;

        const stores = placesData.results?.filter((p: any) => 
            p.types?.includes('store') || p.types?.includes('supermarket') || p.types?.includes('shopping_mall')
        ).length || 0;

        // Get top attractions
        const attractions = placesData.results
            ?.filter((p: any) => 
                p.types?.includes('tourist_attraction') || 
                p.types?.includes('museum') || 
                p.types?.includes('park') ||
                p.rating >= 4.0
            )
            .slice(0, 5)
            .map((p: any) => p.name) || [];

        // Get transit options
        const transitOptions = placesData.results
            ?.filter((p: any) => 
                p.types?.includes('transit_station') || 
                p.types?.includes('bus_station') || 
                p.types?.includes('subway_station')
            )
            .slice(0, 3)
            .map((p: any) => p.name) || [];

        // Calculate scores based on nearby amenities
        const livabilityScore = Math.min(100, Math.round(
            (restaurants * 2) + 
            (stores * 3) + 
            (parks * 4) + 
            (schools * 3) +
            (hospitals * 2)
        ) / 2);

        const transitScore = Math.min(100, transitStops * 15);
        const amenitiesScore = Math.min(100, Math.round((restaurants + stores + parks) / 3) * 10);
        
        // Use Gemini AI to generate a comprehensive summary
        let summary = '';
        let safetyScore = 75; // Default

        if (GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `Based on the following data about the area near ${address}:
- ${restaurants} restaurants and cafes nearby
- ${transitStops} transit stations
- ${parks} parks
- ${schools} schools
- ${hospitals} hospitals
- ${stores} stores and shopping centers
- Top attractions: ${attractions.join(', ') || 'None noted'}

Provide a 2-3 sentence summary about living in this area, focusing on livability, convenience, and lifestyle. Also estimate a safety score from 1-100 based on typical characteristics of areas with these amenities. Format your response as:
SUMMARY: [your summary]
SAFETY_SCORE: [number]`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Parse the response
                const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?=SAFETY_SCORE:|$)/s);
                const safetyMatch = text.match(/SAFETY_SCORE:\s*(\d+)/);
                
                if (summaryMatch) {
                    summary = summaryMatch[1].trim();
                }
                if (safetyMatch) {
                    safetyScore = parseInt(safetyMatch[1]);
                }
            } catch (error) {
                console.error('Gemini API error:', error);
                // Fallback to basic summary
                summary = `This area offers ${restaurants} dining options, ${transitStops} transit connections, and ${parks} parks. ${
                    livabilityScore >= 70 ? 'A highly livable neighborhood' : 'A developing area'
                } with ${transitScore >= 70 ? 'excellent' : 'moderate'} public transportation access.`;
            }
        } else {
            // Fallback summary without Gemini
            summary = `This area offers ${restaurants} dining options, ${transitStops} transit connections, and ${parks} parks. ${
                livabilityScore >= 70 ? 'A highly livable neighborhood' : 'A developing area'
            } with ${transitScore >= 70 ? 'excellent' : 'moderate'} public transportation access.`;
        }

        return {
            livabilityScore,
            transitScore,
            safetyScore,
            amenitiesScore,
            summary,
            attractions,
            transitOptions
        };

    } catch (error) {
        console.error('Error fetching area insights:', error);
        return {
            livabilityScore: 0,
            transitScore: 0,
            safetyScore: 0,
            amenitiesScore: 0,
            summary: 'Unable to load area insights at this time.',
            attractions: [],
            transitOptions: [],
            error: 'Failed to load area insights'
        };
    }
}
