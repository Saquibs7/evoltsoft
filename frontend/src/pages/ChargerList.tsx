  import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useStationStore } from '../store/stationStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ChargerForm from '../components/ChargerForm';
import { Plus, Edit, Trash2, Filter, X } from 'lucide-react';

interface Station {
  _id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'Active' | 'Inactive';
  powerOutput: number;
  connectorType: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

const ChargerList = () => {
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
  
  const { user } = useAuthStore();
  
  const [showForm, setShowForm] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    getStations();
  }, [getStations]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleAddStation = () => {
    setCurrentStation(null);
    setShowForm(true);
  };

  const handleEditStation = (station: Station) => {
    setCurrentStation(station);
    setShowForm(true);
  };

  const handleDeleteStation = async (stationId: string) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      const result = await deleteStation(stationId);
      
      if (result.success) {
        toast.success('Station deleted successfully');
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
  };

  const clearFilters = () => {
    resetFilters();
    getStations();
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
          Charging Stations
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
        <>
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full card">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Power (kW)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Connector
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {stations.map((station) => (
                  <tr key={station._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {station.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {station.location.latitude.toFixed(4)}, {station.location.longitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          station.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {station.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {station.powerOutput}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {station.connectorType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user && station.createdBy && user._id === station.createdBy._id && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditStation(station)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {stations.map((station) => (
              <div key={station._id} className="card p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {station.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className={`text-sm font-medium ${
                      station.status === 'Active'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {station.status}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Power</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {station.powerOutput} kW
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Connector</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {station.connectorType}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {station.location.latitude.toFixed(2)}, {station.location.longitude.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {user && station.createdBy && user._id === station.createdBy._id && (
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => handleEditStation(station)}
                      className="btn-secondary py-1 px-3 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStation(station._id)}
                      className="btn-danger py-1 px-3 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
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

export default ChargerList;