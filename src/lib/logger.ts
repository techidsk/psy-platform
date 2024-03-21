// 记录用户操作记录工具
import pino from 'pino';

const logger = pino({
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                },
            },
        ],
    },
});

export { logger };
