import { GetCurrentLyricsContainerInstance } from "../../utils/Lyrics/Applyer/CreateLyricsContainer.ts";
import { SyncNoLyricsLayout } from "../../utils/Lyrics/LyricsNotice.ts";
import { ResetLastLine } from "../../utils/Scrolling/ScrollToActiveLine.ts";
import { $currentLyricsData } from "../../utils/stores.ts";
import { $forceCompactMode, $isNowBarOpen } from "../../utils/uiState.ts";
import Global from "../Global/Global.ts";
import PageView, { Compactify, GetPageRoot, PageContainer, Tooltips } from "../Pages/PageView.ts";
import { EnableCompactMode, IsCompactMode } from "./CompactMode.ts";
import { CleanUpNowBarComponents, CloseNowBar, DeregisterNowBarBtn, OpenNowBar } from "./NowBar.ts";
import TransferElement from "./TransferElement.ts";
import { cancelCappedFrame, requestCappedFrame } from "../../utils/AnimationFrameLoop.ts";

const Fullscreen = {
  Open,
  Close,
  CloseImmediately,
  Toggle,
  IsOpen: false,
  CinemaViewOpen: false,
};

let EventAbortController: AbortController | undefined;

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

/* Spotify draws its menu button (top left) and window buttons (top right) natively over the web
   content, and holds their places in the global nav with empty spacers. Cinema View stays in the
   window, so those buttons sit over the page too. The page's corner controls line up with them
   the way the nav does: on the nav bar's centreline, no taller than its buttons, and set off from
   each spacer by the gap of the flex row it sits in. */
const NATIVE_CHROME_VARS = [
  "--NativeChromeMid",
  "--NativeChromeControlMax",
  "--NativeChromeLeftInset",
  "--NativeChromeRightInset",
] as const;

function syncNativeChromeInsets(page: HTMLElement) {
  const spacerIn = (row: HTMLElement | null, edge: "first" | "last") => {
    const el = edge === "first" ? row?.firstElementChild : row?.lastElementChild;
    return el instanceof HTMLElement && el.childElementCount === 0 && el.offsetWidth > 0
      ? el.getBoundingClientRect()
      : null;
  };
  const gapOf = (row: HTMLElement) => parseFloat(getComputedStyle(row).columnGap) || 0;

  const navBar = document.querySelector<HTMLElement>("#global-nav-bar");
  const leftRow = document.querySelector<HTMLElement>(".main-globalNav-historyButtonsWrapper");
  const rightRow = document.querySelector<HTMLElement>(".main-globalNav-contentRight");
  const left = spacerIn(leftRow, "first");
  const right = spacerIn(rightRow, "last");

  const values: Record<(typeof NATIVE_CHROME_VARS)[number], number | null> = {
    "--NativeChromeMid": null,
    "--NativeChromeControlMax": null,
    "--NativeChromeLeftInset": left && leftRow ? left.right + gapOf(leftRow) : null,
    "--NativeChromeRightInset":
      right && rightRow ? window.innerWidth - right.left + gapOf(rightRow) : null,
  };
  if (navBar && leftRow && (left || right)) {
    const bar = navBar.getBoundingClientRect();
    values["--NativeChromeMid"] = bar.top + bar.height / 2;
    values["--NativeChromeControlMax"] = leftRow.getBoundingClientRect().height;
  }

  // Every write restyles the whole page, so unchanged values are skipped.
  for (const name of NATIVE_CHROME_VARS) {
    const value = values[name] === null ? "" : `${values[name]}px`;
    if (page.style.getPropertyValue(name) === value) continue;
    if (value) page.style.setProperty(name, value);
    else page.style.removeProperty(name);
  }
}

function clearNativeChromeInsets(page: HTMLElement) {
  for (const name of NATIVE_CHROME_VARS) page.style.removeProperty(name);
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
  setTimeout(Compactify, 1000);
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

  setTimeout(Compactify, 1000);
};

export function CleanupMediaBox() {
  EventAbortController?.abort();
  EventAbortController = undefined;
}

