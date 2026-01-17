import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from './prisma/prisma.service';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('CHAT_DLQ_SERVICE') private readonly dlqClient: ClientProxy,
  ) {}

  async saveMessage(data: any) {
    const { id, chatRoomId, content, senderId, attachment } = data;
    const isProcessed = await this.cacheManager.get(`message:${id}`);
    if (isProcessed) {
      return;
    }
    for (let i = 0; i < 3; i++) {
      try {
        const message = await this.prisma.message.create({
          data: {
            id,
            chatRoomId,
            content,
            senderId,
            attachment,
          },
        });
        await this.cacheManager.set(`message:${id}`, true, 3600);
        return message;
      } catch (error) {
        if (i === 2) {
          this.dlqClient.emit('dlq', data);
        }
      }
    }
  }
}