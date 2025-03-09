import { validateClueLocations } from '../services/geoService';

describe('GeoService', () => {
  it('validates clues within 20 miles', () => {
    const clues = [
      { latitude: 40.7128, longitude: -74.0060 }, // NYC
      { latitude: 40.7357, longitude: -74.1724 }, // Newark (~10 miles)
    ];
    expect(validateClueLocations(clues)).toBe(true);
  });
});
