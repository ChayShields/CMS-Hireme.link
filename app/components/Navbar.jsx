"use client";

import LinkButton from "../../components/LinkButton";

export default function Navbar() {
  return (
    <nav className="site-navbar">
      <div className="site-navbar-glass">
        <div className="site-navbar-bar">
          <div className="cms-brand">
            <span className="cms-mark">C</span>
            <span className="cms-brand-title">CMS</span>
          </div>
          <LinkButton href="/login" variant="filled">
            Log in
          </LinkButton>
        </div>
      </div>
    </nav>
  );
}
