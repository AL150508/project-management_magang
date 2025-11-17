"use client"

// Komponen Avatar: foto profil dengan image dan fallback inisial/ikon.

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib & database connection/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }

// MediaPreview Component - untuk file terpisah nanti
/*
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type Props = {
  url: string;
  thumbnail?: string;
  alt?: string;
  className?: string;
};

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

export function MediaPreview({ url, thumbnail, alt, className }: Props) {
  const [open, setOpen] = useState(false);
  const isVid = isVideo(url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={className} onClick={() => setOpen(true)}>
          {isVid ? (
            <video
              src={url}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              muted
              playsInline
            />
          ) : (
            <img
              src={thumbnail || url}
              alt={alt || "media"}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              loading="lazy"
            />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-[90vw] bg-white">
        <DialogHeader>
          <DialogTitle>{alt || "Preview Media"}</DialogTitle>
        </DialogHeader>

        {isVid ? (
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded"
          />
        ) : (
          <img
            src={url}
            alt={alt || "media"}
            className="w-full h-auto rounded"
          />
        )}

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Tutup
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
*/
