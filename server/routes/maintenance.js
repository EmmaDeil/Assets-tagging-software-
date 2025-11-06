/**
 * Maintenance Routes
 * 
 * API endpoints for maintenance record management.
 * Provides CRUD operations for maintenance history tracking.
 */

const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');

/**
 * GET /api/maintenance
 * Get all maintenance records or filter by assetId
 */
router.get('/', async (req, res) => {
  try {
    const { assetId, status, serviceType, limit } = req.query;
    let query = {};

    // Filter by asset ID if provided
    if (assetId) {
      query.assetId = assetId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by service type if provided
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Build the query with optional limit
    let maintenanceQuery = Maintenance.find(query).sort({ date: -1 });

    if (limit) {
      maintenanceQuery = maintenanceQuery.limit(parseInt(limit));
    }

    const maintenanceRecords = await maintenanceQuery;

    res.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance records',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/:id
 * Get a single maintenance record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance record',
      error: error.message 
    });
  }
});

/**
 * POST /api/maintenance
 * Create a new maintenance record
 */
router.post('/', async (req, res) => {
  try {
    const maintenanceData = req.body;

    // Create new maintenance record
    const newMaintenance = new Maintenance(maintenanceData);
    await newMaintenance.save();

    res.status(201).json(newMaintenance);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      message: 'Failed to create maintenance record',
      error: error.message 
    });
  }
});

/**
 * PUT /api/maintenance/:id
 * Update an existing maintenance record
 */
router.put('/:id', async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    const updates = req.body;

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      maintenanceId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedMaintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(updatedMaintenance);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      message: 'Failed to update maintenance record',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/maintenance/:id
 * Delete a maintenance record
 */
router.delete('/:id', async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    const deletedMaintenance = await Maintenance.findByIdAndDelete(maintenanceId);

    if (!deletedMaintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({ 
      message: 'Maintenance record deleted successfully',
      maintenance: deletedMaintenance 
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ 
      message: 'Failed to delete maintenance record',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/stats/:assetId
 * Get maintenance statistics for a specific asset
 */
router.get('/stats/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;

    const stats = await Maintenance.aggregate([
      { $match: { assetId: assetId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' },
          statusCounts: {
            $push: '$status'
          },
          serviceTypeCounts: {
            $push: '$serviceType'
          }
        }
      }
    ]);

    res.json(stats[0] || { 
      totalRecords: 0, 
      totalCost: 0, 
      avgCost: 0,
      statusCounts: [],
      serviceTypeCounts: []
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance statistics',
      error: error.message 
    });
  }
});

module.exports = router;
