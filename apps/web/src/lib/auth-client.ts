import { createAuthClient } from "better-auth/react";

// Same-origin now that the API lives inside this Next.js app — no baseURL override needed
// (defaults to window.location.origin client-side).
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
