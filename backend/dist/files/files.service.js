"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const file_entity_1 = require("./file.entity");
const fileAccess_entity_1 = require("./fileAccess.entity");
const user_entity_1 = require("../auth/user.entity");
const config_1 = require("@nestjs/config");
const AWS = __importStar(require("aws-sdk"));
const typeorm_3 = require("typeorm");
let FilesService = class FilesService {
    constructor(configService, fileRepository, fileAccessRepository, userRepository) {
        this.configService = configService;
        this.fileRepository = fileRepository;
        this.fileAccessRepository = fileAccessRepository;
        this.userRepository = userRepository;
        this.s3 = new AWS.S3({
            region: this.configService.get('AWS_REGION'),
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        });
    }
    async uploadFile(file, name, userId) {
        const { originalname, buffer } = file;
        const uploadResult = await this.s3
            .upload({
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: `uploads/${userId}/${Date.now()}-${originalname}`,
            Body: buffer,
        })
            .promise();
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const newFile = this.fileRepository.create({
            name: name,
            filename: originalname,
            path: uploadResult.Key,
            size: buffer.length,
            user: user,
        });
        const savedFile = await this.fileRepository.save(newFile);
        const fileAccess = this.fileAccessRepository.create({
            file: savedFile,
            user: user,
        });
        await this.fileAccessRepository.save(fileAccess);
        return uploadResult;
    }
    async getFilesForUser(userId) {
        const accesses = await this.fileAccessRepository.createQueryBuilder('fileAccess')
            .leftJoinAndSelect('fileAccess.file', 'file')
            .leftJoinAndSelect('file.user', 'user')
            .where('fileAccess.user.id = :userId', { userId: userId })
            .orderBy('file.uploadDate', 'DESC')
            .getMany();
        const fileIds = accesses.map(access => access.file.id);
        const shareCounts = await this.fileAccessRepository.createQueryBuilder('fileAccess')
            .select('fileAccess.fileId', 'fileId')
            .addSelect('COUNT(fileAccess.userId)', 'total_shared')
            .where('fileAccess.fileId IN (:...fileIds)', { fileIds })
            .groupBy('fileAccess.fileId')
            .getRawMany();
        const shareCountLookup = shareCounts.reduce((acc, { fileId, total_shared }) => {
            acc[fileId] = total_shared - 1;
            return acc;
        }, {});
        const filesWithDetails = accesses.map(access => {
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
    async shareFile(fileId, newUsernames, ownerId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['user']
        });
        if (!file || file.user.id !== ownerId)
            throw new Error('File not found or not owned by the user.');
        const users = await this.userRepository.findBy({ username: (0, typeorm_3.In)(newUsernames) });
        const newUserIds = users.map(user => user.id);
        const currentAccesses = await this.fileAccessRepository.find({ where: { file: { id: fileId } }, relations: ['user'] });
        const currentAccessIds = currentAccesses.map(access => access.user.id);
        const idsToAdd = newUserIds.filter(id => !currentAccessIds.includes(id));
        const idsToRemove = currentAccessIds.filter(id => !newUserIds.includes(id));
        for (const idToAdd of idsToAdd) {
            const access = this.fileAccessRepository.create({
                file,
                user: { id: idToAdd }
            });
            await this.fileAccessRepository.save(access);
        }
        if (idsToRemove.length > 0) {
            await this.fileAccessRepository.delete({
                file: { id: fileId },
                user: { id: (0, typeorm_3.In)(idsToRemove) }
            });
        }
        return { message: 'File sharing updated successfully.' };
    }
    async getSharedUsersForFile(fileId, ownerId) {
        const accesses = await this.fileAccessRepository.find({
            where: { file: { id: fileId } },
            relations: ['user'],
        });
        const sharedUsers = accesses.map(access => access.user.username);
        return sharedUsers;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(file_entity_1.File)),
    __param(2, (0, typeorm_2.InjectRepository)(fileAccess_entity_1.FileAccess)),
    __param(3, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map