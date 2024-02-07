/// <reference types="multer" />
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { FileAccess } from './fileAccess.entity';
import { User } from '../auth/user.entity';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private configService;
    private fileRepository;
    private fileAccessRepository;
    private userRepository;
    private s3;
    constructor(configService: ConfigService, fileRepository: Repository<File>, fileAccessRepository: Repository<FileAccess>, userRepository: Repository<User>);
    uploadFile(file: Express.Multer.File, name: string, userId: number): Promise<any>;
    getFilesForUser(userId: number): Promise<any[]>;
    shareFile(fileId: number, newUsernames: string[], ownerId: number): Promise<any>;
    getSharedUsersForFile(fileId: number, ownerId: number): Promise<any[]>;
}
