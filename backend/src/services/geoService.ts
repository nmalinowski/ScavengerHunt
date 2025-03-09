import { getDistance } from 'geolib';
import axios from 'axios';

export interface ClueLocation {
  latitude: number;
  longitude: number;
}

export interface ClueInput {
  description: string;
  address?: string; // Optional address input
  latitude?: number; // Optional direct lat/lon input
  longitude?: number;
}

// Calculate distance in miles between two points
export const calculateDistance = (pointA: ClueLocation, pointB: ClueLocation): number => {
  const distanceMeters = getDistance(
    { latitude: pointA.latitude, longitude: pointA.longitude },
    { latitude: pointB.latitude, longitude: pointB.longitude }
  );
  return distanceMeters / 1609.34; // Convert meters to miles
};

// Validate that all clues are within 20 miles of the first clue
export const validateClueLocations = (clues: ClueLocation[]): boolean => {
  if (clues.length <= 1) return true;

  const firstClue = clues[0];
  return clues.every(clue => {
    const distance = calculateDistance(firstClue, clue);
    return distance <= 20;
  });
};

// Convert address to latitude/longitude using Google Geocoding API
export const geocodeAddress = async (address: string): Promise<ClueLocation> => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Google API key is not configured');

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await axios.get<{ status: string; results: { geometry: { location: { lat: number; lng: number; }; }; }[]; }>(url);

  if (response.data.status !== 'OK' || !response.data.results[0]) {
    throw new Error(`Geocoding failed for address: ${address}`);
  }

  const { lat, lng } = response.data.results[0].geometry.location;
  return { latitude: lat, longitude: lng };
};