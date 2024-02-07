import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    loginUser(username: string, pass: string): Promise<any>;
    createUser(username: string, password: string): Promise<User | undefined>;
}
