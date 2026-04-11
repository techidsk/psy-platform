import pino from 'pino';

// Fix garbled Chinese characters on Windows: terminal defaults to GBK, Node.js outputs UTF-8
if (process.platform === 'win32') {
    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');
}

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');

const logger = pino(
    {
        level: logLevel,
    },
    isDev
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
