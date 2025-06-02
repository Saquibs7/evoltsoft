import express from 'express';
import {
  createStation,
  getStations,
  getStationById,
  updateStation,
  deleteStation,
} from '../controllers/stationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create and get all stations
router.route('/')
  .post(createStation)
  .get(getStations);

// Get, update, and delete a station by ID
router.route('/:id')
  .get(getStationById)
  .put(updateStation)
  .delete(deleteStation);

export default router;