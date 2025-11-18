import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleKeepAlive() {
    this.logger.log('Keep-alive signal sent - Server is active');
    // Este cronjob simplemente registra un log para mantener el servidor activo
    // y evitar que se apague en Render (versión gratuita)
  }
}
