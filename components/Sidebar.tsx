"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/gifts",   label: "Gifts",   icon: GiftIcon },
  { href: "/compare", label: "Compare", icon: CompareIcon },
  { href: "/history", label: "History", icon: ClockIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/more",    label: "More",    icon: DotsIcon },
];

function GiftIcon() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function CompareIcon() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>;
}
function ClockIcon() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function UserIcon() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function DotsIcon() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>;
}
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="11" height="9" rx="1"/>
      <line x1="8.5" y1="9" x2="8.5" y2="18"/>
      <path d="M8.5 9c-1.5-2-0.5-4 1-4s2 2 0 4"/>
      <path d="M8.5 9c1.5-2 0.5-4-1-4s-2 2 0 4"/>
      <circle cx="17" cy="15" r="3.5"/>
      <line x1="19.5" y1="17.5" x2="22" y2="20"/>
    </svg>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="m-sidebar">
        <div className="m-logo">
          <div className="m-logo-mark"><LogoMark size={22} /></div>
          <div className="m-logo-wordmark">Muhtar</div>
        </div>
        <nav className="m-nav">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`m-nav-item ${pathname === href ? "active" : ""}`}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
        <div className="m-sidebar-footer">
          <div>AI GIFT FINDER</div>
          <div>v2.0 · PMU 2026</div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="m-mobile-sheet" onClick={onMobileClose}>
          <div className="m-mobile-sheet-panel" onClick={(e) => e.stopPropagation()}>
            <div className="m-logo">
              <div className="m-logo-mark"><LogoMark size={22} /></div>
              <div className="m-logo-wordmark">Muhtar</div>
            </div>
            <nav className="m-nav">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`m-nav-item ${pathname === href ? "active" : ""}`} onClick={onMobileClose}>
                  <Icon />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
