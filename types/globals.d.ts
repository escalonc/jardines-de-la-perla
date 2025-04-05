export { }

declare global {
    // Create a type for the roles
    export type Roles = 'admin' | 'resident' | "watchman"

    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}