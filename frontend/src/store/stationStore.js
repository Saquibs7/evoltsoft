import { create } from 'zustand';
import api from '../utils/api';

export const useStationStore = create((set, get) => ({
  stations: [],
  station: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    connectorType: '',
    minPower: '',
    maxPower: '',
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        status: '',
        connectorType: '',
        minPower: '',
        maxPower: '',
      },
    });
  },

  // Get all stations with optional filters
  getStations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.connectorType) queryParams.append('connectorType', filters.connectorType);
      if (filters.minPower) queryParams.append('minPower', filters.minPower);
      if (filters.maxPower) queryParams.append('maxPower', filters.maxPower);
      
      const queryString = queryParams.toString();
      const url = `/stations${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      set({ stations: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch stations',
        isLoading: false,
      });
    }
  },

  // Get a single station by ID
  getStationById: async (id) => {
    set({ isLoading: true, error: null, station: null });
    try {
      const response = await api.get(`/stations/${id}`);
      set({ station: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch station',
        isLoading: false,
      });
    }
  },

  // Create a new station
  createStation: async (stationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/stations', stationData);
      set({
        stations: [response.data, ...get().stations],
        isLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create station',
        isLoading: false,
      });
      return { success: false, message: error.response?.data?.message || 'Failed to create station' };
    }
  },

  // Update a station
  updateStation: async (id, stationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/stations/${id}`, stationData);
      
      // Update the stations array with the updated station
      set({
        stations: get().stations.map((station) =>
          station._id === id ? response.data : station
        ),
        station: response.data,
        isLoading: false,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update station',
        isLoading: false,
      });
      return { success: false, message: error.response?.data?.message || 'Failed to update station' };
    }
  },

  // Delete a station
  deleteStation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/stations/${id}`);
      
      // Remove the deleted station from the stations array
      set({
        stations: get().stations.filter((station) => station._id !== id),
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete station',
        isLoading: false,
      });
      return { success: false, message: error.response?.data?.message || 'Failed to delete station' };
    }
  },
}));