/*
Adi Avraham
CMSC495 Group Golf Capstone Project
app.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Builds the Express application with middleware, session wiring, routes, and error handling.
*/

/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';

import authRoutes from './api/routes/auth.routes.js';
import courseRoutes from './api/routes/course.routes.js';
import enrollmentRoutes from './api/routes/enrollment.routes.js';
import prerequisiteRoutes from './api/routes/prerequisite.routes.js';
import sectionRoutes from './api/routes/section.routes.js';
import adminRoutes from './api/routes/admin.routes.js';
import semesterRoutes from './api/routes/semester.routes.js';
import { config as sessionConfig } from './config/session.config.js';

const app = express();

// Trust the upstream platform proxy so secure session cookies can be issued in production.
app.set('trust proxy', 1);

// Core middleware
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(session(sessionConfig()));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// Route Mounting
app.use('/user', authRoutes);
app.use('/section', sectionRoutes);
app.use('/course', courseRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/prerequisite', prerequisiteRoutes);
app.use('/admin', adminRoutes);
app.use('/semester', semesterRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route Not Found' });
});

// Central Error handler
app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    const payload = {
        error: err.message || 'Internal Server Error',
    };

    if (err.code) {
        payload.code = err.code;
    }

    if (err.details) {
        payload.details = err.details;
    }

    res.status(status).json(payload);
});

export default app;
