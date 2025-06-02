import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X, Search } from 'lucide-react';
import { useMap as useLeafletMap } from 'react-leaflet';

interface Location {
  latitude: number;
  longitude: number;
}

interface Station {
  _id?: string;
  name: string;
  location: Location;
  status: 'Active' | 'Inactive';
  powerOutput: number;
  connectorType: string;
}
// interface MapControllerProps {
//   center: [number, number];
//   zoom: number;
// }
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);

  return null;
};

interface ChargerFormProps {
  station?: Station;
  onSubmit: (stationData: Omit<Station, '_id'>) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
  isEdit?: boolean;
}

const defaultStation: Omit<Station, '_id'> = {
  name: '',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
  },
  status: 'Active',
  powerOutput: 0,
  connectorType: 'Type2',
};

// Location marker component
const LocationMarker = ({ position, onLocationChange }: { 
  position: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
}) => {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return <Marker position={position} />;
};

const ChargerForm: React.FC<ChargerFormProps> = ({
  station,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<Omit<Station, '_id'>>(
    station || defaultStation
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    station?.location.latitude || defaultStation.location.latitude,
    station?.location.longitude || defaultStation.location.longitude,
  ]);

  useEffect(() => {
    if (station) {
      setFormData(station);
      setMapPosition([station.location.latitude, station.location.longitude]);
    }
  }, [station]);

   const handleSearch = async () => {
  if (!searchQuery.trim()) {
    toast.error('Please enter a location to search');
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
    );
    
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    if (data.length === 0) {
      toast.error('Location not found');
      return;
    }

    // Use the first result
    const { lat, lon } = data[0];
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    setMapPosition([latitude, longitude]);
    setFormData({
      ...formData,
      location: { latitude, longitude },
    });
    
  } catch (error) {
    toast.error('Error searching location');
    console.error(error);
  }
};
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'powerOutput') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    setFormData({
      ...formData,
      location: {
        latitude: lat,
        longitude: lng,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }

      if (formData.powerOutput <= 0) {
        toast.error('Power output must be greater than 0');
        return;
      }

      const result = await onSubmit(formData);
      
      if (result.success) {
        toast.success(isEdit ? 'Station updated successfully' : 'Station created successfully');
        onCancel();
      } else {
        toast.error(result.message || 'An error occurred');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEdit ? 'Edit Charging Station' : 'Add Charging Station'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="form-label">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="form-label">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Power Output Field */}
      <div>
        <label htmlFor="powerOutput" className="form-label">
          Power Output (kW)
        </label>
        <input
          type="number"
          id="powerOutput"
          name="powerOutput"
          value={formData.powerOutput}
          onChange={handleChange}
          className="form-input"
          step="0.1"
          min="0"
          required
        />
      </div>

      {/* Connector Type Field */}
      <div>
        <label htmlFor="connectorType" className="form-label">
          Connector Type
        </label>
        <select
          id="connectorType"
          name="connectorType"
          value={formData.connectorType}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="Type1">Type 1</option>
          <option value="Type2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>
      </div>
    </div>

    <div className="space-y-4">
      {/* Location Search */}
      <div>
        <label htmlFor="locationSearch" className="form-label">
          Search Location
        </label>
        <div className="flex">
          <input
            type="text"
            id="locationSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter address or place name"
            className="form-input rounded-r-none flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md flex items-center"
          >
            <Search size={18} className="mr-1" />
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div>
        <label className="form-label">
          Location (Click on map to set location)
        </label>
        <div className="h-[300px] rounded-lg overflow-hidden border dark:border-gray-700">
           <MapContainer
                    center={mapPosition}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <MapController center={mapPosition} zoom={13} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={mapPosition}
                      onLocationChange={handleLocationChange}
                    />
                  </MapContainer>
        </div>
        
        {/* Coordinates Display */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="form-label">Latitude</label>
            <input
              type="text"
              value={formData.location.latitude.toFixed(6)}
              className="form-input"
              readOnly
            />
          </div>
          <div>
            <label className="form-label">Longitude</label>
            <input
              type="text"
              value={formData.location.longitude.toFixed(6)}
              className="form-input"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Form Buttons */}
  <div className="flex justify-end space-x-3 mt-6">
    <button
      type="button"
      onClick={onCancel}
      className="btn-secondary"
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button
      type="submit"
      className="btn-primary"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
    </button>
  </div>
</form>
      </div>
    </div>
  );
};

export default ChargerForm;
// Import from react-leaflet

function useMap() {
  return useLeafletMap();
}
