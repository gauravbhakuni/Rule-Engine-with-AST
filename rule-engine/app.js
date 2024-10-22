const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ruleRoutes = require('./routes/ruleRoutes'); // Ensure the correct path to your routes file
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/rule-engine', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Connection error:', err));

// API Routes
app.use('/api/rules', ruleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/rules/:id`);
});
