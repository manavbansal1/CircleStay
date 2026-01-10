"use client"

import { CldUploadWidget } from 'next-cloudinary';
import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxImages?: number;
    uploadPreset?: string;
}

export function ImageUpload({
    value = [],
    onChange,
    maxImages = 5,
    uploadPreset = 'circlestay_listings'
}: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(value);

    // Sync local state with parent value prop
    useEffect(() => {
        setImages(value);
    }, [value]);

    const handleUpload = (result: any) => {
        const newUrl = result.info.secure_url;
        const updatedImages = [...images, newUrl];
        setImages(updatedImages);
        onChange(updatedImages);
    };

    const handleRemove = (url: string) => {
        const updatedImages = images.filter(img => img !== url);
        setImages(updatedImages);
        onChange(updatedImages);
    };

    const canUploadMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border">
                        <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => handleRemove(url)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {canUploadMore && (
                    <CldUploadWidget
                        uploadPreset={uploadPreset}
                        onSuccess={handleUpload}
                    >
                        {({ open }) => (
                            <button
                                onClick={() => open()}
                                type="button"
                                className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                            >
                                <Upload className="h-8 w-8" />
                                <span className="text-sm font-medium">Upload Image</span>
                                <span className="text-xs">({images.length}/{maxImages})</span>
                            </button>
                        )}
                    </CldUploadWidget>
                )}
            </div>

            {!canUploadMore && (
                <p className="text-sm text-muted-foreground">
                    Maximum of {maxImages} images reached
                </p>
            )}
        </div>
    );
}
