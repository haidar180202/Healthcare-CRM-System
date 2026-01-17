import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class DlqController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('dlq')
  handleDlqMessage(@Payload() data: any) {
    console.log('Message in DLQ:', data);
  }
}