export const CLOUDINARY_CONFIG = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwh3dfwqb',
    uploadPreset: {
        profile: 'circlestay_profiles',
        listing: 'circlestay_listings'
    }
};

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    if (transformations) {
        return `${baseUrl}/${transformations}/${publicId}`;
    }

    return `${baseUrl}/${publicId}`;
}

export function getProfileImageUrl(publicId: string): string {
    return getCloudinaryUrl(publicId, 'w_400,h_400,c_fill,g_face');
}

export function getListingImageUrl(publicId: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    const transformations = {
        thumbnail: 'w_300,h_200,c_fill',
        medium: 'w_800,h_600,c_fill',
        large: 'w_1200,h_800,c_fill'
    };

    return getCloudinaryUrl(publicId, transformations[size]);
}
