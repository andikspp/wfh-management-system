import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Icon, type IconName } from './icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export function Layout({ nav }: { nav: NavItem[] }) {
  const { user, logout } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">D</span>
            <span className="brand-name">Dexa WFH</span>
          </div>
          <nav className="nav">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end>
                <Icon name={n.icon} size={17} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="user-menu" ref={menuRef}>
            <button type="button" className="user-btn" onClick={() => setMenuOpen((o) => !o)}>
              <span className="avatar">{user?.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user?.name}</span>
              <Icon name="chevron-down" size={15} className={`user-caret ${menuOpen ? 'user-caret-open' : ''}`} />
            </button>
            {menuOpen && (
              <div className="dropdown">
                <div className="dropdown-head">
                  <strong>{user?.name}</strong>
                  <small className="muted">{user?.email}</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setPwOpen(true);
                  }}
                >
                  <Icon name="key" size={16} />
                  Ganti Password
                </button>
                <button type="button" className="dropdown-danger" onClick={logout}>
                  <Icon name="logout" size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
