"use client";

import React from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerId?: string;
  title?: string;
}

export default function TrailerModal({
  isOpen,
  onClose,
  trailerId,
  title,
}: TrailerModalProps) {
  if (!isOpen || !trailerId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
          aria-label="Close trailer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* YouTube Iframe */}
        <iframe
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`}
          title={title ? `${title} Trailer` : "Trailer"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
