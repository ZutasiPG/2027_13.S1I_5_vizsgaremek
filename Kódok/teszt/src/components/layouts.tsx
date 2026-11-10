import {
  Bell,
  BusFront,
  ChartNoAxesCombined,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Gauge,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  Moon,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  TicketCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { useApp } from "../app/AppContext";
import type { Role } from "../app/data";
import { Brand } from "./Brand";
import { Toast } from "./ui";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  return (
    <header className="app-header">
      <div className="header-inner">
        <Brand />
        <nav className={open ? "open" : ""}>
          <NavLink to="/kereses">Járatkereső</NavLink>
          <NavLink to="/berletek">Bérletek</NavLink>
          <NavLink to="/jegyeim">Jegyeim</NavLink>
          <button
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Navigáció bezárása"
          >
            <X />
          </button>
        </nav>
        <div className="header-actions">
          <Link to="/ertesitesek" className="icon-button" aria-label="Értesítések">
            <Bell />
            <span>3</span>
          </Link>
          <button className="user-button" onClick={() => setUserOpen(!userOpen)}>
            <span>KA</span>
            <div>
              <b>Kovács Anna</b>
              <small>Diák utas</small>
            </div>
            <ChevronDown />
          </button>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Navigáció megnyitása"
          >
            <Menu />
          </button>
          {userOpen && (
            <div className="user-menu">
              <Link to="/beallitasok">
                <Settings /> Beállítások
              </Link>
              <Link to="/belepes">
                <LogOut /> Kijelentkezés
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function PassengerLayout() {
  return (
    <div className="site-shell">
      <AppHeader />
      <main id="tartalom">
        <Outlet />
      </main>
      <footer>
        <div>
          <Brand compact />
          <p>Utazás egyszerűen, egész Magyarországon.</p>
        </div>
        <div>
          <b>Utazás</b>
          <Link to="/kereses">Járatkereső</Link>
          <Link to="/berletek">Bérletek</Link>
          <Link to="/jegyeim">Jegyeim</Link>
        </div>
        <div>
          <b>Segítség</b>
          <button>Kapcsolat</button>
          <button>Gyakori kérdések</button>
          <button>Akadálymentesség</button>
        </div>
        <span>© 2026 TRANSIX</span>
      </footer>
      <DevPanel />
      <Toast />
    </div>
  );
}

export function DevPanel() {
  const { role, setRole } = useApp();
  const roles: { value: Role; label: string }[] = [
    { value: "utas", label: "Utas" },
    { value: "járművezető", label: "Járművezető" },
    { value: "diszpécser", label: "Diszpécser" },
    { value: "admin", label: "Admin" },
  ];
  return (
    <div className="dev-panel">
      <span>Bemutató nézet</span>
      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        {roles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const adminNav = [
  ["Dashboard", "/admin", Gauge, false],
  ["Menetrend", "/admin/menetrend", ClipboardList, false],
  ["Útvonalak", "/admin/utvonalak", Route, false],
  ["Megállók", "/admin/megallok", MapPinned, false],
  ["Járművek", "/admin/jarmuvek", BusFront, false],
  ["Díjszabás", "/admin/dijszabas", CreditCard, false],
  ["Felhasználók", "/admin/felhasznalok", Users, true],
  ["Statisztika", "/admin/statisztika", ChartNoAxesCombined, false],
  ["Napló", "/admin/naplo", ShieldCheck, true],
] as const;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { role, dark, setDark } = useApp();
  const isAdmin = role === "admin";
  return (
    <div className={`admin-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Brand compact />
          <button onClick={() => setCollapsed(!collapsed)} aria-label="Oldalsáv összecsukása">
            <Menu />
          </button>
        </div>
        <div className="workspace">
          <span>TR</span>
          <div>
            <b>TRANSIX Központ</b>
            <small>{role === "admin" ? "Adminisztráció" : "Diszpécserközpont"}</small>
          </div>
        </div>
        <nav>
          {adminNav.map(([label, to, Icon, adminOnly = false]) => (
            <NavLink
              to={to}
              end={to === "/admin"}
              key={to}
              className={adminOnly && !isAdmin ? "locked-nav" : ""}
              title={adminOnly && !isAdmin ? "Nincs jogosultságod" : undefined}
            >
              <Icon />
              <span>{label}</span>
              {adminOnly && !isAdmin && <LockKeyhole className="nav-lock" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/beallitasok">
            <Settings />
            <span>Beállítások</span>
          </NavLink>
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
            <span>{dark ? "Világos mód" : "Sötét mód"}</span>
          </button>
          <div className="admin-user">
            <span>NZ</span>
            <div>
              <b>{role === "admin" ? "Admin Zoltán" : "Nagy Eszter"}</b>
              <small>{role === "admin" ? "Rendszergazda" : "Diszpécser"}</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-content">
        <header>
          <button onClick={() => setCollapsed(!collapsed)} aria-label="Oldalsáv megnyitása">
            <Menu />
          </button>
          <div className="admin-search">
            <Search />
            <input placeholder="Globális keresés…" aria-label="Globális keresés" />
            <kbd>⌘ K</kbd>
          </div>
          <span className={`role-badge ${isAdmin ? "admin" : ""}`}>
            {isAdmin ? "Admin" : "Diszpécser"}
          </span>
          <button className="icon-button" aria-label="Admin értesítések">
            <Bell />
            <span>4</span>
          </button>
          <button
            className="admin-avatar"
            onClick={() => setUserOpen(!userOpen)}
            aria-label="Felhasználói menü"
          >
            <CircleUserRound />
            <ChevronDown />
          </button>
          {userOpen && (
            <div className="admin-user-menu">
              <b>{isAdmin ? "Admin Zoltán" : "Nagy Eszter"}</b>
              <span>{isAdmin ? "Rendszergazda" : "Diszpécser"}</span>
              <Link to="/beallitasok">
                <Settings /> Beállítások
              </Link>
              <Link to="/belepes">
                <LogOut /> Kijelentkezés
              </Link>
            </div>
          )}
        </header>
        <main>
          <Outlet />
        </main>
      </div>
      <DevPanel />
      <Toast />
    </div>
  );
}

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <div className="driver-shell">
      {children}
      <DevPanel />
      <Toast />
    </div>
  );
}
