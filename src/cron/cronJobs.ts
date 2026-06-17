import cron from 'node-cron';
import { Token } from '../models/Token';
import { logger } from '../logger/logger';

export const startCronJobs = () => {
    cron.schedule('0 3 * * *', async () => {
        try {
            logger.info('Cron: cleaning up old refresh tokens');
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const result = await Token.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
            logger.info(`Cron: removed ${result.deletedCount} old tokens`);
        } catch (error: any) {
            logger.error(`Cron failed: ${error.message}`);
        }
    });
};