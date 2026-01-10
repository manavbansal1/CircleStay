import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export default cloudinary;

export const UPLOAD_PRESETS = {
    PROFILE: 'circlestay_profiles',
    LISTING: 'circlestay_listings'
};

export const CLOUDINARY_FOLDERS = {
    PROFILES: 'circlestay/profiles',
    LISTINGS: 'circlestay/listings'
};
