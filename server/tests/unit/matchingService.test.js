const { haversineDistanceKm, rankCandidates } = require('../../services/matchingService');

describe('matchingService.haversineDistanceKm', () => {
  test('returns 0 for identical points', () => {
    const point = { lat: -1.9536, lng: 30.0605 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  test('matches a known real-world distance within Kigali (~1.07km)', () => {
    const gigLocation = { lat: -1.9441, lng: 30.0619 };
    const workerLocation = { lat: -1.9536, lng: 30.0605 };
    const distance = haversineDistanceKm(gigLocation, workerLocation);
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(1.2);
  });

  test('is symmetric', () => {
    const a = { lat: -1.95, lng: 30.06 };
    const b = { lat: -1.94, lng: 30.09 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 10);
  });
});

describe('matchingService.rankCandidates', () => {
  const gig = { locationLat: -1.9441, locationLng: 30.0619 };

  test('returns an empty array for no candidates', () => {
    expect(rankCandidates(gig, [])).toEqual([]);
  });

  test('ranks a close, low-trust worker below a close, high-trust worker', () => {
    const nearby = { lat: -1.944, lng: 30.062 };
    const closeLowTrust = { id: 'a', trustScore: 0, locationLat: nearby.lat, locationLng: nearby.lng };
    const closeHighTrust = { id: 'b', trustScore: 5, locationLat: nearby.lat, locationLng: nearby.lng };

    const ranked = rankCandidates(gig, [closeLowTrust, closeHighTrust]);

    expect(ranked[0].worker.id).toBe('b');
    expect(ranked[1].worker.id).toBe('a');
  });

  test('a nearby, moderately-trusted worker can outrank a distant, perfectly-trusted one', () => {
    // Distance dominates once it's large enough that closeness ~0, since each
    // factor is capped at contributing 0.5 to the score (50/50 weighting).
    const nearby = { id: 'near', trustScore: 3, locationLat: -1.945, locationLng: 30.063 };
    const distant = { id: 'far', trustScore: 5, locationLat: -1.5, locationLng: 30.9 };

    const ranked = rankCandidates(gig, [distant, nearby]);

    expect(ranked[0].worker.id).toBe('near');
  });

  test('an equally-close perfect-trust worker outranks an equally-close zero-trust worker', () => {
    const spot = { lat: -1.945, lng: 30.063 };
    const zeroTrust = { id: 'zero', trustScore: 0, locationLat: spot.lat, locationLng: spot.lng };
    const maxTrust = { id: 'max', trustScore: 5, locationLat: spot.lat, locationLng: spot.lng };

    const ranked = rankCandidates(gig, [zeroTrust, maxTrust]);

    expect(ranked[0].worker.id).toBe('max');
  });

  test('includes distanceKm and score for each ranked entry', () => {
    const worker = { id: 'w1', trustScore: 2.5, locationLat: -1.95, locationLng: 30.06 };
    const [entry] = rankCandidates(gig, [worker]);

    expect(entry).toHaveProperty('distanceKm');
    expect(entry).toHaveProperty('score');
    expect(entry.distanceKm).toBeGreaterThan(0);
  });
});
