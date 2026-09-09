import { useEffect, useState, type FormEvent } from 'react';

/**
 * Atlas — corporate sign-in and NOPROD portal demo.
 *
 * The visual structure follows the Webi Elements refinement sessions and the
 * supplied Atlas references. Authentication and authorization remain owned by
 * the API; localStorage is used only for the NOPROD profile demonstration.
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

type ProfileRole = 'administrative' | 'developer' | 'superadmin';

interface AtlasProfile {
  subject: string;
  email: string;
  displayName: string;
  picture?: string;
  description: string;
  role: ProfileRole;
  status: 'active' | 'inactive';
  onboardingPending: boolean;
}

type IconName = 'home' | 'folder' | 'layers' | 'document' | 'chart' | 'users' | 'bell' | 'check' | 'close' | 'arrow';

interface KpiDefinition {
  icon: IconName;
  label: string;
  value: string;
  change: string;
}

const PROFILE_STORAGE_PREFIX = 'atlas:demo-profile:';

const KPI_DEFINITIONS: KpiDefinition[] = [
  { icon: 'folder', label: 'Proyectos activos', value: '7', change: '+1 desde ayer' },
  { icon: 'layers', label: 'Slices en curso', value: '14', change: '+3 desde ayer' },
  { icon: 'document', label: 'Actualizaciones hoy', value: '38', change: '+12 desde ayer' },
  { icon: 'users', label: 'Desarrolladores activos', value: '6', change: '+1 desde ayer' },
];

const ACTIVITY_VALUES = [12, 23, 37, 25, 21, 34, 20, 23, 35, 43, 23, 32, 22, 29, 38];

const RECENT_ACTIVITY = [
  ['10:42', 'Ana Ríos', 'actualizó la slice', 'Autenticación corporativa', 'en Atlas Interno'],
  ['10:18', 'Carlos Méndez', 'documentó el flujo de ingreso', '', 'en Portal Clientes Demo'],
  ['09:56', 'Laura Gómez', 'sincronizó actividad en', 'Migración Datos Piloto', ''],
  ['09:31', 'Diego Ruiz', 'creó la slice', 'Validación de dominio', 'en Atlas Interno'],
  ['08:47', 'Sofía Torres', 'actualizó el avance de', 'Portal Clientes Demo', ''],
];

/** Loads the Google button and forwards its credential to Atlas for verification. */
export default function App() {
  const [identity, setIdentity] = useState<AuthenticatedIdentity | undefined>();
  const [profile, setProfile] = useState<AtlasProfile | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const googleClientId = import.meta.env.VITE_ATLAS_GOOGLE_CLIENT_ID as string | undefined;
  const apiUrl = (import.meta.env.VITE_ATLAS_API_URL as string | undefined) ?? '';
  // The local identity provider is opt-in by configuration, never inferred from
  // missing credentials: an unconfigured deployment must report a config error.
  const demoMode = (import.meta.env.VITE_ATLAS_AUTH_PROVIDER as string | undefined) === 'mock';

  useEffect(() => {
    setError(undefined);
    if (!googleClientId) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    const script = existingScript ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleSignIn(
      googleClientId,
      apiUrl,
      setIdentity,
      setError,
      setIsAuthenticating
    );
    script.onerror = () => {
      setIsAuthenticating(false);
      setError('No fue posible cargar el inicio de sesión corporativo.');
    };
    if (!existingScript) document.head.appendChild(script);

    const button = document.getElementById('google-sign-in');
    if (button) button.replaceChildren();
  }, [apiUrl, googleClientId]);

  useEffect(() => {
    if (!identity) {
      setProfile(undefined);
      return;
    }

    setProfile(loadDemoProfile(identity));
  }, [identity]);

  /**
   * Runs the demo sign-in through the real authentication contract.
   *
   * The SPA asks the API for a local stand-in credential and then exchanges it at
   * the same `/api/auth/google` endpoint Google will use. Nothing is trusted in
   * the browser: the API still verifies the token and issues the session cookie.
   */
  async function startDemoSession(): Promise<void> {
    setError(undefined);
    setIsAuthenticating(true);

    try {
      // 1. Request the local credential; the signing secret never leaves the API.
      const credentialResponse = await fetch(`${apiUrl}/api/auth/mock-credential`, {
        method: 'POST',
        credentials: 'include',
      });
      const credentialResult = await credentialResponse.json() as { credential?: string; error?: string };
      if (!credentialResponse.ok || !credentialResult.credential) {
        setError(credentialResult.error ?? 'El proveedor de identidad local no está disponible.');
        return;
      }

      // 2. Exchange it exactly like the Google flow so the contract stays identical.
      const identityResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ credential: credentialResult.credential }),
      });
      const identityResult = await identityResponse.json() as { identity?: AuthenticatedIdentity; error?: string };
      if (!identityResponse.ok || !identityResult.identity) {
        setError(identityResult.error ?? 'No fue posible validar la identidad corporativa.');
        return;
      }

      setIdentity(identityResult.identity);
    } catch {
      setError('No fue posible conectar con Atlas.');
    } finally {
      setIsAuthenticating(false);
    }
  }

  function endSession(): void {
    setIdentity(undefined);
    setProfile(undefined);
  }

  function skipOnboarding(): void {
    setProfile((current) => current ? { ...current, onboardingPending: false } : current);
  }

  function completeOnboarding(updatedProfile: AtlasProfile): void {
    saveDemoProfile(updatedProfile);
    setProfile(updatedProfile);
  }

  if (identity && profile?.onboardingPending) {
    return (
      <main className="onboarding-page">
        <PortalBackdrop />
        <div className="onboarding-scrim" aria-hidden="true" />
        <section className="onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          <div className="stepper" aria-label="Paso 1 de 2">
            <strong>Paso 1 de 2</strong>
            <div className="stepper-track"><span /></div>
          </div>
          <h1 id="onboarding-title">Tu perfil</h1>
          <p className="modal-subtitle">Confirma cómo quieres presentarte ante tu equipo.</p>
          <OnboardingForm profile={profile} onSkip={skipOnboarding} onComplete={completeOnboarding} />
        </section>
      </main>
    );
  }

  if (identity) {
    return <Dashboard identity={identity} profile={profile} onSignOut={endSession} />;
  }

  return (
    <main className="atlas-shell">
      <section className="atlas-card login-card">
        <img className="atlas-logo" src="/brand/logo.png" alt="ST&T Atlas" />
        <h1>Ingreso corporativo</h1>
        <p className="subtitle">Portal interno de desarrollo AI‑First</p>
        {demoMode ? (
          <div className="demo-panel" role="status">
            <strong>Modo demostración</strong>
            <p>Google Workspace aún no está configurado. Puedes recorrer el ingreso, el perfil y el onboarding con un usuario ficticio.</p>
            <button className="demo-action" type="button" onClick={startDemoSession} disabled={isAuthenticating}>
              {isAuthenticating ? 'Validando…' : 'Entrar como usuario demo'}
            </button>
          </div>
        ) : !googleClientId ? (
          <p className="configuration-message" role="status">
            El acceso no está disponible: configuración pendiente. Contacta al administrador del portal.
          </p>
        ) : (
          <div id="google-sign-in" aria-busy={isAuthenticating} aria-label="Ingresar con Google" />
        )}
        {isAuthenticating && <p className="loading-message" role="status">Validando tu identidad corporativa…</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="access-note">Acceso exclusivo para cuentas corporativas @stt.com.co</p>
        <div className="card-divider" />
        <span className="environment-badge">Entorno de pruebas — {demoMode ? 'POC' : 'No productivo'}</span>
      </section>
    </main>
  );
}

