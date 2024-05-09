import { db } from './db';
import { logger } from './logger';

async function getAccessKey() {
    const setting = await db.platform_setting.findFirst({});

    if (!setting) {
        logger.error('未找到平台配置');
        return null;
    }

    return setting;
}

export { getAccessKey };
