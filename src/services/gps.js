export function createGpsService(geolocation = globalThis.navigator?.geolocation) {
  let watchId = null;
  return {
    start(onPosition, onError = () => {}) {
      if (!geolocation) throw new Error('Geolocation is unavailable');
      if (watchId !== null) return;
      watchId = geolocation.watchPosition(
        ({ coords, timestamp }) => onPosition({
          lat: coords.latitude,
          lon: coords.longitude,
          accuracyMeters: coords.accuracy,
          sogKnots: Number.isFinite(coords.speed) ? coords.speed / 0.514444 : null,
          cog: Number.isFinite(coords.heading) ? coords.heading : null,
          observedAt: timestamp,
        }),
        onError,
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
      );
    },
    stop() {
      if (watchId !== null) geolocation?.clearWatch(watchId);
      watchId = null;
    },
  };
}
