import { File } from './file.entity';
import { User } from '../auth/user.entity';
export declare class FileAccess {
    id: number;
    file: File;
    user: User;
}
