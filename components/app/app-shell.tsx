"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  CircleHelp,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
type AppShellProps = {
  children: ReactNode;
  workspaceName: string;
  role: string;
  workspaces: { id: string; name: string; slug: string }[];
  activeWorkspaceId: string;
};

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Finance", href: "/dashboard/finance", icon: BarChart3 },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppShell({
  children,
  workspaceName,
  role,
  workspaces,
  activeWorkspaceId,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const wasMobileMenuOpen = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!menuOpen || !isMobile) {
      if (wasMobileMenuOpen.current && isMobile) {
        menuButtonRef.current?.focus();
      }
      wasMobileMenuOpen.current = false;
      return;
    }

    const sidebar = sidebarRef.current;
    const focusableElements = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      );
    sidebar?.querySelector<HTMLElement>(".app-navigation a")?.focus();
    wasMobileMenuOpen.current = true;

    const handleMenuKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (!sidebar?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleMenuKeys);
    return () => window.removeEventListener("keydown", handleMenuKeys);
  }, [isMobile, menuOpen]);
  useEffect(() => {
    const skipLink = document.querySelector<HTMLAnchorElement>(".skip-link");
    if (!skipLink) return;
    skipLink.inert = isMobile && menuOpen;
    if (isMobile && menuOpen) {
      skipLink.setAttribute("aria-hidden", "true");
    } else {
      skipLink.removeAttribute("aria-hidden");
    }
    return () => {
      skipLink.inert = false;
      skipLink.removeAttribute("aria-hidden");
    };
  }, [isMobile, menuOpen]);
  const signOut = async () => {
    setSignOutError("");
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: "{}",
      });
      if (!response.ok) {
        setSignOutError("Sign-out failed. Please try again.");
        return;
      }
      window.location.replace("/");
    } catch {
      setSignOutError("Sign-out failed. Please try again.");
    }
  };
  return (
    <div className="app-shell">
      <aside
        id="app-navigation-sidebar"
        ref={sidebarRef}
        className={menuOpen ? "app-sidebar app-sidebar--open" : "app-sidebar"}
        role={isMobile && menuOpen ? "dialog" : undefined}
        aria-modal={isMobile && menuOpen ? true : undefined}
        aria-label={isMobile && menuOpen ? "Dashboard navigation" : undefined}
        aria-hidden={isMobile && !menuOpen ? true : undefined}
        inert={isMobile && !menuOpen ? true : undefined}
      >
        <div className="app-sidebar-head">
          <Link className="app-brand" href="/dashboard" onClick={() => setMenuOpen(false)}>
            <span>F</span>Flash Orbit
          </Link>
          <button
            className="app-menu-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        />
        <nav className="app-navigation" aria-label="Dashboard navigation">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link href={href} key={label} onClick={() => setMenuOpen(false)}>
              <Icon size={17} />{label}
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-foot">
          <Link href="/dashboard/help"><CircleHelp size={16} /> Help center</Link>
          <button type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
          {signOutError ? <span className="app-signout-error" role="alert">{signOutError}</span> : null}
        </div>
      </aside>
      {menuOpen ? (
        <button
          className="app-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => {
            setMenuOpen(false);
          }}
        />
      ) : null}
      <div className="app-main" inert={isMobile && menuOpen ? true : undefined}>
        <header className="app-topbar">
          <button
            ref={menuButtonRef}
            className="app-menu-open"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            aria-controls="app-navigation-sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="app-topbar-workspace">{workspaceName}</span>
          <span className="app-role">{role}</span>
        </header>
        <main className="app-content" id="main-content">{children}</main>
      </div>
    </div>
  );
}
