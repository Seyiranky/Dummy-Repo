const EARTH_RADIUS_KM = 6371;
const TRUST_WEIGHT = 0.5;
const DISTANCE_WEIGHT = 0.5;
const MAX_TRUST_SCORE = 5;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

exports.haversineDistanceKm = (pointA, pointB) => {
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

exports.rankCandidates = (gig, candidateWorkers) => {
  return candidateWorkers
    .map((worker) => {
      const distanceKm = exports.haversineDistanceKm(
        { lat: gig.locationLat, lng: gig.locationLng },
        { lat: worker.locationLat, lng: worker.locationLng },
      );
      const closeness = 1 / (1 + distanceKm);
      const trustNormalized = Math.min(worker.trustScore, MAX_TRUST_SCORE) / MAX_TRUST_SCORE;
      const score = trustNormalized * TRUST_WEIGHT + closeness * DISTANCE_WEIGHT;

      return { worker, distanceKm, score };
    })
    .sort((a, b) => b.score - a.score);
};
