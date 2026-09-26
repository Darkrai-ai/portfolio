'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import ScrambleText from './ScrambleText';
import { corePlaces, aboutPlaces } from '../data/places';

export default function HudReadout() {
  const view = useAppStore((s) => s.view);
  const activeList = view === 'about' ? aboutPlaces : corePlaces;
  const [placeIndex, setPlaceIndex] = useState(0);

  // Reset to a valid random index when switching between About Me and other views
  useEffect(() => {
    setPlaceIndex(Math.floor(Math.random() * activeList.length));
  }, [view, activeList.length]);

  useEffect(() => {
    if (view === 'intro' || activeList.length === 0) return;

    const interval = setInterval(() => {
      setPlaceIndex((prev) => {
        if (activeList.length <= 1) return 0;
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * activeList.length);
        }
        return next;
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [view, activeList]);

  if (view === 'intro' || activeList.length === 0) return null;

  const currentPlace = activeList[placeIndex % activeList.length] || activeList[0];

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end opacity-60 pointer-events-none select-none">
      <div className="font-hud text-xs text-text-dim tracking-wider">
        <ScrambleText text={currentPlace.place} duration={950} perpetual={true} />
      </div>
      <div className="font-hud text-xs text-text-dim tracking-wider mt-0.5">
        <ScrambleText text={currentPlace.coordinates} duration={950} perpetual={true} />
      </div>
    </div>
  );
}
