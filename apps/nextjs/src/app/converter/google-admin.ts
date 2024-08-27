"use server";

import http from "http";
import url from "url";
import type { JWTInput } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import open from "open";
import destroyer from "server-destroy";

import { auth } from "@acme/auth";

import { env } from "~/env";

export async function test_google_admin_file() {
  const credentials_text = atob(env.JKNM_SERVICE_ACCOUNT_CREDENTIALS);
  const credentials_json = JSON.parse(credentials_text) as Partial<JWTInput>;
  const google_client = await google.auth.getClient({
    credentials: credentials_json,
    scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
  });

  const service = google.admin({
    version: "directory_v1",
    auth: google_client,
  });

  const result = await service.users.list({
    customer: "C049fks0l",
  });

  return result.data.users;
}

export async function test_google_admin_server() {
  const login = new Promise<OAuth2Client>((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client(
      env.AUTH_GOOGLE_ID,
      env.AUTH_GOOGLE_SECRET,
      "http://localhost:3001/oauth2callback",
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/admin.directory.user.readonly",
    });

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer((req, res) => {
        try {
          if (req.url?.includes("/oauth2callback")) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, "http://localhost:3001")
              .searchParams;
            const code = qs.get("code");
            console.log(`Code is ${code}`);
            res.end("Authentication successful! Please return to the console.");
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const a = async () => {
              if (!code) {
                reject(new Error("No code found"));
                return;
              }

              const r = await oAuth2Client.getToken(code);
              // Make sure to set the credentials on the OAuth2 client.
              oAuth2Client.setCredentials(r.tokens);
              console.info("Tokens acquired.");
              resolve(oAuth2Client);
            };

            void a();
          }
        } catch (e) {
          if (e instanceof Error) {
            reject(e);
          }
        }
      })
      .listen(3001, () => {
        // open the browser to the authorize url to start the workflow
        void open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
      });

    destroyer(server);
  });

  const client = await login;
  const service = google.admin({
    version: "directory_v1",
    auth: client,
  });

  const result = service.users.list({
    // customer: env.JKNM_WORKSPACE_ID,
    domain: "jknm.si",
    viewType: "domain_public",

    // maxResults: 10,
    // orderBy: "email",
  });

  console.log("result", result);
}

export async function test_google_admin() {
  const session = await auth();

  const client = new OAuth2Client({});

  client.setCredentials({
    access_token: session?.access_token,
  });

  const service = google.admin({
    version: "directory_v1",
    auth: client,
  });

  const result = await service.users.list({
    customer: "C049fks0l",
    viewType: "domain_public", // ali admin_view
  });

  console.log("result", result);
}
