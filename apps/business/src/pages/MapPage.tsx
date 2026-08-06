import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  subscribeLocations,
  subscribeRentals,
  subscribeVehicles,
  type LocationUpdate,
  type Rental,
  type Vehicle,
} from '@fleetrentals/shared';
import { MapPin, RefreshCw } from 'lucide-react';

// Fix default marker icons in Leaflet + Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ locations }: { locations: LocationUpdate[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, map]);
  return null;
}

export function MapPage() {
  const [locations, setLocations] = useState<Record<string, LocationUpdate>>({});
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => subscribeLocations(setLocations), []);
  useEffect(() => subscribeRentals(setRentals), []);
  useEffect(() => subscribeVehicles(setVehicles), []);

  const activeRentals = rentals.filter((r) => r.status === 'active' || r.status === 'overdue');
  const locationList = Object.entries(locations).map(([uid, loc]) => {
    const rental = activeRentals.find((r) => r.customerId === uid);
    return { uid, loc, rental };
  }).filter((item) => item.rental);

  const defaultCenter: [number, number] = locationList.length > 0
    ? [locationList[0].loc.lat, locationList[0].loc.lng]
    : [39.8283, -98.5795]; // US center

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Map</h2>
          <p className="text-slate-400 text-sm">Customer locations for active rentals (emergency tracking)</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={16} className="text-green-400" />
          {locationList.length} active
        </div>
      </div>

      <div className="card p-0 overflow-hidden h-[60vh] min-h-[400px]">
        <MapContainer center={defaultCenter} zoom={10} className="h-full w-full" style={{ background: '#1e293b' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locationList.length > 0 && <FitBounds locations={locationList.map((l) => l.loc)} />}
          {locationList.map(({ uid, loc, rental }) => {
            const vehicle = vehicles.find((v) => v.id === rental?.vehicleId);
            return (
              <Marker key={uid} position={[loc.lat, loc.lng]} icon={customerIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{rental?.customerName}</p>
                    {vehicle && <p>{vehicle.year} {vehicle.make} {vehicle.model}</p>}
                    <p className="text-gray-500 text-xs">
                      Updated: {new Date(loc.updatedAt).toLocaleTimeString()}
                    </p>
                    {loc.accuracy && <p className="text-gray-500 text-xs">±{Math.round(loc.accuracy)}m</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {locationList.length === 0 && (
        <div className="card text-center py-8">
          <RefreshCw size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">No customer locations available.</p>
          <p className="text-sm text-slate-500 mt-1">
            Locations appear when customers use the app with location sharing enabled.
          </p>
        </div>
      )}

      {locationList.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3">Active Customers on Map</h3>
          <div className="space-y-2">
            {locationList.map(({ uid, loc, rental }) => {
              const vehicle = vehicles.find((v) => v.id === rental?.vehicleId);
              return (
                <div key={uid} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <p className="font-medium">{rental?.customerName}</p>
                    <p className="text-sm text-slate-400">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown vehicle'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(loc.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
