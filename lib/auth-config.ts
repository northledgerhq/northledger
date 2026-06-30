export const authCookieName = "northledger_session";

export const demoUser = {
  email: "admin@northledger.local",
  password: "admin123456"
};

export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }
  return "northledger-local-dev-secret-change-me";
}
