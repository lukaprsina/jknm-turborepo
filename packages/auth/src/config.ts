import fs_promises from "fs/promises";
import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { skipCSRFCheck } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";

import { db } from "@acme/db/client";
import { Account, Session, User } from "@acme/db/schema";

import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // token?: string;
    } & DefaultSession["user"];
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
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {}),
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
  callbacks: {
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

      /* console.log("session", opts.token);
      // @ts-expect-error lol
      session.user.token = opts.token.access_token as string; */

      console.log("afafasfasfasfsaf", opts, session);

      return session;
    },
    async jwt({ token, account }) {
      console.warn("jwt", { token, account });
      await fs_promises.writeFile(
        "D:/jwt.txt",
        JSON.stringify({ token, account }),
      );

      /* // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (token?.account && account?.access_token) {
        token.access_token = account.access_token;
      } */

      return token;
    },
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
