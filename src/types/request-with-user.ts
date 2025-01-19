export interface RequestWithUser {
    user: {
        id: number;
        role: string;
    };
    cookies: {
        [key: string]: string;
    };
}
