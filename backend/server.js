const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

// connect to mongodb and start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Try connecting to DB after server starts so Render doesn't kill the process early
  if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables!');
  } else {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
      });
  }
});
