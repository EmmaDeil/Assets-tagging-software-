/**
 * Maintenance Routes
 * 
 * API endpoints for maintenance record management.
 * Provides CRUD operations for maintenance history tracking.
 */

const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');

/**
 * Helper function to calculate next maintenance date based on period
 */
function calculateNextMaintenanceDate(lastDate, period) {
  if (!period || period === 'As Needed') return null;
  
  const date = new Date(lastDate);
  
  switch(period) {
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Every 3 Months':
    case 'Quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Every 6 Months':
    case 'Bi-annually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'Every 2 Years':
      date.setFullYear(date.getFullYear() + 2);
      break;
    default:
      return null;
  }
  
  return date;
}

/**
 * Helper function to update asset maintenance status
 */
async function updateAssetMaintenanceStatus(assetId) {
  try {
    const asset = await Equipment.findOne({ id: assetId });
    if (!asset) return;

    const now = new Date();
    const nextMaintenance = asset.nextScheduledMaintenance;

    if (!nextMaintenance) {
      asset.maintenanceStatus = 'Not Scheduled';
    } else {
      const daysUntilMaintenance = Math.ceil((nextMaintenance - now) / (1000 * 60 * 60 * 24));
      
      // Check for in-progress maintenance
      const inProgressMaintenance = await Maintenance.findOne({
        assetId: assetId,
        status: 'In Progress'
      });

      if (inProgressMaintenance) {
        asset.maintenanceStatus = 'In Progress';
      } else if (daysUntilMaintenance < 0) {
        asset.maintenanceStatus = 'Overdue';
      } else if (daysUntilMaintenance <= 7) {
        asset.maintenanceStatus = 'Due Soon';
      } else {
        asset.maintenanceStatus = 'Up to Date';
      }
    }

    await asset.save();
  } catch (error) {
    console.error('Error updating asset maintenance status:', error);
  }
}

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

/**
 * POST /api/maintenance/schedule
 * Create a scheduled maintenance and update asset
 */
router.post('/schedule', async (req, res) => {
  try {
    const maintenanceData = req.body;
    
    // Create new maintenance record with Scheduled status
    const newMaintenance = new Maintenance({
      ...maintenanceData,
      status: 'Scheduled',
      scheduledDate: maintenanceData.scheduledDate || maintenanceData.date,
    });
    
    await newMaintenance.save();

    // Update asset with next scheduled maintenance
    const asset = await Equipment.findOne({ id: maintenanceData.assetId });
    if (asset) {
      asset.nextScheduledMaintenance = newMaintenance.scheduledDate;
      asset.maintenanceDueNotificationSent = false;
      await asset.save();
      await updateAssetMaintenanceStatus(maintenanceData.assetId);
    }

    res.status(201).json(newMaintenance);
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to schedule maintenance',
      error: error.message 
    });
  }
});

/**
 * PUT /api/maintenance/:id/start
 * Start maintenance (change status to In Progress)
 */
router.put('/:id/start', async (req, res) => {
  try {
    const { technician, notes } = req.body;
    
    // First fetch the existing maintenance record
    const existingMaintenance = await Maintenance.findById(req.params.id);
    
    if (!existingMaintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Update the maintenance record
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        status: 'In Progress',
        startedDate: new Date(),
        technician: technician || existingMaintenance.technician,
        notes: notes || existingMaintenance.notes
      },
      { new: true, runValidators: true }
    );

    // Update asset status
    await updateAssetMaintenanceStatus(maintenance.assetId);

    res.json(maintenance);
  } catch (error) {
    console.error('Error starting maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to start maintenance',
      error: error.message 
    });
  }
});

/**
 * PUT /api/maintenance/:id/complete
 * Complete maintenance and create next scheduled maintenance
 */
