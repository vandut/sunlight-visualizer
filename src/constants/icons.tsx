import React from 'react';

export const SunriseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="grad-sunrise" cx="0.5" cy="0.5" r="0.8">
        <stop offset="0%" stopColor="#FFEDA0" />
        <stop offset="80%" stopColor="#FDB813" />
      </radialGradient>
    </defs>
    <path d="M2 17H22" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M19 17C19 13.134 15.866 10 12 10C8.13401 10 5 13.134 5 17"
      fill="url(#grad-sunrise)"
      stroke="#FDB813"
      strokeWidth="1"
    />
    <path d="M12 10V7" stroke="#FDB813" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 12L6.5 10" stroke="#FDB813" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15.5 12L17.5 10" stroke="#FDB813" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SunsetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="grad-sunset" cx="0.5" cy="0.5" r="0.8">
        <stop offset="0%" stopColor="#FFC9A1" />
        <stop offset="80%" stopColor="#E94A68" />
      </radialGradient>
    </defs>
    <path d="M2 17H22" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M19 17C19 20.866 15.866 24 12 24C8.13401 24 5 20.866 5 17"
      fill="url(#grad-sunset)"
      stroke="#E94A68"
      strokeWidth="1"
    />
    <path d="M12 9L12 13" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 11.5L12 13L14 11.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);