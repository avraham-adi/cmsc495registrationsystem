import dotenv from 'dotenv';
import app from './app.js';
import { close } from './db/connection.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});

const shutdown = async () => {
    console.log('\nShutting down server...');
    server.close(async () => {
        try {
            await close();
            console.log('Database connections closed.');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
