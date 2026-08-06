import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateLocation, getCustomerRentals } from '@fleetrentals/shared';

export function useLocationSharing() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !navigator.geolocation) return;

    let watchId: number;
    let rentalId: string | undefined;

    getCustomerRentals(user.uid).then((rentals) => {
      const active = rentals.find((r) => r.status === 'active' || r.status === 'overdue');
      rentalId = active?.id;
    });

    const update = (position: GeolocationPosition) => {
      updateLocation(user.uid, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        updatedAt: Date.now(),
        rentalId,
      });
    };

    watchId = navigator.geolocation.watchPosition(update, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);
}
