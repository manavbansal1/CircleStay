"use client"

import { CldUploadWidget } from 'next-cloudinary';
import { Camera, User } from 'lucide-react';

interface ProfileImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    uploadPreset?: string;
}

export function ProfileImageUpload({
    value,
    onChange,
    uploadPreset = 'circlestay_profiles'
}: ProfileImageUploadProps) {
    const handleUpload = (result: any) => {
        const newUrl = result.info.secure_url;
        onChange(newUrl);
    };

    return (
        <CldUploadWidget
            uploadPreset={uploadPreset}
            onSuccess={handleUpload}
        >
            {({ open }) => (
                <div className="flex flex-col items-center gap-4">
                    <div
                        onClick={() => open()}
                        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border cursor-pointer group hover:border-primary transition-colors"
                    >
                        {value ? (
                            <>
                                <img
                                    src={value}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                                <User className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => open()}
                        className="text-sm text-primary hover:underline"
                    >
                        {value ? 'Change Photo' : 'Upload Photo'}
                    </button>
                </div>
            )}
        </CldUploadWidget>
    );
}
