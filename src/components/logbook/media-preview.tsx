"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  type: "image" | "video";
  alt?: string;
  className?: string;
}

export function MediaPreview({ url, type, alt, className }: MediaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {/* Thumbnail */}
      <button
        onClick={handleThumbnailClick}
        className={`
          relative overflow-hidden rounded-lg border-2 border-gray-200 
          shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className || "w-20 h-20"}
        `}
      >
        {type === "video" ? (
          <>
            <video
              src={url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <img
            src={url}
            alt={alt || "Media thumbnail"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {type === "video" ? "Video Preview" : "Image Preview"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            {type === "video" ? (
              <video
                src={url}
                controls
                playsInline
                preload="metadata"
                className="max-w-full max-h-full rounded-lg shadow-lg bg-black"
                style={{ maxHeight: "calc(90vh - 120px)" }}
              />
            ) : (
              <img
                src={url}
                alt={alt || "Media preview"}
                className="max-w-full max-h-full rounded-lg shadow-lg"
                style={{ maxHeight: "calc(90vh - 120px)" }}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tutup
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}