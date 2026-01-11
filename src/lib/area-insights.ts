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

export async function getAreaInsights(address: string, lat?: number, lng?: number): Promise<AreaInsights> {
    try {
        const params = new URLSearchParams({ address });
        if (lat) params.append('lat', lat.toString());
        if (lng) params.append('lng', lng.toString());

        const response = await fetch(`/api/area-insights?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch area insights');
        }

        return data;
    } catch (error) {
        console.error('Error fetching area insights:', error);
        return {
            livabilityScore: 50,
            transitScore: 50,
            safetyScore: 70,
            amenitiesScore: 50,
            summary: 'Unable to load area insights at this time.',
            attractions: [],
            transitOptions: [],
            error: 'Failed to load area insights'
        };
    }
}
