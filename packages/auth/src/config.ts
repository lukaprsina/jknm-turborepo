import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";

import "next-auth/jwt";

import { db } from "@acme/db/client";
import { Account, Session, User } from "@acme/db/schema";

import { env } from "../env";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

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
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "profile",
            "email",
            "https://www.googleapis.com/auth/admin.directory.user.readonly",
            "https://www.googleapis.com/auth/admin.directory.group.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, trigger, session, account }) {
      // console.error("JWTTTTTTTTTTTTTTTTTTTTT", { token, account });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      if (trigger === "update") token.name = session.user.name;
      if (account?.provider === "google") {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (token?.accessToken) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    /* jwt({ token, account }) {
      console.error("JWTTTTTTTTTTTTTTTTTTTTT", { token, account });

      return { ...token, accessToken: account.access_token };
      // if (account?.provider === "google") {}

      return token;
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

      console.log("SESSION ACCESS TOKEN", opts.token);
      // session.accessToken = opts.token.accessToken;
      return session;
    }, */
    /* signIn: ({ account, profile }) => {
      if (account?.provider != "google") return false;
      if (!(profile as GoogleProfile).email_verified) return false;

      // TODO: info@jknm.si
      if (!profile?.email?.endsWith("@jknm.si")) return false;
      return true;
    }, */
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
