import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    jwtActivationSecret: process.env.JWT_ACTIVATION_SECRET || 'activation_secret',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000']
};