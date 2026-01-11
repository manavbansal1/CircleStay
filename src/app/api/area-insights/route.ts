import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        console.log('Area Insights Request:', { address, lat, lng });
        console.log('MAPS_API_KEY available:', !!MAPS_API_KEY);

        // Get coordinates
        let coordinates = { lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined };
        
        // If no coordinates provided, geocode the address
        if (!coordinates.lat || !coordinates.lng) {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`;
            console.log('Geocoding address...');
            
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            
            console.log('Geocode response status:', geocodeData.status);
            console.log('Geocode results count:', geocodeData.results?.length || 0);
            
            if (geocodeData.status === 'REQUEST_DENIED') {
                console.error('Geocoding API access denied. Check API key and billing.');
                
                // Generate estimated insights based on address keywords
                const addressLower = address.toLowerCase();
                const isUrban = /new york|san francisco|chicago|los angeles|seattle|boston|manhattan|downtown/i.test(address);
                const hasTransit = /station|metro|subway/i.test(address);
                
                return NextResponse.json({
                    livabilityScore: isUrban ? 75 : 65,
                    transitScore: hasTransit ? 80 : isUrban ? 70 : 50,
                    safetyScore: 72,
                    amenitiesScore: isUrban ? 80 : 60,
                    summary: `${address} is ${isUrban ? 'located in an urban area with diverse amenities and good transit access' : 'a residential area with local amenities'}. This is a general overview; detailed API-based insights require additional configuration.`,
                    attractions: isUrban ? ['Parks & Recreation', 'Dining & Shopping', 'Entertainment'] : ['Local Parks', 'Community Centers'],
                    transitOptions: hasTransit ? ['Metro/Subway Access', 'Bus Lines'] : isUrban ? ['Bus Lines', 'Rideshare'] : ['Local Transit']
                }, { status: 200 });
            }
            
            if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
                console.warn('Geocoding failed:', geocodeData.status, geocodeData.error_message);
                return NextResponse.json({
                    livabilityScore: 50,
                    transitScore: 50,
                    safetyScore: 70,
                    amenitiesScore: 50,
                    summary: `This area at ${address} offers various amenities and services. Unable to fetch detailed insights at this time.`,
                    attractions: [],
                    transitOptions: []
                }, { status: 200 });
            }
            
            coordinates = {
                lat: geocodeData.results[0].geometry.location.lat,
                lng: geocodeData.results[0].geometry.location.lng
            };
            console.log('Geocoded coordinates:', coordinates);
        }

        if (!coordinates.lat || !coordinates.lng) {
            return NextResponse.json({
                livabilityScore: 50,
                transitScore: 50,
                safetyScore: 70,
                amenitiesScore: 50,
                summary: 'Unable to fetch detailed area insights for this location at this time.',
                attractions: [],
                transitOptions: []
            }, { status: 200 });
        }

        // Get nearby places (using Google Places API Nearby Search)
        const placesResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=1500&key=${MAPS_API_KEY}`
        );
        const placesData = await placesResponse.json();

        if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
            console.error('Places API error:', placesData);
        }

        // Categorize places
        const results = placesData.results || [];
        
        const restaurants = results.filter((p: any) => 
            p.types?.includes('restaurant') || p.types?.includes('cafe')
        ).length;
        
        const transitStops = results.filter((p: any) => 
            p.types?.includes('transit_station') || p.types?.includes('bus_station') || p.types?.includes('subway_station')
        ).length;
        
        const parks = results.filter((p: any) => 
            p.types?.includes('park')
        ).length;
        
        const schools = results.filter((p: any) => 
            p.types?.includes('school')
        ).length;

        const hospitals = results.filter((p: any) => 
            p.types?.includes('hospital')
        ).length;

        const stores = results.filter((p: any) => 
            p.types?.includes('store') || p.types?.includes('supermarket') || p.types?.includes('shopping_mall')
        ).length;

        // Get top attractions
        const attractions = results
            .filter((p: any) => 
                p.types?.includes('tourist_attraction') || 
                p.types?.includes('museum') || 
                p.types?.includes('park') ||
                (p.rating && p.rating >= 4.0)
            )
            .slice(0, 5)
            .map((p: any) => p.name);

        // Get transit options
        const transitOptions = results
            .filter((p: any) => 
                p.types?.includes('transit_station') || 
                p.types?.includes('bus_station') || 
                p.types?.includes('subway_station')
            )
            .slice(0, 3)
            .map((p: any) => p.name);

        // Calculate scores
        const livabilityScore = Math.min(100, Math.round(
            (restaurants * 2) + 
            (stores * 3) + 
            (parks * 4) + 
            (schools * 3) +
            (hospitals * 2)
        ) / 2);

        const transitScore = Math.min(100, transitStops * 15);
        const amenitiesScore = Math.min(100, Math.round((restaurants + stores + parks) / 3) * 10);
        
        // Use Gemini AI to generate summary
        let summary = '';
        let safetyScore = 75;

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
                summary = `This area offers ${restaurants} dining options, ${transitStops} transit connections, and ${parks} parks. ${
                    livabilityScore >= 70 ? 'A highly livable neighborhood' : 'A developing area'
                } with ${transitScore >= 70 ? 'excellent' : 'moderate'} public transportation access.`;
            }
        } else {
            summary = `This area offers ${restaurants} dining options, ${transitStops} transit connections, and ${parks} parks. ${
                livabilityScore >= 70 ? 'A highly livable neighborhood' : 'A developing area'
            } with ${transitScore >= 70 ? 'excellent' : 'moderate'} public transportation access.`;
        }

        return NextResponse.json({
            livabilityScore,
            transitScore,
            safetyScore,
            amenitiesScore,
            summary,
            attractions,
            transitOptions
        });

    } catch (error) {
        console.error('Error in area insights API:', error);
        return NextResponse.json({
            livabilityScore: 50,
            transitScore: 50,
            safetyScore: 70,
            amenitiesScore: 50,
            summary: 'Unable to load area insights at this time.',
            attractions: [],
            transitOptions: [],
            error: 'Failed to load area insights'
        }, { status: 200 });
    }
}
