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
import { Order } from './models/Order';
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
    const adminExists = await User.findOne({ email: config.adminEmail || 'admin@gmail.com' });
    if (!adminExists) {
        await User.create({
            name: 'Admin',
            surname: 'Admin',
            email: config.adminEmail || 'admin@gmail.com',
            password: config.adminPassword || 'admin',
            role: 'admin',
            is_active: true
        });
    }
};

const migrateNumericIds = async () => {
    const Counter = mongoose.models.Counter || mongoose.model('Counter');

    const ordersWithoutId = await Order.find({ id: { $exists: false } }).sort({ created_at: 1 });
    if (ordersWithoutId.length > 0) {
        logger.info(`Migrating ${ordersWithoutId.length} orders to numeric IDs...`);
        const counterDoc = await Counter.findById('orderId');
        let seq = counterDoc ? (counterDoc as any).seq : 0;
        for (const order of ordersWithoutId) {
            seq += 1;
            order.id = seq;
            await order.save();
        }
        await Counter.findByIdAndUpdate(
            'orderId',
            { seq },
            { upsert: true }
        );
        logger.info('Orders migration completed.');
    }

    const usersWithoutId = await User.find({ id: { $exists: false } }).sort({ created_at: 1 });
    if (usersWithoutId.length > 0) {
        logger.info(`Migrating ${usersWithoutId.length} users to numeric IDs...`);
        const counterDoc = await Counter.findById('userId');
        let seq = counterDoc ? (counterDoc as any).seq : 0;
        for (const user of usersWithoutId) {
            seq += 1;
            user.id = seq;
            await user.save();
        }
        await Counter.findByIdAndUpdate(
            'userId',
            { seq },
            { upsert: true }
        );
        logger.info('Users migration completed.');
    }
};

let server: any;

mongoose.connect(config.mongoUri)
    .then(async () => {
        logger.info('Connected to MongoDB Atlas');
        await seedAdmin();
        await migrateNumericIds();
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