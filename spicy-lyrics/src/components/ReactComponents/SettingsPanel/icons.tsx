import React from "react";

/** 16px line icons for the sidebar, drawn on one 1.5px stroke so they read as a set. */
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const LyricsIcon = (
  <Icon>
    <path d="M2.5 4h11M2.5 8h7.5M2.5 12h9" />
  </Icon>
);

export const BackgroundIcon = (
  <Icon>
    <rect x="2" y="2.75" width="12" height="10.5" rx="2" />
    <path d="M2.5 11l3.25-3.25L9 11l1.75-1.75L13.5 12" />
    <circle cx="10.75" cy="5.75" r="1" />
  </Icon>
);

// A stopwatch: the tab holds the sync offset and scroll timing.
export const PlaybackIcon = (
  <Icon>
    <circle cx="8" cy="9" r="5" />
    <path d="M8 6.75V9l1.5 1M6.5 1.75h3M8 1.75V4" />
  </Icon>
);

export const InterfaceIcon = (
  <Icon>
    <rect x="2" y="2.75" width="12" height="10.5" rx="2" />
    <path d="M6 2.75v10.5" />
  </Icon>
);

// Type specimen: the tab is the font and how smoothly it draws.
export const AppearanceIcon = (
  <Icon>
    <path d="M1.75 13 5.5 3l3.75 10M3.1 9.5h4.8" />
    <circle cx="12" cy="10.75" r="2.25" />
    <path d="M14.25 8.5V13" />
  </Icon>
);

export const AdvancedIcon = (
  <Icon>
    <path d="M3 4.5l3 3.5-3 3.5M8 11.5h5" />
  </Icon>
);

export const CloseIcon = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M1.5 1.5l9 9M10.5 1.5l-9 9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const ChevronIcon = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path
      d="M3.5 2l3 3-3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
