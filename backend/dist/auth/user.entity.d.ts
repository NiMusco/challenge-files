import { File } from '../files/file.entity';
export declare class User {
    id: number;
    username: string;
    password: string;
    files: File[];
}
