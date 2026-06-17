import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import morgan from 'morgan';
import { config } from './config/config';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import { User } from './models/User';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';

import helmet from 'helmet';
import {logger} from "./logger/logger";
import {startCronJobs} from "./cron/cronJobs";
import compression from "compression";

const app = express();

app.use(helmet());
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const seedAdmin = async () => {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await User.create({
            name: 'Admin',
            surname: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            is_active: true
        });
        logger.info('Default Admin created (admin@gmail.com / admin)');
    }
};

let server: any;

mongoose.connect(config.mongoUri)
    .then(async () => {
        logger.info('Connected to MongoDB Atlas');
        await seedAdmin();
        startCronJobs();
        server = app.listen(config.port, () => {
            logger.info(`Server running on http://localhost:${config.port}`);
            logger.info(`Docs: http://localhost:${config.port}/api/docs`);
        });
    })
    .catch((error) => {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    });

const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Closing server...`);
    if (server) {
        server.close(async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed.');
            process.exit(0);
        });
    } else {
        await mongoose.connection.close();
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));