function Dashboard({
  identity,
  profile,
  onSignOut,
}: {
  identity: AuthenticatedIdentity;
  profile?: AtlasProfile;
  onSignOut(): void;
}) {
  return (
    <main className="portal-shell">
      <header className="portal-header">
        <img className="portal-logo" src="/brand/logo.png" alt="ST&T Atlas" />
        <div className="header-actions">
          <span className="environment-badge">Entorno de pruebas — POC</span>
          <button className="icon-button" type="button" aria-label="Notificaciones">
            <Icon name="bell" />
            <span className="notification-dot" aria-hidden="true" />
          </button>
          <button className="user-summary" type="button" onClick={onSignOut} aria-label="Cerrar sesión">
            <ProfileAvatar profile={profile} identity={identity} size="small" />
            <span><strong>{profile?.displayName ?? identity.name ?? identity.email}</strong><small>{roleLabel(profile?.role)}</small></span>
            <span className="chevron" aria-hidden="true">⌄</span>
          </button>
        </div>
      </header>

      <div className="portal-body">
        <aside className="portal-sidebar" aria-label="Navegación principal">
          <nav>
            <a className="nav-item active" href="#inicio" aria-current="page"><Icon name="home" />Inicio</a>
            <a className="nav-item" href="#proyectos"><Icon name="folder" />Proyectos</a>
            <a className="nav-item" href="#slices"><Icon name="layers" />Slices</a>
            <a className="nav-item" href="#documentacion"><Icon name="document" />Documentación</a>
            <a className="nav-item" href="#metricas"><Icon name="chart" />Métricas</a>
          </nav>
          <div className="sidebar-rule" />
          <span className="sidebar-note">Vista demo</span>
        </aside>

        <section className="portal-content" id="inicio">
          <div className="page-heading">
            <div><h1>Inicio</h1><p>Estado general del desarrollo</p></div>
            <span className="demo-label">Datos estáticos de POC</span>
          </div>

          <div className="kpi-grid">
            {KPI_DEFINITIONS.map((kpi) => <MetricCard key={kpi.label} definition={kpi} />)}
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card activity-card">
              <div className="card-heading"><div><h2>Actividad de los últimos 14 días</h2><span>Eventos registrados · demo</span></div><span className="chart-value"><b>38</b> actualizaciones</span></div>
              <div className="bar-chart" role="img" aria-label="Actividad demo de los últimos 14 días">
                {ACTIVITY_VALUES.map((value, index) => <span className="bar-column" key={`${value}-${index}`}><i style={{ height: `${value * 2}px` }} /><small>{index + 12} abr</small></span>)}
              </div>
            </section>

            <section className="dashboard-card sync-card">
              <div className="card-heading"><div><h2>Sincronización</h2><span>Estado de la plataforma</span></div><span className="status-badge"><i />Operativa</span></div>
              <div className="sync-list">
                <div><span className="sync-icon success"><Icon name="check" /></span><span>Eventos aceptados</span><strong>214</strong></div>
                <div><span className="sync-icon danger"><Icon name="close" /></span><span>Rechazados</span><strong>3</strong></div>
                <div><span className="sync-icon info"><Icon name="chart" /></span><span>Latencia media</span><strong>2,1 s</strong></div>
              </div>
              <div className="sync-progress"><span style={{ width: '82%' }} /></div>
            </section>
          </div>

          <section className="dashboard-card recent-card">
            <div className="card-heading"><div><h2>Actividad reciente</h2><span>Últimas acciones visibles en la demo</span></div></div>
            <div className="activity-list">
              {RECENT_ACTIVITY.map(([time, person, action, entity, context]) => (
                <div className="activity-row" key={`${time}-${person}`}><time>{time}</time><ProfileAvatar identity={{ email: person }} size="xsmall" /><span><strong>{person}</strong> {action} {entity && <a href="#actividad">{entity}</a>} {context && <em>{context}</em>}</span></div>
              ))}
            </div>
            <a className="view-link" href="#proyectos">Ver todos los proyectos <Icon name="arrow" /></a>
          </section>

          <section className="authorization-strip" aria-label="Autorización demo">
            <div><span className="tile-label">Autorización</span><strong>{roleLabel(profile?.role)} · solo consulta</strong></div>
            <span>Los permisos definitivos se validarán en el servidor.</span>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ definition }: { definition: KpiDefinition }) {
  return <article className="metric-card"><span className="metric-icon"><Icon name={definition.icon} /></span><div><span>{definition.label}</span><strong>{definition.value}</strong><small><b>↗</b> {definition.change}</small></div></article>;
}

