import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { StockService } from './stock.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [HttpModule, ScheduleModule.forRoot(), PrismaModule],
    controllers: [],
    providers: [StockService],
})
export class StockModule {}
