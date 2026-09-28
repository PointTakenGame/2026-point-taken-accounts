import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.",
  );
}

const definitions = [
  {
    client_name: "Point Taken Brain",
    client_uri: "https://brain.pointtaken.social",
    redirect_uris: [
      "https://brain.pointtaken.social/auth/identity/callback",
      "https://play.pointtaken.social/auth/identity/callback",
      "https://point-taken-2026.vercel.app/auth/identity/callback",
    ],
    keychain_service:
      "point-taken-identity-oauth-brain-production-client-secret",
  },
  {
    client_name: "Point Taken Brain (local)",
    client_uri: "http://localhost:3100",
    redirect_uris: ["http://localhost:3100/auth/identity/callback"],
    keychain_service: "point-taken-identity-oauth-brain-local-client-secret",
  },
  {
    client_name: "Alpha-test Humility Showdown",
    client_uri: "https://heart.pointtaken.social",
    redirect_uris: [
      "https://heart.pointtaken.social/api/auth-callback",
      "https://pt-heart.vercel.app/api/auth-callback",
    ],
    keychain_service:
      "point-taken-identity-oauth-heart-production-client-secret",
  },
  {
    client_name: "Alpha-test Humility Showdown (local)",
    client_uri: "http://localhost:5273",
    redirect_uris: ["http://localhost:5273/api/auth-callback"],
    keychain_service: "point-taken-identity-oauth-heart-local-client-secret",
  },
];

const supabase = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listed, error: listError } =
  await supabase.auth.admin.oauth.listClients();
if (listError) throw listError;
// GoTrue currently returns a bare array while auth-js types model { clients }.
// Normalize both shapes so this remains idempotent across server/SDK versions.
const existingClients = Array.isArray(listed)
  ? listed
  : Array.isArray(listed.clients)
    ? listed.clients
    : Object.values(listed).filter(
        (value) => value && typeof value === "object" && "client_id" in value,
      );

const results = [];
for (const definition of definitions) {
  const existing = existingClients.find(
    (client) => client.client_name === definition.client_name,
  );
  if (existing) {
    const { data, error } = await supabase.auth.admin.oauth.updateClient(
      existing.client_id,
      {
        client_name: definition.client_name,
        client_uri: definition.client_uri,
        redirect_uris: definition.redirect_uris,
        grant_types: ["authorization_code", "refresh_token"],
        token_endpoint_auth_method: "client_secret_basic",
      },
    );
    if (error) throw error;
    results.push({
      name: data.client_name,
      client_id: data.client_id,
      redirect_uris: data.redirect_uris,
      status: "existing_configuration_refreshed",
    });
    continue;
  }

  const { keychain_service: service, ...params } = definition;
  const { data, error } = await supabase.auth.admin.oauth.createClient({
    ...params,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "openid profile email",
    token_endpoint_auth_method: "client_secret_basic",
  });
  if (error) throw error;
  if (!data.client_secret) {
    throw new Error(`No client secret returned for ${data.client_name}.`);
  }

  const stored = spawnSync(
    "/usr/bin/security",
    [
      "add-generic-password",
      "-U",
      "-a",
      data.client_id,
      "-s",
      service,
      "-w",
      data.client_secret,
    ],
    { stdio: "ignore" },
  );
  if (stored.status !== 0) {
    throw new Error(`Could not store ${data.client_name} secret in Keychain.`);
  }

  results.push({
    name: data.client_name,
    client_id: data.client_id,
    redirect_uris: data.redirect_uris,
    status: "created_secret_stored_in_keychain",
  });
}

console.log(JSON.stringify(results, null, 2));
