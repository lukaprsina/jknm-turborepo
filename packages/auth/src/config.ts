import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";

import "next-auth/jwt";

import { db } from "@acme/db/client";
import { Account, Session, User } from "@acme/db/schema";

import { env } from "../env";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/* declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
} */

const adapter = DrizzleAdapter(db, {
  usersTable: User,
  accountsTable: Account,
  sessionsTable: Session,
});

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // TODO: In development, we need to skip checks to allow Expo to work
  /* ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {}), */

  secret: env.AUTH_SECRET,
  providers: [
    Google({
      /* clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET, */
      authorization: {
        params: {
          /* prompt: "consent",
          access_type: "offline",
          response_type: "code", */
          scope: ["openid", "profile", "email"].join(" "),
        },
      },
    }),
  ],
  /* session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }, */
  callbacks: {
    /* async jwt(opts) {
      const { token, account } = opts;

      console.log("jwt: -------", opts);
      const expires_at = token.expires_at as number;

      if (account) {
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };
      } else if (Date.now() < expires_at * 1000) {
        // Subsequent logins, but the `access_token` is still valid
        return token;
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        const refresh_token = token.refresh_token as string;
        if (!refresh_token) throw new TypeError("Missing refresh_token");

        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: env.AUTH_GOOGLE_ID,
              client_secret: env.AUTH_GOOGLE_SECRET,
              grant_type: "refresh_token",
              refresh_token,
            }),
          });

          const tokensOrError = (await response.json()) as unknown;

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in,
          );
          // Some providers only issue refresh tokens once, so preserve if we did not get a new one
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token;
          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError";
          return token;
        }
      }
    }, */
    signIn: ({ account, profile }) => {
      if (account?.provider != "google") return false;
      if (!(profile as GoogleProfile).email_verified) return false;
      // TODO: info@jknm.si
      if (!profile?.email?.endsWith("@jknm.si")) return false;
      return true;
    },
    session: (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      const session = {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };

      return session;
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};
