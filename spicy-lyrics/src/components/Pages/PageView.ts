import { createTooltip } from "../../utils/tooltip.ts";
import fetchLyrics, { ShowQueueLoader } from "../../utils/Lyrics/fetchLyrics.ts";
import { LyricsQueueRetry } from "../../utils/Lyrics/LyricsQueueRetry.ts";
import { SkeletonMarkup } from "../../utils/Lyrics/LyricsSkeleton.ts";
import "../../css/Loaders/DotLoader.css";
import { DestroyAllLyricsContainers } from "../../utils/Lyrics/Applyer/CreateLyricsContainer.ts";
import ApplyLyrics, {
  cleanupApplyLyricsAbortController,
} from "../../utils/Lyrics/Global/Applyer.ts";
import {
  addLinesEvListener,
  isRomanized,
  removeLinesEvListener,
  setRomanizedStatus,
} from "../../utils/Lyrics/lyrics.ts";
import {
  CleanupScrollEvents,
  InitializeScrollEvents,
  ResetLastLine,
} from "../../utils/Scrolling/ScrollToActiveLine.ts";
import {
  ClearScrollSimplebar,
  ScrollSimplebar,
} from "../../utils/Scrolling/Simplebar/ScrollSimplebar.ts";
import ApplyStaticBackground from "../Styling/StaticBackground.ts";
import {
  $currentLyricsData,
  $joinSplitWords,
  $lyricsContainerExists,
  $lyricsSkeleton,
  $simpleLyricsMode,
  $skipSpicyFont,
} from "../../utils/stores.ts";
import Global from "../Global/Global.ts";
import Session from "../Global/Session.ts";
import { SpotifyPlayer } from "../Global/SpotifyPlayer.ts";
import { Icons } from "../Styling/Icons.ts";
import Fullscreen, { IsFullscreenClosing } from "../Utils/Fullscreen.ts";
import {
  NowBarObj,
  NowBar_SwapSides,
  Session_NowBar_SetSide,
  Session_OpenNowBar,
  ToggleNowBar,
} from "../Utils/NowBar.ts";
import TransferElement from "../Utils/TransferElement.ts";
import { CleanUpIsByCommunity } from "../../utils/Lyrics/Applyer/Credits/ApplyIsByCommunity.tsx";
import { OpenLyricsDBPanel } from "../../utils/openLyricsDBPanel.tsx";
import { openSettingsPanel } from "../../utils/settings.ts";
import Logger from "../../utils/Logger.ts";
import { setStockPlaybarPage } from "../../utils/themeMatcher.ts";
import { triggerRemeasureLV } from "../../utils/Lyrics/LyricsVirtualizer.ts";

const pageLogger = new Logger("Page View");
const controlsLogger = new Logger("View Controls");

interface TippyInstance {
  destroy: () => void;
  [key: string]: any;
}

export const Tooltips: {
  Close: TippyInstance | null;
  RomanizationToggle: TippyInstance | null;
  NowBarToggle: TippyInstance | null;
  FullscreenToggle: TippyInstance | null;
  NowBarSideToggle: TippyInstance | null;
  LyricsManager: TippyInstance | null;
  Settings: TippyInstance | null;
} = {
  Close: null,
  RomanizationToggle: null,
  NowBarToggle: null,
  FullscreenToggle: null,
  NowBarSideToggle: null,
  LyricsManager: null,
  Settings: null,
};

const PageView = {
  Open: OpenPage,
  Destroy: DestroyPage,
  AppendViewControls,
  IsOpened: false,
  IsTippyCapable: true,
};

export const GetPageRoot = () =>
  /* document.querySelector<HTMLElement>(".QdB2YtfEq0ks5O4QbtwX .WRGTOibB8qNEkgPNtMxq") ?? */
  document.querySelector<HTMLElement>(
    ":is(.Root__main-view, :where(#main-view)) .main-view-container div[data-overlayscrollbars-viewport]"
  ) ??
  (() => {
    const child = document.querySelector<HTMLElement>(
      ":is(.Root__main-view, :where(#main-view)) .main-view-container .main-view-container__scroll-node-child"
    );
    return child?.parentElement as HTMLElement | null;
  })() ??
  document.querySelector<HTMLElement>(
    ":is(.Root__main-view, :where(#main-view)) .main-view-container .os-host"
  ) ??
  document.querySelector<HTMLElement>(
    ":is(.Root__main-view, :where(#main-view)) .main-view-container .uGZUPBPcDpzSYqKcQT8r > div"
  );

