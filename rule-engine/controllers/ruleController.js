const Rule = require('../models/Rule');
const mongoose = require('mongoose');

// Function to parse the rule string into AST
const parseRuleToAST = (ruleString) => {
    // Enhanced tokenizer: capture conditions, operators, and parentheses
    const tokens = ruleString.match(/(\w+\s*(>|<|=)\s*'?\w+'?|AND|OR|\(|\))/g);

    if (!tokens || tokens.length === 0) {
        throw new Error('Invalid rule string: no valid tokens found');
    }

    const buildAST = (tokens) => {
        const outputStack = [];
        const operatorStack = [];

        const precedence = {
            'AND': 2,
            'OR': 1,
        };

        const applyOperator = () => {
            const operator = operatorStack.pop();
            const right = outputStack.pop();
            const left = outputStack.pop();
            outputStack.push({
                type: 'operator',
                operator,
                left,
                right,
            });
        };

        for (let token of tokens) {
            token = token.trim();

            if (/\w+\s*(>|<|=)\s*'?\w+'?/.test(token)) {
                // Operand condition, push to output stack
                outputStack.push({
                    type: 'operand',
                    value: token
                });
            } else if (token === '(') {
                // Left parenthesis, push to operator stack
                operatorStack.push(token);
            } else if (token === ')') {
                // Right parenthesis, resolve the expression inside parentheses
                while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                    applyOperator();
                }
                operatorStack.pop(); // Remove the '('
            } else if (token === 'AND' || token === 'OR') {
                // Operator: resolve based on precedence
                while (
                    operatorStack.length &&
                    precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                ) {
                    applyOperator();
                }
                operatorStack.push(token);
            } else {
                throw new Error('Invalid token encountered: ' + token);
            }
        }

        // Resolve remaining operators
        while (operatorStack.length) {
            applyOperator();
        }

        if (outputStack.length !== 1) {
            throw new Error('Invalid rule string: could not fully parse');
        }

        return outputStack[0]; // The final AST
    };

    return buildAST(tokens);
};

// Updated createRule controller
const createRule = (req, res) => {
    const ruleString = req.body.ruleString;
    try {
        const ast = parseRuleToAST(ruleString);
        const newRule = new Rule({ name: req.body.name, ast });
        newRule.save()
            .then(() => res.json({ message: 'Rule created successfully', rule: newRule }))
            .catch(err => res.status(400).json({ error: err.message }));
    } catch (err) {
        console.error('Error in rule creation:', err);
        res.status(400).json({ error: 'Failed to parse rule: ' + err.message });
    }
};

// Combine multiple rules into a single AST
const combineRules = (req, res) => {
    const rules = req.body.rules; // List of rule strings
    try {
        const combinedAST = combineRuleASTs(rules.map(parseRuleToAST)); // Parse and combine the rules
        res.json({ message: 'Rules combined successfully', ast: combinedAST });
    } catch (err) {
        res.status(400).json({ error: 'Failed to combine rules: ' + err.message });
    }
};

// Function to combine multiple ASTs into a single AST
const combineRuleASTs = (asts) => {
    // Combine the ASTs with an "AND" operator
    if (asts.length === 0) return null;
    if (asts.length === 1) return asts[0];

    const combinedAST = {
        type: 'operator',
        operator: 'AND',
        left: asts[0],
        right: combineRuleASTs(asts.slice(1))
    };

    return combinedAST;
};

// Evaluate a rule (AST) against user data
const evaluateRule = (req, res) => {
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { ast, userData } = req.body;

    if (!ast || !userData) {
        return res.status(400).json({ error: 'AST or user data is missing' });
    }

    try {
        const isValid = evaluateAST(ast, userData);  // Example function to evaluate AST
        res.json({ result: isValid });
    } catch (err) {
        console.error('Evaluation error:', err);
        res.status(400).json({ error: 'Failed to evaluate rule: ' + err.message });
    }
};


const evaluateAST = (ast, userData) => {
    if (!ast) throw new Error('Invalid AST');
    console.log('Evaluating AST node:', JSON.stringify(ast, null, 2)); // Log the AST node being evaluated
    
    if (ast.type === 'operator') {
        // This is a logical operator (AND, OR)
        const leftResult = evaluateAST(ast.left, userData);
        const rightResult = evaluateAST(ast.right, userData);

        console.log(`Left result: ${leftResult}, Right result: ${rightResult}`);

        switch (ast.operator) {
            case 'AND':
                return leftResult && rightResult; // Both must be true for AND
            case 'OR':
                return leftResult || rightResult; // At least one must be true for OR
            default:
                throw new Error(`Invalid logical operator: ${ast.operator}`);
        }
    } else if (ast.type === 'operand') {
        // Operand condition
        return evaluateCondition(ast, userData);
    } else {
        throw new Error(`Invalid AST node type: ${ast.type}`);
    }
};



const evaluateCondition = (condition, userData) => {
    const { value } = condition;

    // Extract field, operator, and comparison value from the condition string
    const match = value.match(/(\w+)\s*(>|<|=)\s*'?(.*)'?/);
    if (!match) {
        throw new Error(`Invalid condition format: ${value}`);
    }

    const field = match[1]; // Field name (e.g., 'age')
    const operator = match[2]; // Operator (e.g., '>')
    const comparisonValue = match[3].trim(); // Comparison value (e.g., '30')

    // Convert userData field value to the appropriate type for comparison
    const userValue = userData[field];

    if (userValue === undefined) {
        throw new Error(`Field "${field}" not found in user data`);
    }

    // Convert userValue to a number if it's a number comparison
    const numericUserValue = isNaN(userValue) ? userValue : Number(userValue);
    const numericComparisonValue = isNaN(comparisonValue) ? comparisonValue : Number(comparisonValue);

    switch (operator) {
        case '>':
            return numericUserValue > numericComparisonValue;
        case '<':
            return numericUserValue < numericComparisonValue;
        case '=':
            return numericUserValue === numericComparisonValue;
        default:
            throw new Error(`Invalid comparison operator: ${operator}`);
    }
};


const getRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        // Check if the ID is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid rule ID format' });
        }

        // Convert string ID to ObjectId for querying
        const rule = await Rule.findById(new mongoose.Types.ObjectId(id));

        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        res.json({ ast: rule.ast });  // Return the AST field
    } catch (error) {
        console.error('Error fetching rule by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Exporting all the controller functions
module.exports = {
    createRule,
    combineRules,
    evaluateRule,
    getRuleById
};
