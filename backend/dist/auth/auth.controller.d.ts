import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: {
        username: string;
        password: string;
    }): Promise<import("./user.entity").User>;
    login(body: {
        username: string;
        password: string;
    }): Promise<any>;
    getProfile(req: any): any;
}
