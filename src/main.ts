import { existsSync } from 'fs';
import logger from './utils/logger';
import { server } from './app';

// If the environment varialbes file is not found, set default values 
if (!existsSync('./.env')) {
  logger.warn('Environment varialbes file is not found, set default values');
  process.env.PORT      = '5000';
  process.env.RESOURCES = null;
  process.env.QUIZ_NAME = 'Memory Quiz';
  process.env.ROUNDS    = '10';
  process.env.NODE_ENV  = 'develop';

// If environment varaibles file is found, check all values. 
} else {
  if (!Number(process.env.PORT) || Number(process.env.PORT) < 0 || Number(process.env.PORT) > 65535) {
    process.env.PORT = '5000'
  }

  if (!existsSync(process.env.RESOURCES)) {
    logger.error('Resources folder not exists : %s', process.env.RESOURCES);
  }

  process.env.QUIZ_NAME = process.env.QUIZ_NAME || 'Memory Quiz';

  if (!Number(process.env.ROUNDS) || Number(process.env.ROUNDS) < 0) {
    process.env.ROUNDS = '10';
  }

  process.env.NODE_ENV = process.env.NODE_ENV || 'develop';
}

// Try to start the server
server.listen(Number(process.env.PORT || 5000), (error?: any) => {
  if (error) {
    logger.error('Server no listening', error);
  } else {
    logger.info('Server listening on port %s', process.env.PORT);
  }
});
