import { useState, useCallback } from 'react';

/**
 * Custom React hook for user-controlled browser geolocation
 * Strictly adheres to privacy principles:
 * - One-time request only on explicit user interaction
 * - No continuous background tracking
 * - Friendly graceful fallback on denial or unavailability
 */
export function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState('unavailable');
      setError('Geolocation is not supported by your browser. You can continue searching manually by city or area.');
      return;
    }

    setLoading(true);
    setPermissionState('requesting');
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        };
        setCoordinates(coords);
        setLoading(false);
        setPermissionState('granted');
        setError(null);
      },
      (err) => {
        setLoading(false);
        let message = 'Location access was unavailable. You can continue searching manually by city or area.';
        if (err.code === 1) {
          // PERMISSION_DENIED
          setPermissionState('denied');
          message = 'Location permission was denied. You can continue searching manually by city, specialty, or facility.';
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setPermissionState('unavailable');
          message = 'Your device could not determine current location. You can continue searching manually.';
        } else if (err.code === 3) {
          // TIMEOUT
          setPermissionState('unavailable');
          message = 'Location request timed out. You can retry or search manually.';
        } else {
          setPermissionState('error');
        }
        setError(message);
      },
      options
    );
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setLoading(false);
    setError(null);
    setPermissionState('idle');
  }, []);

  return {
    coordinates,
    loading,
    error,
    permissionState,
    requestLocation,
    clearLocation,
  };
}

export default useGeolocation;
