import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseService } from './database.service';
import { AuthController } from './auth/auth.controller';
import { EventsController } from './events/events.controller';
import { TicketsController } from './tickets/tickets.controller';
import { CorsairController } from './integrations/corsair.controller';
import { AnalyticsController } from './analytics/analytics.controller';
import { WalletController } from './wallet/wallet.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { StellarService } from './stellar/stellar.service';
import { AuthGuard } from './common/auth.guard';
import { RolesGuard } from './common/roles.guard';

import { ConfigModule } from '@nestjs/config';

import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  controllers: [
    AuthController,
    EventsController,
    TicketsController,
    CorsairController,
    AnalyticsController,
    WalletController,
    NotificationsController,
  ],
  providers: [
    DatabaseService,
    PrismaService,
    StellarService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
