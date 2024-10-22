const express = require('express');
const Rule = require('../models/Rule'); // Import the Rule model
const {
    createRule,
    combineRules,
    evaluateRule,
    getRuleById
} = require('../controllers/ruleController');

const router = express.Router();

// Route to create a new rule
router.post('/create', createRule);

// Route to combine multiple rules
router.post('/combine', combineRules);

// Route to evaluate a rule against user data
router.post('/evaluate', evaluateRule);

router.get('/:id', getRuleById);

// Route to get all rules
router.get('/', async (req, res) => {
    try {
        // Fetch all rules from the database
        console.log("Hello");
        const rules = await Rule.find(); 
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});


module.exports = router;
