"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * YouTube-ийн iframe хэдэн зуун KB JavaScript ачаалдаг тул эхлээд зөвхөн
 * зураг харуулж, хэрэглэгч тоглуулах товч дарсны дараа iframe-ийг ачаална.
 */
export function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink shadow-[var(--shadow-lift)] ring-1 ring-line">
      {active ? (
        <iframe
          src={youtubeEmbedUrl(videoId, { autoplay: true })}
          title={mn.lesson.videoTitle(title)}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={mn.lesson.playVideo(title)}
          className="group absolute inset-0 size-full cursor-pointer focus-visible:outline-offset-[-4px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube-ийн зургийг шууд ашиглана, дахин боловсруулах шаардлагагүй */}
          <img
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            width={480}
            height={360}
            className="absolute inset-0 size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            decoding="async"
            fetchPriority="high"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition-transform duration-200 group-hover:scale-105 sm:size-20">
            <PlayIcon size={30} className="translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  );
}
