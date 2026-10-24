// backend/src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard?courseId=
 */
async function getDashboard(req, res, next) {
  try {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId.trim() : null;
    const dashboard = await dashboardService.getDashboardData(req.user.id, courseId);
    res.status(200).json({ data: dashboard });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
};
