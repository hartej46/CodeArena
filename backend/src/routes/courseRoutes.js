// backend/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', courseController.list);
router.get('/:id', courseController.getDetails);
router.post('/:id/enroll', courseController.enroll);

module.exports = router;