function PortalBackdrop() {
  return <div className="portal-backdrop" aria-hidden="true"><div className="backdrop-header" /><div className="backdrop-body"><div className="backdrop-sidebar" /><div className="backdrop-main"><span /><span /><div className="backdrop-cards"><i /><i /><i /></div><div className="backdrop-lines"><i /><i /><i /><i /></div></div></div></div>;
}

function OnboardingForm({
  profile,
  onSkip,
  onComplete,
}: {
  profile: AtlasProfile;
  onSkip(): void;
  onComplete(profile: AtlasProfile): void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [picture, setPicture] = useState(profile.picture ?? '');
  const [description, setDescription] = useState(profile.description);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onComplete({
      ...profile,
      displayName: displayName.trim() || profile.displayName,
      picture: picture.trim() || undefined,
      description: description.trim(),
      onboardingPending: false,
    });
  }

  function focusPictureField(): void {
    document.getElementById('profile-picture')?.focus();
  }

  return (
    <form className="onboarding-form" onSubmit={submit}>
      <div className="onboarding-fields">
        <div className="avatar-panel">
          <ProfileAvatar profile={{ ...profile, picture: picture.trim() || undefined }} identity={{ email: profile.email, name: displayName }} size="xxlarge" />
          <button className="replace-photo" type="button" onClick={focusPictureField}><span aria-hidden="true">▣</span> Reemplazar foto</button>
          <small>Opcional · se usará tu avatar corporativo si no agregas una imagen.</small>
        </div>
        <div className="form-fields">
          <label htmlFor="display-name">Nombre visible <span>Requerido</span></label>
          <input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} required autoFocus />
          <label htmlFor="description">Descripción corta <span>Opcional</span></label>
          <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} rows={3} placeholder="¿En qué trabajas?" />
          <label htmlFor="profile-picture">URL de imagen <span>Opcional</span></label>
          <input id="profile-picture" type="url" value={picture} onChange={(event) => setPicture(event.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="info-alert" role="status"><span aria-hidden="true">i</span><span>Tu correo corporativo y tu rol los administra el portal.</span></div>
      <div className="modal-divider" />
      <div className="onboarding-actions"><button className="outline-action" type="button" onClick={onSkip}>Omitir</button><button className="primary-action" type="submit">Continuar <Icon name="arrow" /></button></div>
    </form>
  );
}

