import { GetCurrentLyricsContainerInstance } from "../../utils/Lyrics/Applyer/CreateLyricsContainer.ts";
import { SyncNoLyricsLayout } from "../../utils/Lyrics/LyricsNotice.ts";
import { ResetLastLine } from "../../utils/Scrolling/ScrollToActiveLine.ts";
import { $currentLyricsData } from "../../utils/stores.ts";
import { $isNowBarOpen } from "../../utils/uiState.ts";
import Global from "../Global/Global.ts";
import PageView, { GetPageRoot, PageContainer, Tooltips } from "../Pages/PageView.ts";
import { CleanUpNowBarComponents, CloseNowBar, DeregisterNowBarBtn, OpenNowBar } from "./NowBar.ts";
import TransferElement from "./TransferElement.ts";

const Fullscreen = {
  Open,
  Close,
  CloseImmediately,
  Toggle,
  IsOpen: false,
};


/* Hides Spotify's UI behind the fullscreen page. content-visibility rather than
   display: none, so everything inside keeps its laid-out size. With display:
   none the global nav's ResizeObserver saw its width drop to 0, and Spotify
   collapsed the search bar to an icon. It only re-expands when the window
   grows, so it stayed collapsed after fullscreen. The contents are still
   skipped for paint, layout, focus and the accessibility tree. Fixed at the
   same full-window box takes #main out of the flow like display: none did, so
   a page that ends up in flow (themes that set position: relative on it)
   still starts at the top. */
const HIDDEN_MAIN_STYLES = {
  "content-visibility": "hidden",
  position: "fixed",
  inset: "0",
} as const;

function hideMainElement(mainElement: HTMLElement) {
  for (const [property, value] of Object.entries(HIDDEN_MAIN_STYLES)) {
    mainElement.style.setProperty(property, value);
  }
}

function showMainElement() {
  const mainElement = document.querySelector<HTMLElement>("#main");
  if (!mainElement) return;
  for (const property of Object.keys(HIDDEN_MAIN_STYLES)) {
    mainElement.style.removeProperty(property);
  }
}

export const ExitFullscreenElement = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
};

