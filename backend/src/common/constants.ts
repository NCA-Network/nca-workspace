export const Session = {
  cookieName: "nca_session",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

/** Short-lived cookie holding the OAuth state (CSRF) during the Google flow. */
export const OAUTH_STATE_COOKIE = "oauth_state";