function ProfileAvatar({
  profile,
  identity,
  size,
}: {
  profile?: AtlasProfile;
  identity: AuthenticatedIdentity;
  size: 'xsmall' | 'small' | 'xxlarge';
}) {
  const name = profile?.displayName ?? identity.name ?? identity.email;
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return profile?.picture || identity.picture
    ? <img className={`profile-avatar ${size}`} src={profile?.picture ?? identity.picture} alt={name} />
    : <span className={`profile-avatar fallback ${size}`} aria-label={name}>{initials}</span>;
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: 'M3 10.5 12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z',
    folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z',
    layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 17l9 5 9-5',
    document: 'M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h6',
    chart: 'M5 20V11M12 20V5M19 20v-8',
    users: 'M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20m6-10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5-6.5a3 3 0 0 1 0 5.8M16 14h1.5a3.5 3.5 0 0 1 3.5 3.5V20',
    bell: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
    check: 'm5 12 4 4L19 6',
    close: 'm7 7 10 10M17 7 7 17',
    arrow: 'M5 12h13m-5-5 5 5-5 5',
  };
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function roleLabel(role?: ProfileRole): string {
  if (role === 'superadmin') return 'Superadministrador';
  if (role === 'developer') return 'Desarrollador';
  return 'Administrativo';
}

function loadDemoProfile(identity: AuthenticatedIdentity): AtlasProfile {
  const storageKey = `${PROFILE_STORAGE_PREFIX}${identity.email}`;
  const stored = window.localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored) as AtlasProfile;
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }

  return {
    subject: identity.email,
    email: identity.email,
    displayName: identity.name ?? identity.email,
    picture: identity.picture,
    description: '',
    role: 'administrative',
    status: 'active',
    onboardingPending: true,
  };
}

function saveDemoProfile(profile: AtlasProfile): void {
  window.localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${profile.email}`, JSON.stringify(profile));
}

function initializeGoogleSignIn(
  clientId: string,
  apiUrl: string,
  onIdentity: (identity: AuthenticatedIdentity) => void,
  onError: (message: string) => void,
  onLoading: (loading: boolean) => void,
): void {
  if (!window.google) {
    onError('El proveedor de identidad todavía no está listo.');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async ({ credential }) => {
      onLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/auth/google`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        const result = await response.json() as { identity?: AuthenticatedIdentity; error?: string };
        if (!response.ok || !result.identity) {
          onError(result.error ?? 'No fue posible validar la identidad corporativa.');
          return;
        }
        onIdentity(result.identity);
      } catch {
        onError('No fue posible conectar con Atlas.');
      } finally {
        onLoading(false);
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
      width: '360',
    });
  }
}
