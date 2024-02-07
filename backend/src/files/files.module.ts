import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from '../files/file.entity';
import { FileAccess } from '../files/fileAccess.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, FileAccess, User])],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
