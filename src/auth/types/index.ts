export interface GoogleUser {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
}

export interface GoogleProfile {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: Array<{
        value: string;
        verified: boolean;
    }>;
    photos: Array<{
        value: string;
    }>;
}
