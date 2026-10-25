import { SpotifyPlayer } from "../Global/SpotifyPlayer.ts";
import { $backgroundBlur, $backgroundStyle } from "../../utils/stores.ts";

const apply = (host: HTMLElement, background: HTMLElement) => {
  const style = $backgroundStyle.get();
  host.closest("#SpicyLyricsPage")?.classList.toggle("NoBackground", style === "none");
  background.style.backgroundImage = "none";
  background.style.backgroundColor = "";
  background.style.setProperty("--BackgroundImageBlur", `${$backgroundBlur.get()}px`);

  if (style === "none") return;
  if (style === "color") {
    const uri = SpotifyPlayer.GetUri();
    if (uri) void Spicetify.colorExtractor(uri).then((colors) => {
      if ($backgroundStyle.get() === "color" && background.isConnected) {
        background.style.backgroundColor = colors.DARK_VIBRANT || colors.PROMINENT;
      }
    }).catch(() => {});
    return;
  }

  const cover = SpotifyPlayer.GetCover("xlarge");
  background.style.backgroundImage = cover ? `url("${cover}")` : "none";
  if (style === "artist") {
    const artistUri = SpotifyPlayer.GetArtists()?.[0]?.uri;
    const trackUri = SpotifyPlayer.GetUri();
    if (!artistUri || !trackUri) return;
    void Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.queryNpvArtist, {
      artistUri,
      trackUri,
      enableRelatedVideos: false,
      enableRelatedAudioTracks: false,
    }).then((response) => {
      const image = response?.data?.artistUnion?.headerImage?.data?.sources?.[0]?.url;
      if ($backgroundStyle.get() !== "artist" || SpotifyPlayer.GetUri() !== trackUri || !background.isConnected || !image) return;
      background.style.backgroundImage = `url("${image}")`;
    }).catch(() => {});
  }
};

export default function ApplyStaticBackground(host: HTMLElement): void {
  let background = host.querySelector<HTMLElement>(".spicy-dynamic-bg");
  if (!background) {
    background = document.createElement("div");
    background.className = "spicy-dynamic-bg StaticBackground";
    host.prepend(background);
  }

  apply(host, background);
}

export function RefreshStaticBackground(): void {
  document.querySelectorAll<HTMLElement>("#SpicyLyricsPage .ContentBox").forEach(ApplyStaticBackground);
}

$backgroundBlur.listen(RefreshStaticBackground);
$backgroundStyle.listen(RefreshStaticBackground);
