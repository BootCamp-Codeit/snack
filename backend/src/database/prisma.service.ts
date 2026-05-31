import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/** Docker/EC2는 process.env, 로컬은 ConfigService — 둘 다 지원 */
function resolveDatabaseUrl(configService: ConfigService): string {
  const raw =
    process.env.DATABASE_URL?.trim() ||
    configService.getOrThrow<string>('DATABASE_URL').trim();
  return raw.replace(/^["']|["']$/g, '');
}

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '').split('?')[0];
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

function createMariaDbAdapter(configService: ConfigService) {
  const databaseUrl = resolveDatabaseUrl(configService);
  const { host, port, user, password, database } =
    parseDatabaseUrl(databaseUrl);

  // AWS RDS: allowPublicKeyRetrieval 필수. $connect() 대신 첫 쿼리로 연결(prisma#28879).
  return new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    allowPublicKeyRetrieval: true,
    connectTimeout: 10_000,
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    super({ adapter: createMariaDbAdapter(configService) });
  }

  async onModuleInit() {
    try {
      const t0 = Date.now();
      await this.$queryRaw`SELECT 1`;
      this.logger.log(`Database ready (${Date.now() - t0}ms)`);
    } catch (error) {
      this.logger.error(
        'Database startup check failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
