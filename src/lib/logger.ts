import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');
const isServer = typeof window === 'undefined';

const logger = pino(
    {
        level: logLevel,
        // 浏览器端使用 pino 内置的 browser 模式，不需要 transport
        ...(isServer ? {} : { browser: { asObject: true } }),
    },
    // pino.transport 仅在 Node.js 服务端可用
    isServer && isDev
        ? pino.transport({
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss',
                  ignore: 'pid,hostname',
                  messageFormat: '{msg}',
              },
          })
        : undefined
);

export { logger };
