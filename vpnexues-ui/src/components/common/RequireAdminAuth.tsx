import { Navigate, useLocation, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminHome, isSubAdminCountryAllowed } from '../../utils/adminScope';

export default function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <div className="container">Loading...</div>;
  if (!admin) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}

/** Only SUPER_ADMIN may view; other admins are sent to their own dashboard. */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!admin) return <Navigate to="/admin/login?redirect=%2Fadmin%2Fsuper-admin" replace />;
  if (admin.role !== 'SUPER_ADMIN') return <Navigate to={getAdminHome(admin)} replace />;
  return <>{children}</>;
}

/**
 * Guards `/admin/sub-admin/:country`.
 * SUPER_ADMIN may view any country (covers legacy preview mode).
 * An ADMIN may view only their assigned country; others are sent home.
 */
export function RequireSubAdminCountry({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const { country } = useParams<{ country: string }>();
  const location = useLocation();

  if (loading) return <div className="container">Loading...</div>;
  if (!admin) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!isSubAdminCountryAllowed(admin, country ?? '')) {
    return <Navigate to={getAdminHome(admin)} replace />;
  }
  return <>{children}</>;
}

/**
 * `/admin` (no sub-path) → the signed-in admin's own entrance.
 *
 * This used to hard-code `<Navigate to="/admin/super-admin" />`, which routed a
 * Sub Admin into the Super Admin entrance, and — when their country could not be
 * resolved — bounced them `/admin` → `/admin/super-admin` → `/admin` forever
 * (RequireSuperAdmin sends them back to getAdminHome, which is `/admin`).
 */
export function AdminHomeRedirect() {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const home = getAdminHome(admin);
  // `getAdminHome` returns `/admin` for an admin with no resolvable country.
  // That account has no dashboard to show — render a message rather than
  // navigating again, so this route can never loop or reach the super-admin screen.
  if (home === '/admin') {
    return (
      <div className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#64748B' }}>
          No dashboard is assigned to this account. Please contact the Super Administrator.
        </p>
      </div>
    );
  }
  return <Navigate to={home} replace />;
}
