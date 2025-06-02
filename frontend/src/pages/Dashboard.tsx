import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore } from '../store/stationStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Battery, Zap, Activity } from 'lucide-react';

const Dashboard = () => {
  const { stations, isLoading, getStations } = useStationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getStations();
  }, [getStations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Calculate statistics
  const totalStations = stations.length;
  const activeStations = stations.filter(station => station.status === 'Active').length;
  const inactiveStations = totalStations - activeStations;
  
  // Calculate average power output
  const avgPower = stations.length > 0
    ? Math.round(stations.reduce((sum, station) => sum + station.powerOutput, 0) / totalStations)
    : 0;
  
  // Count connector types
  const connectorCounts = stations.reduce((acc, station) => {
    acc[station.connectorType] = (acc[station.connectorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your EV charging stations from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center mb-2">
            <MapPin className="text-blue-600 dark:text-blue-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Total Stations</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStations}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-2">
            <Activity className="text-green-600 dark:text-green-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Active Stations</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeStations}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-2">
            <Battery className="text-red-600 dark:text-red-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Inactive Stations</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{inactiveStations}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-2">
            <Zap className="text-yellow-600 dark:text-yellow-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Avg Power</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgPower} <span className="text-lg">kW</span></p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/chargers')}
            className="btn-primary"
          >
            View All Stations
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="btn-secondary"
          >
            Open Map View
          </button>
        </div>
      </div>

      {/* Connector Types Distribution */}
      {totalStations > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Connector Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(connectorCounts).map(([type, count]) => (
              <div key={type} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white">{type}</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count as number}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;