// Bumped by every Open and Close. The deferred work either one schedules checks
// it before touching the page, so a later transition (or the page being
// destroyed) cancels it instead of being overwritten by it.
let fullscreenGeneration = 0;
let closeInFlight: Promise<boolean> | null = null;

/** True while an animated Close is playing its exit animation. */
export const IsFullscreenClosing = () => closeInFlight !== null;

function Open(skipDocumentFullscreen: boolean = false, moveElement: boolean = true) {
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
    Fullscreen.CinemaViewOpen = skipDocumentFullscreen;

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
    CleanupMediaBox();
    OpenNowBar(true);

    // Handle fullscreen state
    const handleFullscreen = async () => {
      try {
        if (!skipDocumentFullscreen) {
          await EnterSpicyLyricsFullscreen();
        }
        setTimeout(() => PageView.AppendViewControls(true), 50);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Fullscreen error: ${errorMessage}`);
      }
    };

    handleFullscreen();
    ResetLastLine();

    // Setup media box interactions
    const MediaBox = SpicyPage.querySelector<HTMLElement>(
      ".ContentBox .NowBar .Header .MediaBox"
    );
    const MediaImageContainer = SpicyPage.querySelector<HTMLElement>(
      ".ContentBox .NowBar .Header .MediaBox .MediaImageContainer"
    );

    if (MediaBox && MediaImageContainer) {
      // Create and store the AbortController
      EventAbortController = new AbortController();
      const signal = EventAbortController.signal;

      syncNativeChromeInsets(SpicyPage);
      // Resize fires on every pointer move of a window drag; one measure per frame is enough.
      let syncFrame: number | null = null;
      const sync = () => {
        if (syncFrame !== null) return;
        syncFrame = requestCappedFrame(() => {
          syncFrame = null;
          syncNativeChromeInsets(SpicyPage);
        });
      };
      signal.addEventListener("abort", () => {
        if (syncFrame !== null) cancelCappedFrame(syncFrame);
      });
      window.addEventListener("resize", sync, { signal });
      // On zoom, Spotify resizes the spacers only once it writes --zoom-level on .Root, after the resize event.
      const root = document.querySelector<HTMLElement>(".Root");
      if (root) {
        // The attribute carries other values too; only a zoom change moves the spacers.
        let zoom = root.style.getPropertyValue("--zoom-level");
        const zoomObserver = new MutationObserver(() => {
          const next = root.style.getPropertyValue("--zoom-level");
          if (next === zoom) return;
          zoom = next;
          sync();
        });
        zoomObserver.observe(root, { attributes: true, attributeFilter: ["style"] });
        signal.addEventListener("abort", () => zoomObserver.disconnect());
      }
    }

    Global.Event.evoke("fullscreen:open", null);
  }
  setTimeout(() => {
    if (!stillOpen()) return;

    Compactify();

    if ($forceCompactMode.get() && !IsCompactMode()) {
      SpicyPage?.classList.add("ForcedCompactMode");
      EnableCompactMode();
    }
  }, 750);

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
  clearNativeChromeInsets(SpicyPage);

  void ExitFullscreenElement().then(() => {
    if (transfer) setTimeout(() => PageView.AppendViewControls(true), 50);
  });

  SyncNoLyricsLayout();
  if (transfer && $currentLyricsData.get().includes("NO_LYRICS")) DeregisterNowBarBtn();

  ResetLastLine();

  if (!$isNowBarOpen.get()) {
    CloseNowBar();
  }

  CleanupMediaBox();
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
  Fullscreen.CinemaViewOpen = false;

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
    setTimeout(Compactify, 1000);
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
  Fullscreen.CinemaViewOpen = false;
  document.body.style.removeProperty("pointer-events");

  showMainElement();
  finishClose(SpicyPage, false);
}

function Toggle(skipDocumentFullscreen: boolean = false) {
  const SpicyPage = PageContainer;

  if (SpicyPage) {
    if (Fullscreen.IsOpen) {
      Close();
    } else {
      Open(skipDocumentFullscreen);
    }
  }
}

export default Fullscreen;
