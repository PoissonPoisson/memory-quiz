import { createLogger, error, format, transports } from 'winston';

require('dotenv').config();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    format.errors({ stack: true }),
    format.splat(),
    format.json()),
    transports: [
      new transports.File({ filename: 'info.log', level: 'info' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
      format.errors({ stack: false })
    )
  }));
}

export default logger;
