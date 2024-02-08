import { Controller, Get, Param, Post, Patch, Delete, Body, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '../auth/user.entity';
import { File as FileEntity } from './file.entity';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getFiles(@User() user: UserEntity): Promise<FileEntity[]> {
    return this.filesService.getFilesForUser(user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @User() user: UserEntity
  ) {

    if (!user.id) {
      throw new Error('User ID not found in the request');
    }

    return this.filesService.uploadFile(file, name, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async renameFile(
    @Param('id') fileId: number,
    @Body('name') newName: string,
    @User() user: UserEntity
  ): Promise<any> {
    if (!user.id) {
      throw new Error('User ID not found in the request');
    }

    return this.filesService.renameFile(fileId, newName, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteFile(
    @Param('id') fileId: number,
    @User() user: UserEntity
  ): Promise<any> {
    
    if (!user.id) {
      throw new Error('User ID not found in the request');
    }

    try {
      return await this.filesService.deleteFileOrRevokeAccess(fileId, user.id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post('share')
  @UseGuards(AuthGuard('jwt'))
  async shareFile(
    @Body('fileId') fileId: number,
    @Body('users') usernames: string[],
    @User() user: UserEntity
  ): Promise<any> {

    if (!user.id) {
      throw new Error('User ID not found in the request');
    }

    return this.filesService.shareFile(fileId, usernames, user.id);
  }

  @Get('share/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSharedUsers(@Param('id') fileId: number, @User() user: UserEntity): Promise<any> {
    // Validate that the requesting user has access or ownership of the file if necessary
    return this.filesService.getSharedUsersForFile(fileId, user.id);
  }
}
