import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { AUTH_URL, REALM, KC_CLIENT_ID } from "@app/constants";

export const userManager = new UserManager({
  authority: `${AUTH_URL}/realms/${REALM}`,
  client_id: KC_CLIENT_ID,
  redirect_uri: window.location.origin,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});