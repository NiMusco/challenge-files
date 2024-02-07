import { User } from '../auth/user.entity';
import { FileAccess } from '../files/fileAccess.entity';
export declare class File {
    id: number;
    name: string;
    filename: string;
    path: string;
    size: number;
    user: User;
    uploadDate: Date;
    accesses: FileAccess[];
}
