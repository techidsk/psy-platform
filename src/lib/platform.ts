import { db } from './db';

async function getAccessKey() {
    const setting = await db.platform_setting.findFirst({});

    if (!setting) {
        console.log('未找到平台配置');
        return null;
    }

    return setting;
}

export { getAccessKey };