let PageMountObserver: MutationObserver | null = null;

function cancelPendingPageMount() {
  PageMountObserver?.disconnect();
  PageMountObserver = null;
}

export let PageContainer: HTMLElement | null = null;
async function OpenPage(AppendTo: HTMLElement | undefined = undefined) {

  cancelPendingPageMount();
  if (PageView.IsOpened) return;

  // The main-view page belongs to the /SpicyLyrics route. The awaits above can
  // outlast a quick navigate-away; opening now would strand the page on
  // whatever route the user moved to, with nothing left to destroy it.
  if (
    AppendTo === undefined &&
    Spicetify.Platform?.History?.location?.pathname !== "/SpicyLyrics"
  ) {
    return;
  }

  const pageRoot = AppendTo ?? GetPageRoot();
  if (!pageRoot) {
    pageLogger.warn("Cannot open page: main view is unavailable");
    if (AppendTo === undefined) {
      PageMountObserver = new MutationObserver(() => {
        if (Spicetify.Platform.History.location.pathname !== "/SpicyLyrics") {
          cancelPendingPageMount();
          return;
        }
        if (!GetPageRoot()) return;
        cancelPendingPageMount();
        void OpenPage();
      });
      PageMountObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
    return;
  }

  /* if (!HoverMode) {
        PageView.IsTippyCapable = false;
    } */
  const elem = document.createElement("div");
  elem.id = "SpicyLyricsPage";
  // Spotify's OverlayScrollbars ignores mutations inside
  // this marker. Without it, every per-frame word style write made it re-measure
  // its viewport, forcing an extra style + layout pass mid-frame. The page's size
  // never depends on its content, so there is nothing for it to pick up.
  elem.setAttribute("data-scroll-size-contained", "");

  elem.classList.add("SpicyRenderer");


  /* if (HoverMode) {
        elem.classList.add("TippyMode");
    } */
  //const extractedColors = ((await Spicetify.colorExtractor(SpotifyPlayer.GetUri() ?? "spotify:track:31CsSZ9KlQmEu0JvWSkM3j")) as any) ?? { VIBRANT_NON_ALARMING: "#999999" };
  //const vibrantNonAlarmingColor = extractedColors?.VIBRANT_NON_ALARMING ?? "#999999";
  elem.innerHTML = `
        <div class="ContentBox">
            <div class="NowBar">
                <div class="CenteredView">
                    <div class="Header">
                        <div class="MediaBox">
                            <div class="MediaContent"></div>
                            <div class="MediaImageContainer">
                              <div class="fi_FromImage ib_ImageBox"></div>
                              <div class="ti_ToImage ib_ImageBox"></div>
                            </div>
                        </div>
                        <div class="Metadata">
                            <div class="SongName">
                                <span></span>
                            </div>
                            <div class="Artists">
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="LyricsContainer">
                <div class="loaderContainer">
                    <div id="DotLoader"></div>
                </div>
                ${SkeletonMarkup}
                <div class="LyricsContent ScrollbarScrollable"></div>
            </div>
            <div class="ViewControls"></div>
        </div>
    `;

  /* 
        <div class="SongMoreInfo">
            <div class="Content">
                <div class="SongMetadata">
                    <img src="" class="SongArtwork">
                    <div class="SongMetadataTextContent">
                        <p class="SongName">
                            <span></span>
                        </p>
                        <p class="ArtistsNames">
                            <span></span>
                        </p>
                    </div>
                </div>
                <div class="SongAnnotation">
                    <div class="BackgroundVisualizer">    
                        <p class="Annotation">
                            <span></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    */

  
  PageContainer = elem;

  if (!$skipSpicyFont.get()) {
    elem.classList.add("UseSpicyFont");
  }

  if ($simpleLyricsMode.get()) {
    elem.classList.add("SimpleLyricsMode");
  }

  elem.classList.toggle("ShowLyricsSkeleton", $lyricsSkeleton.get());

  const contentBox = elem.querySelector<HTMLElement>(
    ".ContentBox"
  );
  if (contentBox) ApplyStaticBackground(contentBox);

  pageRoot.appendChild(elem);

  addLinesEvListener();

  {
    const currentUri = Spicetify?.Player?.data?.item?.uri;
    if (currentUri) {
      // If a 503 retry loop is already running for this track, re-show the
      // queue loader right away so reopening the page / swapping views restores
      // the queued state with no flash of empty content.
      if (LyricsQueueRetry.IsRetryingFor(currentUri)) {
        ShowQueueLoader();
      }
      fetchLyrics(currentUri).then(ApplyLyrics);
    }
  }

  {
    Session_OpenNowBar();

    /* const ArtworkButton = document.querySelector<HTMLElement>("#SpicyLyricsPage .ContentBox .NowBar .Header .Artwork");

      ArtworkButton.addEventListener("click", () => {
          NowBar_SwapSides();
      }) */

    Session_NowBar_SetSide();

    AppendViewControls();
  }

  if (AppendTo === undefined) {
    const legacyPage = document.querySelector<HTMLElement>(
      ":is(.Root__main-view, :where(#main-view)) .main-view-container .os-host"
    );
    if (legacyPage) {
      legacyPage.style.containerType = "inline-size";
    }
  }

  // UpdateSongMoreInfo()

  $lyricsContainerExists.set(true);
  PageView.IsOpened = true;
  setStockPlaybarPage(elem);

  PageContainer = elem;

  const contentType = SpotifyPlayer.GetContentType();
  if (contentType === "episode") {
    elem?.classList.add("episode-content-type");
  } else {
    elem?.classList.remove("episode-content-type");
  }

  Global.Event.evoke("page:open", null);
}

/* Global.Event.listen("playback:songchange", () => {
    if (!PageView.IsOpened) return;
    UpdateSongMoreInfo();
}) */

// Deliberately synchronous (async only so callers can keep awaiting it): an
// await in here let an Open, a second Destroy, or a Fullscreen close tail run
// against a half torn-down page.
async function DestroyPage() {
  cancelPendingPageMount();
  if (!PageView.IsOpened) return;
  pageLogger.debug("Destroying page");
  PageView.IsOpened = false;

  cleanupApplyLyricsAbortController();

  // Skip the exit animation — the page is going away — and cancel any animated
  // close already playing, so it can't re-insert this page afterwards.
  Fullscreen.CloseImmediately();

  ResetLastLine();
  CleanupScrollEvents();
  $lyricsContainerExists.set(false);
  DestroyAllLyricsContainers();
  CleanUpIsByCommunity();

  const legacyPage = document.querySelector<HTMLElement>(
    ":is(.Root__main-view, :where(#main-view)) .main-view-container .os-host"
  );
  if (legacyPage) {
    legacyPage.style.containerType = "";
  }

  PageContainer?.remove();
  setStockPlaybarPage(null);
  removeLinesEvListener();
  (Object.keys(Tooltips) as (keyof typeof Tooltips)[]).forEach((key) => {
    Tooltips[key]?.destroy();
    Tooltips[key] = null;
  });
  ClearScrollSimplebar();
  Global.Event.evoke("page:destroy", null);
  PageView.IsTippyCapable = true;
  PageContainer = null;
}

export let LyricsApplied = false;

Global.Event.listen("lyrics:not-apply", () => {
  CleanupScrollEvents();
  LyricsApplied = false;
  CleanUpIsByCommunity();
});

Global.Event.listen("lyrics:apply", ({ Type }: { Type: string }) => {
  CleanupScrollEvents();

  if (!Type || Type === "Static") return;
  if (ScrollSimplebar) {
    InitializeScrollEvents(ScrollSimplebar);
    //QueueForceScroll(); // Queue a force scroll instead of directly calling with true
    LyricsApplied = true;
  }

  setTimeout(() => triggerRemeasureLV(), 1500);
});

function AppendViewControls(ReAppend: boolean = false) {
  if (!PageContainer) return;
  controlsLogger.debug("Append view controls");
  const elem = PageContainer.querySelector<HTMLElement>(
    ".ContentBox .ViewControls"
  );
  if (!elem) return;

  // Safely destroy existing tooltips first
  Object.keys(Tooltips).forEach((key) => {
    const tippy = Tooltips[key as keyof typeof Tooltips];
    if (tippy?.destroy && typeof tippy.destroy === "function") {
      tippy.destroy();
      Tooltips[key as keyof typeof Tooltips] = null;
    }
  });

  if (ReAppend) elem.innerHTML = "";
  const isNoLyrics =
    $currentLyricsData.get() === `NO_LYRICS:${SpotifyPlayer.GetUri()}`;
  elem.innerHTML = `
        <button id="RomanizationToggle" class="ViewControl">
          ${
            isRomanized
              ? Icons.DisableRomanization
              : Icons.EnableRomanization
          }
        </button>
        ${
          !Fullscreen.IsOpen
            ? `<button id="NowBarToggle" class="ViewControl">${Icons.NowBar}</button>`
            : ""
        }
        ${
          NowBarObj.Open
            ? `<button id="NowBarSideToggle" class="ViewControl">${Icons.NowBarSideSwap}</button>`
            : ""
        }
        <button id="FullscreenToggle" class="ViewControl">${
          Fullscreen.IsOpen ? Icons.CloseFullscreen : Icons.Fullscreen
        }</button>
        <button id="LyricsManager" class="ViewControl">${Icons.LyricsManager}</button>
        <button id="SettingsToggle" class="ViewControl">${Icons.Settings}</button>
        <button id="Close" class="ViewControl">${Icons.Close}</button>
    `;

  let targetElem: HTMLElement | null = elem;
  if (Fullscreen.IsOpen) {
    const mediaContent = PageContainer?.querySelector<HTMLElement>(
      ".ContentBox .NowBar .Header .MediaBox .MediaContent"
    );
    if (mediaContent) {
      TransferElement(elem, mediaContent);
      const viewControls =
        mediaContent.querySelector<HTMLElement>(".ViewControls");
      if (viewControls) {
        targetElem = viewControls;
      }
    }
  } else {
    const contentBox = PageContainer?.querySelector<HTMLElement>(".ContentBox");
    if (
      PageContainer?.querySelector<HTMLElement>(
        ".ContentBox .NowBar .Header .ViewControls"
      ) &&
      contentBox
    ) {
      TransferElement(elem, contentBox);
    }
  }

  if (targetElem) {
    SetupTippy(targetElem);
  }

  function SetupTippy(elem: HTMLElement) {
    const closeButton = elem.querySelector("#Close");
    if (closeButton) {
      try {
        Tooltips.Close = createTooltip(closeButton, {
          ...Spicetify.TippyProps,
          content: `Close Page`,
        });
        closeButton.addEventListener("click", async () => {
          // A superseded close (the user navigated, or reopened the page,
          // during the exit animation) must not navigate on top of that.
          // A second click mid-animation joins the running close.
          if (
            (Fullscreen.IsOpen || IsFullscreenClosing()) &&
            !(await Fullscreen.Close())
          ) {
            return;
          }

          Session.GoBackFrom("/SpicyLyrics");
        });
      } catch (err) {
        controlsLogger.warn("Failed to setup Close tooltip", err);
      }
    }

    const romanizationToggle = elem.querySelector("#RomanizationToggle");
    if (romanizationToggle) {
      try {
        Tooltips.RomanizationToggle = createTooltip(romanizationToggle, {
          ...Spicetify.TippyProps,
          content: isRomanized ? `Disable Romanization` : `Enable Romanization`,
        });
        romanizationToggle.addEventListener("click", async () => {
          const songUri = SpotifyPlayer.GetUri();
          if (!songUri) return;
          PageContainer?.querySelector(
            ".LyricsContainer .LyricsContent"
          )?.classList.add("HiddenTransitioned");
          // Flip first: if a fetch for this track is already in flight,
          // fetchLyrics returns null and that fetch's own apply renders —
          // it reads the flag at apply time, so it picks this change up.
          setRomanizedStatus(!isRomanized);

          const lyrics = await fetchLyrics(songUri);
          if (lyrics) await ApplyLyrics(lyrics);

          setTimeout(() => {
            AppendViewControls();
            PageContainer?.querySelector(
              ".LyricsContainer .LyricsContent"
            )?.classList.remove("HiddenTransitioned");
          }, 45);
        });
      } catch (err) {
        controlsLogger.warn("Failed to setup Romanization tooltip", err);
      }
    }

    if (!Fullscreen.IsOpen) {
      const nowBarButton = elem.querySelector("#NowBarToggle");
      if (nowBarButton) {
        try {
          Tooltips.NowBarToggle = createTooltip(nowBarButton, {
            ...Spicetify.TippyProps,
            content: `NowBar`,
          });
          nowBarButton.addEventListener("click", () => ToggleNowBar());
        } catch (err) {
          controlsLogger.warn("Failed to setup NowBar tooltip", err);
        }
      }

    }

    const fullscreenBtn = elem.querySelector("#FullscreenToggle");
    if (fullscreenBtn) {
      try {
        Tooltips.FullscreenToggle = createTooltip(fullscreenBtn, {
          ...Spicetify.TippyProps,
          content: Fullscreen.IsOpen ? "Close Fullscreen" : "Fullscreen",
        });
        fullscreenBtn.addEventListener("click", async () => {
          if (Fullscreen.IsOpen) {
            await Fullscreen.Close();
          } else {
            Fullscreen.Open();
          }
          PageView.AppendViewControls(true);
        });
      } catch (err) {
        controlsLogger.warn("Failed to setup Fullscreen tooltip", err);
      }
    }

    const nowBarSideToggleBtn = elem.querySelector("#NowBarSideToggle");
    if (
      nowBarSideToggleBtn &&
      NowBarObj.Open &&
      !(isNoLyrics && Fullscreen.IsOpen)
    ) {
      try {
        Tooltips.NowBarSideToggle = createTooltip(nowBarSideToggleBtn, {
          ...Spicetify.TippyProps,
          content: `Swap NowBar Side`,
        });
        nowBarSideToggleBtn.addEventListener("click", () => NowBar_SwapSides());
      } catch (err) {
        controlsLogger.warn("Failed to setup NowBar Side Toggle tooltip", err);
      }
    }

    const settingsButton = elem.querySelector("#SettingsToggle");
    if (settingsButton) {
      try {
        Tooltips.Settings = createTooltip(settingsButton, {
          ...Spicetify.TippyProps,
          content: `Spicy Lyrics Settings`,
        });
        settingsButton.addEventListener("click", () => {
          openSettingsPanel();
        });
      } catch (err) {
        controlsLogger.warn("Failed to setup Settings tooltip", err);
      }
    }

    const lyricsManagerButton = elem.querySelector("#LyricsManager");
    if (lyricsManagerButton) {
      try {
        Tooltips.LyricsManager = createTooltip(lyricsManagerButton, {
          ...Spicetify.TippyProps,
          content: `Lyrics Manager`,
        });
        lyricsManagerButton.addEventListener("click", () => {
          OpenLyricsDBPanel();
        });
      } catch (err) {
        controlsLogger.warn("Failed to setup Lyrics Manager tooltip", err);
      }
    }
  }
}

// --- Reactive setting subscriptions ---

$simpleLyricsMode.listen((v) => {
  if (!PageContainer) return;
  PageContainer.classList.toggle("SimpleLyricsMode", v);
  const uri = SpotifyPlayer.GetUri();
  $currentLyricsData.set("");
  if (uri) fetchLyrics(uri).then(ApplyLyrics);
});

$joinSplitWords.listen(() => {
  const uri = SpotifyPlayer.GetUri();
  $currentLyricsData.set("");
  if (uri) fetchLyrics(uri).then(ApplyLyrics);
});

$skipSpicyFont.listen((v) => {
  if (!PageContainer) return;
  PageContainer.classList.toggle("UseSpicyFont", !v);
});

// Purely a CSS gate for the loading placeholder.
$lyricsSkeleton.listen((v) => {
  if (!PageContainer) return;
  PageContainer.classList.toggle("ShowLyricsSkeleton", v);
});

export default PageView;
