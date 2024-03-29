import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './file.entity';
import { FileAccess } from './fileAccess.entity';
import { User } from '../auth/user.entity';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { In, Brackets } from 'typeorm';

@Injectable()
export class FilesService {
  private s3;

  constructor(
    private configService: ConfigService,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(FileAccess)
    private fileAccessRepository: Repository<FileAccess>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.s3 = new AWS.S3({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    name: string,
    userId: number,
  ): Promise<any> {
    const { originalname, buffer } = file;

    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `uploads/${userId}/${Date.now()}-${originalname}`,
        Body: buffer,
      })
      .promise();

    // Find the user to associate with the file
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Create a new file entity with the upload result and associated user
    const newFile = this.fileRepository.create({
      name: name,
      filename: originalname,
      path: uploadResult.Key,
      size: buffer.length,
      user: user,
    });

    // Save the new file entity to the database
    const savedFile = await this.fileRepository.save(newFile);

    // And create FileAccess entry for the owner
    const fileAccess = this.fileAccessRepository.create({
      file: savedFile,
      user: user,
    });

    // Save the FileAccess entry to the database
    await this.fileAccessRepository.save(fileAccess);

    return uploadResult;
  }

  async getFilesForUser(userId: number): Promise<any[]> {
    // Find all file accesses for the user
    const accesses = await this.fileAccessRepository
      .createQueryBuilder('fileAccess')
      .leftJoinAndSelect('fileAccess.file', 'file')
      .leftJoinAndSelect('file.user', 'user')
      .where('fileAccess.user.id = :userId', { userId: userId })
      .orderBy('file.uploadDate', 'DESC')
      .getMany();

    // Collect file IDs for share count query
    const fileIds = accesses.map((access) => access.file.id);

    // Query to get share counts for each file
    const shareCounts = await this.fileAccessRepository
      .createQueryBuilder('fileAccess')
      .select('fileAccess.fileId', 'fileId')
      .addSelect('COUNT(fileAccess.userId)', 'total_shared')
      .where('fileAccess.fileId IN (:...fileIds)', { fileIds })
      .groupBy('fileAccess.fileId')
      .getRawMany();

    // Map share counts to a lookup object for easier access
    const shareCountLookup = shareCounts.reduce(
      (acc, { fileId, total_shared }) => {
        acc[fileId] = total_shared - 1;
        return acc;
      },
      {},
    );

    // Map the accesses to file details and include share count
    const filesWithDetails = accesses.map((access) => {
      const { file } = access;
      return {
        id: file.id,
        name: file.name,
        filename: file.filename,
        path: file.path,
        size: file.size,
        uploadDate: file.uploadDate,
        owner: {
          userId: file.user.id,
          username: file.user.username,
        },
        total_shared: shareCountLookup[file.id] || 0,
      };
    });

    return filesWithDetails;
  }

  async shareFile(
    fileId: number,
    newUsernames: string[],
    ownerId: number,
  ): Promise<any> {
    // Ensure the file exists and is owned by the user
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['user'],
    });

    if (!file || file.user.id !== ownerId)
      throw new Error('File not found or not owned by the user.');

    // Convert usernames to user IDs
    const users = await this.userRepository.findBy({
      username: In(newUsernames),
    });
    const newUserIds = users.map((user) => user.id);

    // Retrieve current FileAccess relations for the file
    const currentAccesses = await this.fileAccessRepository.find({
      where: { file: { id: fileId } },
      relations: ['user'],
    });
    const currentAccessIds = currentAccesses.map((access) => access.user.id);

    // Determine IDs to add
    const idsToAdd = newUserIds.filter((id) => !currentAccessIds.includes(id));

    // Determine IDs to remove
    const idsToRemove = currentAccessIds.filter(
      (id) => !newUserIds.includes(id),
    );

    // Add new accesses
    for (const idToAdd of idsToAdd) {
      const access = this.fileAccessRepository.create({
        file,
        user: { id: idToAdd },
      });
      await this.fileAccessRepository.save(access);
    }

    // Remove revoked accesses
    if (idsToRemove.length > 0) {
      await this.fileAccessRepository.delete({
        file: { id: fileId },
        user: { id: In(idsToRemove) },
      });
    }

    return { message: 'File sharing updated successfully.' };
  }

  async getSharedUsersForFile(fileId: number, userId?: number): Promise<string[]> {
    let queryBuilder = this.fileAccessRepository.createQueryBuilder('fileAccess')
        .leftJoinAndSelect('fileAccess.file', 'file')
        .leftJoinAndSelect('fileAccess.user', 'user')
        .where('fileAccess.file.id = :fileId', { fileId });

    // If userId is provided, modify the query to check if the user has access
    if (userId) {
        queryBuilder = queryBuilder
            .andWhere(new Brackets(qb => {
                qb.where('file.user.id = :userId', { userId })
                  .orWhere('fileAccess.user.id = :userId', { userId });
            }));
    }

    const accesses = await queryBuilder.getMany();

    // Map accesses to usernames or user entities as needed
    const sharedUsers = accesses.map((access) => access.user.username);

    return sharedUsers;
  }

  async deleteFileOrRevokeAccess(fileId: number, userId: number): Promise<any> {
    const fileAccess = await this.fileAccessRepository.findOne({
      where: { file: { id: fileId }, user: { id: userId } },
      relations: ['file', 'user'],
    });

    // Check if the file access exists
    if (!fileAccess) {
      throw new Error('File access not found.');
    }

    // Check if the current user is the owner of the file
    if (fileAccess.user.id === userId) {
      // If the user is the owner, delete the file and all associated accesses
      await this.fileAccessRepository.delete({ file: { id: fileId } });
      await this.fileRepository.delete({ id: fileId });

      // Also delete the file from AWS S3...
      await this.s3
        .deleteObject({
          Bucket: this.configService.get('AWS_BUCKET_NAME'),
          Key: fileAccess.file.path,
        })
        .promise();

      return { message: 'File and all accesses deleted successfully.' };
    } else {
      // If the user is not the owner, just remove their access
      await this.fileAccessRepository.delete({
        file: { id: fileId },
        user: { id: userId },
      });
      return { message: 'Access revoked successfully.' };
    }
  }

  async renameFile(
    fileId: number,
    newName: string,
    userId: number,
  ): Promise<any> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, user: { id: userId } },
    });

    if (!file) {
      throw new Error(
        'File not found or user does not have permission to rename this file.',
      );
    }

    file.name = newName;
    await this.fileRepository.save(file);

    return { message: 'File renamed successfully' };
  }
}
