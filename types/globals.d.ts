export { }

declare global {
    // Create a type for the roles
    export type Roles = 'admin' | 'resident' | "watchman" | "not-assigned"

    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}