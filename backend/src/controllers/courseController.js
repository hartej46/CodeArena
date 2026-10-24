// backend/src/controllers/courseController.js
const courseService = require('../services/courseService');

/**
 * GET /api/courses
 */
async function list(req, res, next) {
  try {
    const courses = await courseService.listCourses(req.user.id);
    res.status(200).json({ data: courses });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/courses/:id
 */
async function getDetails(req, res, next) {
  try {
    const course = await courseService.getCourseDetails(req.params.id, req.user.id);
    res.status(200).json({ data: course });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/courses/:id/enroll
 */
async function enroll(req, res, next) {
  try {
    const enrollment = await courseService.enrollInCourse(req.params.id, req.user.id);
    res.status(201).json({ data: enrollment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getDetails,
  enroll,
};
