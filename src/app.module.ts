import { Module } from '@nestjs/common';
import {StockController} from "./stock/stock.controller";
import {HttpModule} from "@nestjs/axios";
import {StockService} from "./stock/stock.service";
import {PrismaModule} from "./prisma/prisma.module";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), PrismaModule],
  controllers: [StockController],
  providers: [StockService],
})
export class AppModule {}