export const EnterSpicyLyricsFullscreen = async () => {
  const mainElement = document.querySelector<HTMLElement>("#main");
  if (mainElement) {
    hideMainElement(mainElement);
  }

  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Fullscreen error: ${errorMessage}`);
  }

  document.documentElement.focus();
};

// Bumped by every Open and Close. The deferred work either one schedules checks
// it before touching the page, so a later transition (or the page being
// destroyed) cancels it instead of being overwritten by it.
let fullscreenGeneration = 0;
let closeInFlight: Promise<boolean> | null = null;

/** True while an animated Close is playing its exit animation. */
export const IsFullscreenClosing = () => closeInFlight !== null;

function Open(moveElement: boolean = true) {
  const SpicyPage = PageContainer;
  const Root = document.body as HTMLElement;
  const mainElement = document.querySelector<HTMLElement>("#main");
  const generation = ++fullscreenGeneration;
  // Reopening mid exit-animation supersedes that Close.
  closeInFlight = null;
  const stillOpen = () =>
    Fullscreen.IsOpen && generation === fullscreenGeneration && PageContainer === SpicyPage;

  if (SpicyPage) {
    // Set state first
    Fullscreen.IsOpen = true;

    // Handle DOM changes
    if (moveElement) TransferElement(SpicyPage, Root);
    SpicyPage.classList.add("Fullscreen");

    // Hide the main element
    if (mainElement && moveElement) {
      hideMainElement(mainElement);
    }

    // Safely destroy tooltip if it exists
    const nowBarToggle = Tooltips.NowBarToggle as any;
    if (nowBarToggle && typeof nowBarToggle.destroy === "function") {
      nowBarToggle.destroy();
    }

    const NowBarToggle = SpicyPage.querySelector<HTMLElement>(
      ".ViewControls #NowBarToggle"
    );
    if (NowBarToggle) {
      NowBarToggle.remove();
    }

    CleanUpNowBarComponents();
    OpenNowBar(true);

    void EnterSpicyLyricsFullscreen().then(() => {
      setTimeout(() => PageView.AppendViewControls(true), 50);
    });
    ResetLastLine();

    Global.Event.evoke("fullscreen:open", null);
  }

  setTimeout(() => {
    if (!stillOpen()) return;
    PageView.AppendViewControls(true);

    SyncNoLyricsLayout();
  }, 75);

  GetCurrentLyricsContainerInstance()?.Resize();
}

/**
 * Put the page back into the normal flow
 * (or leave it where it is, when it's about to be destroyed) and reset the
 * fullscreen-only NowBar/MediaBox state.
 */
function finishClose(SpicyPage: HTMLElement, transfer: boolean) {
  if (transfer) {
    const root = GetPageRoot();
    if (root) {
      TransferElement(SpicyPage, root);
    } else {
      // No main view to return to. Parking the page on <body> would strand it
      // over the whole client, so drop it instead.
      transfer = false;
      queueMicrotask(() => void PageView.Destroy());
    }
  }
  SpicyPage.classList.remove("Fullscreen", "frame_F_Exit");

  void ExitFullscreenElement().then(() => {
    if (transfer) setTimeout(() => PageView.AppendViewControls(true), 50);
  });

  SyncNoLyricsLayout();
  if (transfer && $currentLyricsData.get().includes("NO_LYRICS")) DeregisterNowBarBtn();

  ResetLastLine();

  if (!$isNowBarOpen.get()) {
    CloseNowBar();
  }

  CleanUpNowBarComponents();

  Global.Event.evoke("fullscreen:exit", null);
}

/**
 * Resolves true once this close has finished, or false if it was superseded
 * (page destroyed, fullscreen reopened) — callers that navigate after closing
 * must then leave navigation to whoever superseded it.
 */
function Close(): Promise<boolean> {
  // A second Close during the exit animation (double click, Esc + click) joins
  // the one already running instead of replaying the animation and transfer.
  if (closeInFlight) return closeInFlight;

  const SpicyPage = PageContainer;
  if (!SpicyPage) return Promise.resolve(false);

  const generation = ++fullscreenGeneration;
  Fullscreen.IsOpen = false;

  showMainElement();

  // Apply exit animation and block all interaction for its duration
  SpicyPage.classList.add("frame_F_Exit");
  document.body.style.pointerEvents = "none";

  const run = async () => {
    try {
      await new Promise((r) => setTimeout(r, 650));
    } finally {
      document.body.style.removeProperty("pointer-events");
    }

    // The page was destroyed (route change) or replaced, or fullscreen was
    // reopened or force-closed while the animation played. Whoever did that
    // owns the page now; re-inserting it here would resurrect a dead page.
    if (generation !== fullscreenGeneration || PageContainer !== SpicyPage) {
      SpicyPage.classList.remove("frame_F_Exit");
      return false;
    }

    finishClose(SpicyPage, true);
    GetCurrentLyricsContainerInstance()?.Resize();
    return true;
  };

  const promise: Promise<boolean> = run().finally(() => {
    if (closeInFlight === promise) closeInFlight = null;
  });
  closeInFlight = promise;
  return promise;
}

/**
 * Leave fullscreen synchronously, without the exit animation, for a page that
 * is about to be destroyed. Also cancels an animated Close that is mid-flight.
 */
function CloseImmediately() {
  const SpicyPage = PageContainer;
  if (!SpicyPage || (!Fullscreen.IsOpen && closeInFlight === null)) return;

  ++fullscreenGeneration;
  closeInFlight = null;
  Fullscreen.IsOpen = false;
  document.body.style.removeProperty("pointer-events");

  showMainElement();
  finishClose(SpicyPage, false);
}

function Toggle() {
  const SpicyPage = PageContainer;

  if (SpicyPage) {
    if (Fullscreen.IsOpen) {
      Close();
    } else {
      Open();
    }
  }
}

export default Fullscreen;
