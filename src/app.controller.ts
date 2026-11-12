
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  checkHealth() {
    return {
      status: 'OK',
      message: 'E-commerce backend is running!',
      timestamp: new Date().toISOString(),
    };
  }
}