router.put('/:id/complete', async (req, res) => {
  try {
    const { completedBy, notes, cost } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update maintenance to completed
    maintenance.status = 'Completed';
    maintenance.completedDate = new Date();
    maintenance.completedBy = completedBy || maintenance.technician;
    if (notes) maintenance.notes = notes;
    if (cost !== undefined) maintenance.cost = cost;

    await maintenance.save();

    // Update asset
    const asset = await Equipment.findOne({ id: maintenance.assetId });
    if (asset) {
      asset.lastMaintenanceDate = new Date();
      
      // Calculate and set next maintenance date
      if (asset.maintenancePeriod && asset.maintenancePeriod !== 'As Needed') {
        const nextDate = calculateNextMaintenanceDate(new Date(), asset.maintenancePeriod);
        asset.nextScheduledMaintenance = nextDate;
        maintenance.nextMaintenanceDate = nextDate;
        
        // Auto-create next scheduled maintenance
        if (nextDate) {
          const nextMaintenance = new Maintenance({
            assetId: asset.id,
            assetName: asset.name,
            date: nextDate,
            scheduledDate: nextDate,
            serviceType: maintenance.serviceType,
            technician: maintenance.technician,
            cost: 0,
            status: 'Scheduled',
            description: `Scheduled ${asset.maintenancePeriod} ${maintenance.serviceType}`,
          });
          
          await nextMaintenance.save();
        }
      }
      
      asset.maintenanceDueNotificationSent = false;
      await asset.save();
      await updateAssetMaintenanceStatus(maintenance.assetId);
    }

    await maintenance.save();

    res.json({
      message: 'Maintenance completed successfully',
      maintenance,
      nextMaintenanceDate: maintenance.nextMaintenanceDate
    });
  } catch (error) {
    console.error('Error completing maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to complete maintenance',
      error: error.message 
    });
  }
});

/**
 * PUT /api/maintenance/:id/not-started
 * Mark maintenance as not started (missed/rescheduled)
 */
router.put('/:id/not-started', async (req, res) => {
  try {
    const { notes, rescheduleDate } = req.body;
    
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Not Started',
        notes: notes || maintenance.notes,
        scheduledDate: rescheduleDate || maintenance.scheduledDate
      },
      { new: true, runValidators: true }
    );

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update asset
    if (rescheduleDate) {
      const asset = await Equipment.findOne({ id: maintenance.assetId });
      if (asset) {
        asset.nextScheduledMaintenance = rescheduleDate;
        await asset.save();
        await updateAssetMaintenanceStatus(maintenance.assetId);
      }
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Error marking maintenance as not started:', error);
    res.status(500).json({ 
      message: 'Failed to update maintenance status',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/due
 * Get maintenance due today or soon (within 7 days)
 */
router.get('/due/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const dueMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started'] },
      scheduledDate: { $gte: today, $lt: sevenDaysFromNow }
    }).sort({ scheduledDate: 1 });

    res.json(dueMaintenance);
  } catch (error) {
    console.error('Error fetching due maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to fetch due maintenance',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/overdue
 * Get overdue maintenance (past scheduled date and not completed)
 */
router.get('/overdue/list', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started', 'In Progress'] },
      scheduledDate: { $lt: today }
    }).sort({ scheduledDate: 1 });

    // Mark as overdue
    for (const maintenance of overdueMaintenance) {
      if (!maintenance.isOverdue) {
        maintenance.isOverdue = true;
        await maintenance.save();
      }
    }

    res.json(overdueMaintenance);
  } catch (error) {
    console.error('Error fetching overdue maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to fetch overdue maintenance',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/upcoming
 * Get upcoming scheduled maintenance
 */
router.get('/upcoming/list', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcomingMaintenance = await Maintenance.find({
      status: 'Scheduled',
      scheduledDate: { $gte: today, $lte: futureDate }
    }).sort({ scheduledDate: 1 });

    res.json(upcomingMaintenance);
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to fetch upcoming maintenance',
      error: error.message 
    });
  }
});

/**
 * GET /api/maintenance/records
 * Get completed maintenance records (history)
 */
router.get('/records/history', async (req, res) => {
  try {
    const { assetId, startDate, endDate, limit = 100 } = req.query;
    
    let query = { status: 'Completed' };
    
    if (assetId) {
      query.assetId = assetId;
    }
    
    if (startDate && endDate) {
      query.completedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Maintenance.find(query)
      .sort({ completedDate: -1 })
      .limit(parseInt(limit));

    res.json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance records',
      error: error.message 
    });
  }
});

/**
 * POST /api/maintenance/check-overdue
 * Cron job endpoint to check and mark overdue maintenance
 */
router.post('/check-overdue', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all maintenance that is past due
    const overdueMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started'] },
      scheduledDate: { $lt: today },
      isOverdue: false
    });

    // Mark as overdue and update asset status
    for (const maintenance of overdueMaintenance) {
      maintenance.isOverdue = true;
      await maintenance.save();
      await updateAssetMaintenanceStatus(maintenance.assetId);
    }

    res.json({
      message: `Marked ${overdueMaintenance.length} maintenance records as overdue`,
      count: overdueMaintenance.length
    });
  } catch (error) {
    console.error('Error checking overdue maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to check overdue maintenance',
      error: error.message 
    });
  }
});

module.exports = router;
