/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './api/routes/auth.routes.js';
//import courseRoutes from './api/routes/course.routes.js';
//import enrollmentRoutes from './api/routes/enrollment.routes.js';
//import prerequisiteRoutes from './api/routes/prerequisite.routes.js';
//import sectionRoutes from './api/routes/section.routes.js';
import adminRoutes from './api/routes/admin.routes.js';

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// Route Mounting
app.use('/api/auth', authRoutes);
//app.use('/api/courses', courseRoutes);
//app.use('/api/enrollments', enrollmentRoutes);
//app.use('/api/prerequisites', prerequisiteRoutes);
//app.use('/api/sections', sectionRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route Not Found' });
});

// Central Error handler
app.use((err, req, res, next) => {
    //console.error(err);

    res.status(err.statusCode || err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

export default app;