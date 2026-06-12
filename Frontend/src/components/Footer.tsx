import React from 'react';
import { Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <Film size={14} className="nav-icon" style={{ color: 'var(--color-primary)' }} />
          <span>Cine<span className="accent-text">Pass</span></span>
        </div>
        <p>© 2026 CinePass. All rights reserved. Foundations Capstone Certification.</p>
      </div>
    </footer>
  );
};
