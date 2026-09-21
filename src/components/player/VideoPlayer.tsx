"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, Play, RefreshCw } from "lucide-react";
import { VideoSource, VideoServerOption } from "@/infrastructure/video/video.types";

interface VideoPlayerProps {
  source: VideoSource | null;
  title: string;
  poster?: string;
}

export default function VideoPlayer({ source, title, poster }: VideoPlayerProps) {
  const [selectedServerUrl, setSelectedServerUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Sync server list and initialize selected server
  const servers: VideoServerOption[] = source?.servers || (source?.url ? [{ id: "default", name: "Default Server", url: source.url }] : []);

  useEffect(() => {
    if (servers.length > 0) {
      setSelectedServerUrl(servers[0].url);
    } else if (source?.url) {
      setSelectedServerUrl(source.url);
    }
    setIsLoading(true);
    setHasError(false);
  }, [source?.url, reloadKey]);

  // Handle manual server switch
  const handleServerChange = (url: string) => {
    if (url === selectedServerUrl) return;
    setIsLoading(true);
    setHasError(false);
    setSelectedServerUrl(url);
  };

  // Handle retry
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  // Case 1: No source available
  if (!source || !selectedServerUrl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0e1117] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
        {poster && (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover opacity-20 blur-sm pointer-events-none"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-3 max-w-md">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <Play className="w-6 h-6 opacity-40" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Video is currently unavailable.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            We are working to bring this stream online soon. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Source exists (Multi-server player)
  return (
    <div className="w-full space-y-4">
      {/* Playback Container (No border, rounded-2xl) */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-20 bg-[#0a0c10] flex flex-col items-center justify-center gap-3 transition-opacity duration-300">
            {poster && (
              <Image
                src={poster}
                alt={title}
                fill
                className="object-cover opacity-20 blur-sm pointer-events-none"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-spin" />
              <span className="text-xs sm:text-sm font-medium text-zinc-300 tracking-wide">
                Loading video...
              </span>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-30 bg-[#0e1117] flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-white">
                Unable to load video on this server.
              </h3>
              <p className="text-xs text-zinc-400">
                Please try switching to another server below or retry.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Playback Iframe / Element */}
        {source.type === "iframe" ? (
          <iframe
            key={`${selectedServerUrl}-${reloadKey}`}
            src={selectedServerUrl}
            title={title}
            className="w-full h-full border-0 relative z-10"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          /* Future-proof Native / HLS player element */
          <video
            key={`${selectedServerUrl}-${reloadKey}`}
            src={selectedServerUrl}
            controls
            className="w-full h-full object-contain relative z-10"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        )}
      </div>

      {/* Multi-Server Selector Pill Bar (No icons, clean text Server 1, Server 2...) */}
      {servers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 bg-transparent">
          {servers.map((srv) => {
            const isActive = srv.url === selectedServerUrl;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleServerChange(srv.url)}
                className={`font-custom2 inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                    : "bg-[#161a23] hover:bg-[#202533] text-zinc-300 hover:text-white"
                }`}
              >
                <span>{srv.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
