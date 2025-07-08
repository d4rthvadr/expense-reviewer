"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secretKey = process.env.SESSION_SECRET || "secret";
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_KEY = "session";

type SessionPayload = {
  userId: string;
  email: string;
  expiresAt: number; // Unix timestamp in seconds
};

/**
 * Creates a new user session by encrypting the session data and storing it in an HTTP-only cookie.
 *
 * @param userId - The unique identifier of the user for whom the session is being created.
 * @param email - The email address of the user.
 * @returns A promise that resolves when the session cookie has been set.
 *
 * @remarks
 * - The session expires in 1 hour from the time of creation.
 * - The session data is encrypted before being stored in the cookie.
 * - The cookie is set as HTTP-only for security.
 *
 * @docs
 */
async function createSession(userId: string, email: string) {
  const expiredAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
  const session = await encrypt({
    userId,
    email,
    expiresAt: Math.floor(expiredAt.getTime() / 1000), // Convert to seconds
  });

  (await cookies()).set({
    name: SESSION_KEY,
    value: session,
    httpOnly: true,
  });
}

/**
 * Retrieves and decrypts the current user session from cookies.
 *
 * This function attempts to fetch the session cookie using the provided `SESSION_KEY`.
 * If the cookie is present, it tries to decrypt its value to obtain the session payload.
 * If decryption fails (e.g., due to tampering or expiration), the invalid cookie is deleted.
 *
 * @returns A promise that resolves to the session payload (`SessionPayload`) if available and valid, or `null` otherwise.
 */
async function getSession(): Promise<SessionPayload | null> {
  const sessionCookie = (await cookies()).get(SESSION_KEY);
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie.value);
  if (!session) {
    // If decryption fails, delete the invalid cookie
    console.warn("Invalid session cookie detected, deleting it.");
    await deleteSession();
  }

  return session;
}

async function deleteSession() {
  (await cookies()).delete(SESSION_KEY);
}

/**
 * Encrypts a session payload into a JWT (JSON Web Token) string using the HS256 algorithm.
 *
 * @param payload - The session payload to be encrypted into the JWT.
 * @returns A promise that resolves to the signed JWT string.
 *
 * @remarks
 * This function uses the `SignJWT` class to create and sign a JWT with the provided payload.
 * The JWT is signed using the HS256 algorithm and a secret key (`encodedKey`).
 *
 * @example
 * ```typescript
 * const token = await encrypt({ userId: "123", role: "admin" });
 * ```
 */
async function encrypt(payload: SessionPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(encodedKey);
  return jwt;
}

/**
 * Decrypts and verifies a JWT token to extract the session payload.
 *
 * @param token - The JWT token string to be decrypted and verified.
 * @returns A promise that resolves to the session payload if verification is successful, or `null` if verification fails.
 */
async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { createSession, deleteSession, getSession };
