import { AUTH_URL, KC_CLIENT_ID, REALM } from '@app/constants';
import { WebStorageStateStore } from 'oidc-client-ts';
import type { AuthProviderProps } from 'react-oidc-context';

export const oidcConfig: AuthProviderProps= {
  authority: `${AUTH_URL}/realms/${REALM}`,
  client_id: KC_CLIENT_ID,
  redirect_uri: window.location.origin, 
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};
