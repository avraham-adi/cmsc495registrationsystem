export const BASE_URL = process.env.API_TEST_BASE_URL || 'http://127.0.0.1:3000';
export const SERVER_ENTRY = process.env.API_TEST_SERVER_ENTRY || './backend/src/server.js';
export const SERVER_READY_TIMEOUT_MS = Number(process.env.API_TEST_READY_TIMEOUT_MS || 30000);
export const RUN_COURSE_SUITE = process.env.API_TEST_RUN_COURSES || 'true';
export const RUN_SECTION_SUITE = process.env.API_TEST_RUN_SECTIONS || 'true';
export const API_TEST_VERBOSE = process.env.API_TEST_VERBOSE === 'true';

export const ADMIN_USER = {
    email: process.env.API_TEST_ADMIN_EMAIL || 'hughe_caro201@guru.edu',
    password: process.env.API_TEST_ADMIN_PASSWORD || 'Caroline Hugheshughe_caro201@guru.edu',
};
