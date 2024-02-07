/// <reference types="multer" />
import { FilesService } from './files.service';
import { User as UserEntity } from '../auth/user.entity';
import { File as FileEntity } from './file.entity';
export declare class FilesController {
    private filesService;
    constructor(filesService: FilesService);
    getFiles(user: UserEntity): Promise<FileEntity[]>;
    uploadFile(file: Express.Multer.File, name: string, user: UserEntity): Promise<any>;
    shareFile(fileId: number, usernames: string[], user: UserEntity): Promise<any>;
    getSharedUsers(fileId: number, user: UserEntity): Promise<any>;
}
