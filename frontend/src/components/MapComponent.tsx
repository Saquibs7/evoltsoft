import { forwardRef, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const highlightedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Use the stricter status type to match the rest of your project
interface Station {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
  powerOutput: number;
  connectorType: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface MapComponentProps {
  stations: Station[];
  highlightedStationId: string | null;
  onEdit: (station: Station) => void;
  onDelete: (stationId: string) => void;
}

const MapComponent = forwardRef((props: MapComponentProps, ref) => {
  const { stations, highlightedStationId, onEdit, onDelete } = props;
  const mapRef = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (position: LatLngTuple, zoom: number) => {
      mapRef.current?.flyTo(position, zoom);
    }
  }));

  // Default center (New York)
  const defaultCenter: LatLngTuple = [40.7128, -74.0060];

  // Calculate center if stations exist
  const center: LatLngTuple = stations.length > 0
    ? [stations[0].location.latitude, stations[0].location.longitude]
    : defaultCenter;

  return (
    <MapContainer 
      center={center}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {stations.map(station => (
        <Marker
          key={station._id}
          position={[station.location.latitude, station.location.longitude] as LatLngTuple}
          icon={station._id === highlightedStationId ? highlightedIcon : defaultIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{station.name}</h3>
              <p>Status: {station.status}</p>
              <p>Power: {station.powerOutput} kW</p>
              <p>Connector: {station.connectorType}</p>
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => onEdit(station)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(station._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export default MapComponent;