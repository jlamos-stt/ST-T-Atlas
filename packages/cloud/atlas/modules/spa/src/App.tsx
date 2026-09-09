import { useEffect, useState } from 'react';

/**
 * AtlasLogin — Corporate Google sign-in surface for the Atlas portal.
 *
 * Google Identity Services supplies an ID token to the backend. The browser
 * never handles a local password, and the backend remains responsible for all
 * token verification and corporate-domain policy decisions.
 */

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback(response: GoogleCredentialResponse): void;
      }): void;
      renderButton(element: HTMLElement, options: Record<string, string>): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

interface AuthenticatedIdentity {
  email: string;
  name?: string;
  picture?: string;
}

/** Loads the Google button and forwards its credential to Atlas for verification. */
export default function App() {
  const [identity, setIdentity] = useState<AuthenticatedIdentity | undefined>();
  const [error, setError] = useState<string | undefined>();
  const googleClientId = import.meta.env.VITE_ATLAS_GOOGLE_CLIENT_ID as string | undefined;
  const apiUrl = (import.meta.env.VITE_ATLAS_API_URL as string | undefined) ?? '';

  useEffect(() => {
    if (!googleClientId) {
      setError('El inicio corporativo no está configurado para este entorno.');
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    const script = existingScript ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleSignIn(googleClientId, apiUrl, setIdentity, setError);
    script.onerror = () => setError('No fue posible cargar el inicio de sesión corporativo.');
    if (!existingScript) document.head.appendChild(script);

    // Guard: remove a stale button before rendering again during hot reloads.
    const button = document.getElementById('google-sign-in');
    if (button) button.replaceChildren();
  }, [apiUrl, googleClientId]);

  if (identity) {
    return (
      <main className="atlas-shell">
        <section className="atlas-card">
          <p className="eyebrow">ST&T Atlas</p>
          <h1>Bienvenido, {identity.name ?? identity.email}</h1>
          <p>Tu identidad corporativa fue validada correctamente.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="atlas-shell">
      <section className="atlas-card">
        <p className="eyebrow">ST&T Atlas</p>
        <h1>Desarrollo AI‑First, visible y conectado</h1>
        <p>Ingresa con tu cuenta corporativa de ST&T para continuar.</p>
        <div id="google-sign-in" aria-label="Ingresar con Google" />
        {error && <p className="error-message" role="alert">{error}</p>}
      </section>
    </main>
  );
}

/** Sends the Google credential to the API and renders the provider button. */
function initializeGoogleSignIn(
  clientId: string,
  apiUrl: string,
  onIdentity: (identity: AuthenticatedIdentity) => void,
  onError: (message: string) => void
): void {
  if (!window.google) {
    onError('El proveedor de identidad todavía no está listo.');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async ({ credential }) => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/google`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        const result = await response.json() as {
          identity?: AuthenticatedIdentity;
          error?: string;
        };

        // Guard: display a generic failure and keep provider details out of the UI.
        if (!response.ok || !result.identity) {
          onError(result.error ?? 'No fue posible validar la identidad corporativa.');
          return;
        }
        onIdentity(result.identity);
      } catch {
        onError('No fue posible conectar con Atlas.');
      }
    },
  });

  const button = document.getElementById('google-sign-in');
  if (button) {
    window.google.accounts.id.renderButton(button, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
    });
  }
}
