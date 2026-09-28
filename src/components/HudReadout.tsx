'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import ScrambleText from './ScrambleText';
import { corePlaces, aboutPlaces } from '../data/places';

function createShuffledDeck(length: number, avoidFirst?: number): number[] {
  const deck = Array.from({ length }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (length > 1 && avoidFirst !== undefined && deck[0] === avoidFirst) {
    const swapIdx = 1 + Math.floor(Math.random() * (length - 1));
    [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
  }
  return deck;
}

export default function HudReadout() {
  const view = useAppStore((s) => s.view);
  const isAbout = view === 'about';
  const activeList = isAbout ? aboutPlaces : corePlaces;

  const deckRef = useRef<number[]>([]);
  const currentIdxRef = useRef<number>(0);
  const [placeIndex, setPlaceIndex] = useState(0);

  // Build a fresh shuffled deck only when switching between Core views and About Me
  useEffect(() => {
    if (activeList.length === 0) return;
    const initialDeck = createShuffledDeck(activeList.length);
    const first = initialDeck.shift() ?? 0;
    deckRef.current = initialDeck;
    currentIdxRef.current = first;
    setPlaceIndex(first);
  }, [isAbout, activeList.length]);

  const isIntro = view === 'intro';

  useEffect(() => {
    if (isIntro || activeList.length <= 1) return;

    const interval = setInterval(() => {
      if (deckRef.current.length === 0) {
        deckRef.current = createShuffledDeck(activeList.length, currentIdxRef.current);
      }
      const next = deckRef.current.shift() ?? 0;
      currentIdxRef.current = next;
      setPlaceIndex(next);
    }, 3400);

    return () => clearInterval(interval);
  }, [isIntro, isAbout, activeList.length]);

  if (view === 'intro' || activeList.length === 0) return null;

  const currentPlace = activeList[placeIndex % activeList.length] || activeList[0];

  return (
    <div className="fixed bottom-6 right-6 z-[70] hidden md:flex flex-col items-end opacity-60 pointer-events-none select-none">
      <div className="font-hud text-xs text-text-dim tracking-wider">
        <ScrambleText text={currentPlace.place} duration={950} perpetual={true} />
      </div>
      <div className="font-hud text-xs text-text-dim tracking-wider mt-0.5">
        <ScrambleText text={currentPlace.coordinates} duration={950} perpetual={true} />
      </div>
    </div>
  );
}
