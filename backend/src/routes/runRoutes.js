// backend/src/routes/runRoutes.js
// Express Router exposing Code Execution endpoints

const express = require('express');
const router = express.Router();
const { executeCode } = require('../services/codeExecutionService');

/**
 * POST /api/run
 * Accepts code, language, and optional stdin; executes and returns stdout/stderr/metrics
 */
router.post('/run', async (req, res) => {
  try {
    const { code, language = 'Python', stdin = '' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code string is required for execution.',
      });
    }

    const executionResult = await executeCode({
      code,
      language,
      stdin,
    });

    return res.json({
      success: true,
      data: executionResult,
    });
  } catch (err) {
    console.error('Execution error in /api/run:', err);
    return res.status(500).json({
      success: false,
      error: 'Code execution encountered an error.',
      details: err.message,
    });
  }
});

/**
 * POST /api/run/submit
 * Placeholder for evaluating against hidden test cases
 */
router.post('/submit', async (req, res) => {
  try {
    const { code, language = 'Python', stdin = '', testCases = [] } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Code is required.' });
    }

    // Run the code
    const executionResult = await executeCode({ code, language, stdin });
    return res.json({
      success: true,
      verdict: executionResult.status?.description || 'Executed',
      data: executionResult,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Submission error',
      details: err.message,
    });
  }
});

module.exports = router;
