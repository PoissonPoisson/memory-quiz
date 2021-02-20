import { existsSync } from 'fs';
import logger from './common/utils/logger';
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
  const port = Math.floor(Number(process.env.PORT));
  process.env.PORT = (!port || port < 0 || 65535 < port) ? '5000' : String(port);

  if (!existsSync(process.env.RESOURCES)) {
    logger.error('Resources folder not exists : %s', process.env.RESOURCES);
  }

  process.env.QUIZ_NAME = process.env.QUIZ_NAME || 'Memory Quiz';

  const rounds = Math.floor(Number(process.env.ROUNDS));
  process.env.ROUNDS = (!rounds || rounds < 0) ? '10' : String(rounds);

  process.env.NODE_ENV = process.env.NODE_ENV || 'develop';
}

// Try to start the server
server.listen(process.env.PORT, (error?: any) => {
  if (error) {
    logger.error('Server no listening', error);
  } else {
    logger.info('Server listening on port %s', process.env.PORT);
  }
});
