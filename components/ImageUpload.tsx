"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (disabled) return;
    if (value.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls].slice(0, maxImages));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  }, [value, maxImages, disabled, onChange]);

  const removeImage = (index: number) => {
    if (disabled) return;
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files);
      }
    },
    [handleFileChange]
  );

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-90 text-white text-xs py-1 text-center">
                  Primary Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && !disabled && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center ${
              uploading ? "opacity-50" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
            )}
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB ({value.length}/{maxImages} images)
            </p>
          </label>
        </div>
      )}
    </div>
  );
}
