"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import type { FinancialProfile } from "../types/dashboard.types";

interface SessionLike {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

const COLLAPSE_STORAGE_KEY = "mw-sidebar-collapsed";

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active: boolean;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  session: SessionLike | null | undefined;
  profile: FinancialProfile | null | undefined;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function Sidebar({ navItems, session, profile, isPremium, onUpgrade }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  const displayName = session?.user?.name || "Guest User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const renderNav = (isCollapsed: boolean) => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const content = (
          <>
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </>
        );
        const sharedClassName = `w-full flex items-center gap-3 py-2.5 text-base transition-transform duration-100 cursor-pointer ${
          isCollapsed ? "justify-center px-2" : "px-4"
        } ${item.active ? "hover:rotate-0" : "hover:-rotate-1"}`;
        const sharedStyle = item.active
          ? { background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }
          : { opacity: 0.65 };

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={sharedClassName}
              style={sharedStyle}
              onClick={() => setMobileOpen(false)}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            onClick={() => {
              item.onClick?.();
              setMobileOpen(false);
            }}
            title={isCollapsed ? item.label : undefined}
            className={sharedClassName}
            style={sharedStyle}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );

  const renderProfileCard = (isCollapsed: boolean) => (
    <div className="hd-card hd-card--tight p-4 rotate-1">
      {isCollapsed ? (
        <div
          className="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-extrabold text-white"
          style={{ background: "var(--accent-2)" }}
          title={displayName}
        >
          {initials}
        </div>
      ) : (
        <>
          <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ opacity: 0.55 }}>User Profile</div>
          <div className="font-bold text-lg truncate" title={session?.user?.name || session?.user?.email || "Guest User"}>
            {displayName}
          </div>
          {session?.user?.name && (
            <div className="text-xs truncate mb-1" style={{ opacity: 0.65 }}>
              {session.user.email}
            </div>
          )}
          {profile?.occupation && (
            <div className="text-sm font-bold" style={{ color: "var(--accent-2)" }}>{profile.occupation}</div>
          )}
          <div className="text-sm mt-1 mb-2" style={{ opacity: 0.65 }}>
            Salary: ${profile?.annualSalary ? Number(profile.annualSalary).toLocaleString() : "0"} CAD
          </div>

          {isPremium ? (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded border border-emerald-300 text-center">
              ★ Premium Active
            </div>
          ) : (
            <button
              onClick={onUpgrade}
              className="hd-btn w-full text-xs py-1.5 cursor-pointer font-bold block text-center"
              style={{ background: "var(--postit)" }}
            >
              Go Premium ($5/mo)
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        title="Open menu"
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center cursor-pointer"
        style={{ background: "var(--card)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            className="relative w-72 max-w-[80vw] p-4 flex flex-col justify-between h-full"
            style={{ borderRight: "3px solid var(--border)", background: "var(--card)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              title="Close menu"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center justify-center mb-8">
                <img src="/logo.png" alt="MapleWealth Logo" className="w-28 object-contain" />
              </div>
              {renderNav(false)}
            </div>

            {renderProfileCard(false)}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`relative ${collapsed ? "w-20" : "w-64"} p-4 flex-col justify-between hidden md:flex h-full ${
          hydrated ? "transition-[width] duration-200" : ""
        }`}
        style={{ borderRight: "3px solid var(--border)", background: "var(--card)" }}
      >
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer z-10"
          style={{ background: "var(--card)", border: "2px solid var(--border)" }}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div>
          <div className="flex items-center justify-center mb-8">
            <img
              src="/logo.png"
              alt="MapleWealth Logo"
              className={`${collapsed ? "w-10" : "w-32"} object-contain transition-[width] duration-200`}
            />
          </div>
          {renderNav(collapsed)}
        </div>

        {renderProfileCard(collapsed)}
      </aside>
    </>
  );
}
