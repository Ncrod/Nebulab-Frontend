"use client";

import { api, login, logout, saveSession, type Session } from "./api";

// The shopper's account: sign up, sign in, sign out and password reset. The tokens live in "nebulab-session".

/** Creates the account and leaves the session started. Throws ApiError (email taken, weak password...). */
export async function signUpCustomer(name: string, email: string, password: string): Promise<Session> {
  const session = await api<Session>("/auth/register/", { method: "POST", body: { name: name.trim(), email: email.trim(), password } });
  saveSession("customer", session);
  return session;
}

/** Throws ApiError (401 "Wrong email or password.") when the credentials are wrong. */
export async function signInCustomer(email: string, password: string): Promise<Session> {
  const session = await login(email.trim(), password);
  saveSession("customer", session);
  return session;
}

export const signOutCustomer = () => logout("customer");

/** The server answers the same whether or not the email has an account. */
export async function requestPasswordReset(email: string): Promise<void> {
  await api<void>("/auth/password-reset/", { method: "POST", body: { email: email.trim() } });
}

/**
 * Sets a new password from the link emailed by `requestPasswordReset`. Throws ApiError: a bad or expired `token`
 * answers under `detail` ("This link is invalid or has expired."), a weak password under `password`.
 */
export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  await api<void>("/auth/password-reset/confirm/", { method: "POST", body: { token, password } });
}
