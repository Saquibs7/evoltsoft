import ChargingStation from '../models/ChargingStation.js';

// @desc    Create a new charging station
// @route   POST /api/stations
// @access  Private
export const createStation = async (req, res) => {
  const { name, location, status, powerOutput, connectorType } = req.body;

  const station = await ChargingStation.create({
    name,
    location,
    status,
    powerOutput,
    connectorType,
    createdBy: req.user._id,
  });

  res.status(201).json(station);
};

// @desc    Get all charging stations with optional filters
// @route   GET /api/stations
// @access  Private
export const getStations = async (req, res) => {
  const { status, connectorType, minPower, maxPower } = req.query;

  // Build filter object
  const filter = {};

  // Add status filter if provided
  if (status) {
    filter.status = status;
  }

  // Add connector type filter if provided
  if (connectorType) {
    // Support comma-separated list of connector types
    const connectorTypes = connectorType.split(',');
    filter.connectorType = { $in: connectorTypes };
  }

  // Add power output range filter if provided
  if (minPower || maxPower) {
    filter.powerOutput = {};
    if (minPower) filter.powerOutput.$gte = Number(minPower);
    if (maxPower) filter.powerOutput.$lte = Number(maxPower);
  }

  const stations = await ChargingStation.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');

  res.json(stations);
};

// @desc    Get a single charging station by ID
// @route   GET /api/stations/:id
// @access  Private
export const getStationById = async (req, res) => {
  const station = await ChargingStation.findById(req.params.id).populate(
    'createdBy',
    'name email'
  );

  if (station) {
    res.json(station);
  } else {
    res.status(404).json({ message: 'Charging station not found' });
  }
};

// @desc    Update a charging station
// @route   PUT /api/stations/:id
// @access  Private
export const updateStation = async (req, res) => {
  const { name, location, status, powerOutput, connectorType } = req.body;

  const station = await ChargingStation.findById(req.params.id);

  if (!station) {
    res.status(404).json({ message: 'Charging station not found' });
    return;
  }

  // Check if user is the creator of the station
  if (station.createdBy.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'Not authorized to update this station' });
    return;
  }

  // Update station fields
  station.name = name || station.name;
  station.location = location || station.location;
  station.status = status || station.status;
  station.powerOutput = powerOutput || station.powerOutput;
  station.connectorType = connectorType || station.connectorType;

  const updatedStation = await station.save();
  res.json(updatedStation);
};

// @desc    Delete a charging station
// @route   DELETE /api/stations/:id
// @access  Private
export const deleteStation = async (req, res) => {
  const station = await ChargingStation.findById(req.params.id);

  if (!station) {
    res.status(404).json({ message: 'Charging station not found' });
    return;
  }

  // Check if user is the creator of the station
  if (station.createdBy.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'Not authorized to delete this station' });
    return;
  }

  await ChargingStation.deleteOne({ _id: req.params.id });
  res.json({ message: 'Station deleted successfully' });
};