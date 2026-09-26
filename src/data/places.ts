export interface PlaceEntry {
  place: string;
  coordinates: string;
}

// Shown everywhere EXCEPT About Me (Carousel View & Project Ring View)
export const corePlaces: PlaceEntry[] = [
  { place: 'Jetpur, Gujarat', coordinates: '21.7548° N, 70.6231° E' },
  { place: 'Junagadh, Gujarat', coordinates: '21.5222° N, 70.4579° E' },
  { place: 'Bangalore, Karnataka', coordinates: '12.9716° N, 77.5946° E' },
];

// Shown ONLY in the About Me section (International places + Kerala, Tamil Nadu & Goa)
export const aboutPlaces: PlaceEntry[] = [
  { place: 'Kerala, Tamil Nadu', coordinates: '10.8505° N, 76.2711° E' },
  { place: 'Goa, India', coordinates: '15.2993° N, 74.1240° E' },
  { place: 'Bali, Indonesia', coordinates: '8.4095° S, 115.1889° E' },
  { place: 'Phuket, Thailand', coordinates: '7.8804° N, 98.3923° E' },
  { place: 'Krabi, Thailand', coordinates: '8.0863° N, 98.9063° E' },
  { place: 'Sentosa, Singapore', coordinates: '1.2494° N, 103.8303° E' },
  { place: 'Dubai, UAE', coordinates: '25.2048° N, 55.2708° E' },
];

export const places: PlaceEntry[] = [...corePlaces, ...aboutPlaces];
