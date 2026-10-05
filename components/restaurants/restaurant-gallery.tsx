"use client";

import { useState, type ReactNode } from "react";
import type { RestaurantImage } from "@/types/restaurant";

export function RestaurantGallery({ images, name, children }: { images: RestaurantImage[]; name: string; children?: ReactNode }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = images.find(image => image.id === selectedId)
    ?? images.find(image => image.isPrimary) ?? images[0];

  const selectedIndex = images.findIndex(image => image.id === selected?.id);
  const moveSlide = (direction: number) => {
    const nextIndex = (selectedIndex + direction + images.length) % images.length;
    setSelectedId(images[nextIndex].id);
  };
  const controlClass = "flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div>
      <div role="region" aria-roledescription="carousel" aria-label={`${name} photos`} className={`relative isolate overflow-hidden bg-zinc-900 ${children ? "" : "rounded-3xl"}`}>
        {selected ? (
          <div className={children ? "absolute inset-0 -z-20" : "relative h-64 sm:h-96 lg:h-[28rem]"}>
            {images.map((image, index) => (
              // Public image URLs are supplied by the backend.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.id} src={image.imageUrl} alt={image.id === selected.id ? image.altText ?? `${name} restaurant` : ""} aria-hidden={image.id !== selected.id} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${image.id === selected.id ? "opacity-100" : "opacity-0"}`} loading={index === selectedIndex ? "eager" : "lazy"} fetchPriority={index === selectedIndex ? "high" : "auto"} />
            ))}
          </div>
        ) : (
          <div className={children ? "absolute inset-0 -z-20 bg-gradient-to-br from-zinc-900 via-slate-800 to-zinc-700" : "flex h-64 items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 sm:h-96"}>
            {!children ? <span className="flex size-24 items-center justify-center rounded-3xl bg-orange-500 text-5xl font-bold text-white">{name.charAt(0).toUpperCase()}</span> : null}
          </div>
        )}
        {children ? <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-black/10 to-black/15" />
          {children}
        </> : null}
        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-full border border-white/25 bg-zinc-950/35 p-2 shadow-lg backdrop-blur-xl" role="group" aria-label="Photo controls">
              <button type="button" onClick={() => moveSlide(-1)} className={controlClass} aria-label="Previous restaurant photo"><span aria-hidden="true" className="text-xl">‹</span></button>
              <div className="flex max-w-32 items-center overflow-x-auto sm:max-w-64" role="group" aria-label="Choose a photo">
                {images.map((image, index) => (
                  <button type="button" key={image.id} onClick={() => setSelectedId(image.id)} aria-label={`Show restaurant photo ${index + 1}`} aria-pressed={selected?.id === image.id} className="flex shrink-0 min-h-10 min-w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white">
                    <span aria-hidden="true" className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${selected?.id === image.id ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                  </button>
                ))}
              </div>
              <span aria-live="polite" aria-atomic="true" className="min-w-9 text-center text-xs tabular-nums text-white/80">{selectedIndex + 1} / {images.length}</span>
              <button type="button" onClick={() => moveSlide(1)} className={controlClass} aria-label="Next restaurant photo"><span aria-hidden="true" className="text-xl">›</span></button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
