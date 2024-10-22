const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    type: String, // "operator" or "operand"
    left: { type: mongoose.Schema.Types.Mixed, default: null },
    right: { type: mongoose.Schema.Types.Mixed, default: null },
    value: { type: String, default: null }
});

const ruleSchema = new mongoose.Schema({
    name: String,
    ast: nodeSchema,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rule', ruleSchema);
