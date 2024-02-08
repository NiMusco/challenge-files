import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'files',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Careful with this in production!
    }),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FilesModule,
  ],
})
export class AppModule {}
