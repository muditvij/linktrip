require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Linktrip API is running...');
});

// Database Connection Function
const connectDB = async () => {
    try {
        // Try connecting to default local environment
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linktrip';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB (Local/Atlas)');
    } catch (err) {
        console.log('⚠️ Failed to connect to standard MongoDB. Starting in-memory database for seamless development...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log('✅ Connected to MongoDB (In-Memory Fallback)');
        } catch (memoryErr) {
            console.error('❌ Critical Database Connection Error:', memoryErr);
            process.exit(1);
        }
    }
};

connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
