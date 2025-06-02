import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useStationStore } from '../store/stationStore';
import LoadingSpinner from '../components/LoadingSpinner';
import MapComponent from '../components/MapComponent';
import ChargerForm from '../components/ChargerForm';
import { Plus, Filter, X } from 'lucide-react';
interface Station {
  _id: string;
  name: string;
  status: 'Active' | 'Inactive'; // or string if you want
  powerOutput: number;
  connectorType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
}

const ChargerMap = () => {
  const { 
    stations, 
    isLoading, 
    getStations, 
    createStation, 
    updateStation, 
    deleteStation,
    filters,
    setFilters,
    resetFilters
  } = useStationStore();
  
  const [showForm, setShowForm] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [highlightedStationId, setHighlightedStationId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    getStations();
  }, [getStations]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fly to station when highlighted
  useEffect(() => {
    if (highlightedStationId && mapRef.current) {
      const station = stations.find(s => s._id === highlightedStationId);
      if (station) {
        mapRef.current.flyTo([
          station.location.latitude,
          station.location.longitude
        ], 15);
      }
    }
  }, [highlightedStationId, stations]);

  // Highlight stations when filters change
  useEffect(() => {
    if (filters.status || filters.connectorType || filters.minPower || filters.maxPower) {
      setHighlightedStationId(null); // Clear individual highlight
    } else {
      setHighlightedStationId(null);
    }
  }, [filters]);

  const handleAddStation = () => {
    setCurrentStation(null);
    setShowForm(true);
  };

  const handleEditStation = (station: Station) => {
    setCurrentStation(station);
    setShowForm(true);
    setHighlightedStationId(station._id);
  };

  const handleDeleteStation = async (stationId: string) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      const result = await deleteStation(stationId);
      
      if (result.success) {
        toast.success('Station deleted successfully');
        if (highlightedStationId === stationId) {
          setHighlightedStationId(null);
        }
      } else {
        toast.error(result.message || 'Failed to delete station');
      }
    }
  };

  const handleFormSubmit = async (stationData: Omit<Station, '_id'>) => {
    if (currentStation) {
      return await updateStation(currentStation._id, stationData);
    } else {
      return await createStation(stationData);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    setFilters(localFilters);
    getStations();
    setShowFilters(false);
    setHighlightedStationId(null);
  };

  const clearFilters = () => {
    resetFilters();
    getStations();
    setShowFilters(false);
    setHighlightedStationId(null);
  };

  // Get filtered stations that match the criteria
  const getFilteredStations = () => {
    return stations.filter((station: { status: any; connectorType: any; powerOutput: number; }) => {
      const matchesStatus = filters.status ? station.status === filters.status : true;
      const matchesConnector = filters.connectorType ? station.connectorType === filters.connectorType : true;
      const matchesMinPower = filters.minPower ? station.powerOutput >= Number(filters.minPower) : true;
      const matchesMaxPower = filters.maxPower ? station.powerOutput <= Number(filters.maxPower) : true;
      
      return matchesStatus && matchesConnector && matchesMinPower && matchesMaxPower;
    });
  };

  const filteredStations = getFilteredStations();

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
          Charging Stations Map
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={handleAddStation}
            className="btn-primary flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Station
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                name="status"
                value={localFilters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="connectorType" className="form-label">Connector Type</label>
              <select
                id="connectorType"
                name="connectorType"
                value={localFilters.connectorType}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="Type1">Type 1</option>
                <option value="Type2">Type 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="minPower" className="form-label">Min Power (kW)</label>
              <input
                type="number"
                id="minPower"
                name="minPower"
                value={localFilters.minPower}
                onChange={handleFilterChange}
                className="form-input"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="maxPower" className="form-label">Max Power (kW)</label>
              <input
                type="number"
                id="maxPower"
                name="maxPower"
                value={localFilters.maxPower}
                onChange={handleFilterChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : stations.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No charging stations found.</p>
          <button
            onClick={handleAddStation}
            className="btn-primary inline-flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Your First Station
          </button>
        </div>
      ) : (
        <div className="card">
          <MapComponent 
            ref={mapRef}
            stations={filteredStations}
            highlightedStationId={highlightedStationId}
            onEdit={handleEditStation}
            onDelete={handleDeleteStation}
          />
        </div>
      )}

      {/* Charger Form Modal */}
      {showForm && (
        <ChargerForm
          station={currentStation || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          isEdit={!!currentStation}
        />
      )}
    </div>
  );
};

export default ChargerMap;