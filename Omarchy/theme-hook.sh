#!/bin/bash
# Omarchy theme-set hook: refresh the spicetify Omarchy palette inside the
# Spotify client and reload its UI in place over the CEF debug port, so
# theme changes never restart the process.

set -euo pipefail

THEME_DIR="$HOME/.config/spicetify/Themes/Omarchy"
XPUI="/opt/spotify/Apps/xpui"
STATE_FILE="$HOME/.cache/spicetify-omarchy-last-colors"
FLAGS_FILE="$HOME/.config/spotify-flags.conf"
DEBUG_PORT=""
if [[ -r "$FLAGS_FILE" ]]; then
  DEBUG_PORT="$(sed -nE 's/.*--remote-debugging-port=([0-9]+).*/\1/p' "$FLAGS_FILE" | head -n 1)"
fi
DEBUG_PORT="${DEBUG_PORT:-9222}"

color() {
  printf '%s' "$(omarchy-theme-color "$1" "$2")" | sed 's/^#//'
}

# blends two hex colors; t is how much of the second is kept
mix() {
  awk -v a="${1#\#}" -v b="${2#\#}" -v t="$3" '
    function hv(c, i) { return index("0123456789abcdef", tolower(substr(c, i, 1))) - 1 }
    BEGIN {
      printf "%02x%02x%02x",
        int(hv(a,1)*16*(1-t) + hv(b,1)*16*t + 0.5),
        int(hv(a,3)*16*(1-t) + hv(b,3)*16*t + 0.5),
        int(hv(a,5)*16*(1-t) + hv(b,5)*16*t + 0.5)
    }'
}

rgb() {
  awk -v x="${1#\#}" '
    function hv(c, i) { return index("0123456789abcdef", tolower(substr(c, i, 1))) - 1 }
    BEGIN { printf "%d,%d,%d", hv(x,1)*16+hv(x,2), hv(x,3)*16+hv(x,4), hv(x,5)*16+hv(x,6) }'
}

text=$(color foreground 0b0b0b)
bg=$(color background ffffff)
bg_dark=$(color dark_background "#$bg")
card=$(color lighter_background "#$bg")
muted=$(color muted "$text")
bright_text=$(color bright_foreground "$text")
accent=$(color accent "$text")
red=$(color red ff5345)
subtext=$(mix "$text" "$muted" 0.4)
disabled=$(mix "$muted" "$bg" 0.4)
# light mode needs darker buttons for contrast, dark mode brighter ones
[[ $(color mode dark) == dark ]] && btn_mix="#ffffff" || btn_mix="#000000"
button=$(mix "$accent" "$btn_mix" 0.3)

mkdir -p "$THEME_DIR"

cat >"$THEME_DIR/color.ini" <<EOF
[omarchy]
text               = $text
subtext            = $subtext
main               = $bg
main-elevated      = $bg
highlight          = $card
highlight-elevated = $card
sidebar            = $bg_dark
player             = $bg
card               = $card
shadow             = $bg
selected-row       = $bright_text
button             = $button
button-active      = $button
button-disabled    = $disabled
tab-active         = $bright_text
notification       = $card
notification-error = $red
misc               = $bg
EOF

if [[ -f $STATE_FILE ]] && cmp -s "$THEME_DIR/color.ini" "$STATE_FILE" \
  && cmp -s "$XPUI/colors.css" "$STATE_FILE.xpui" \
  && cmp -s "$XPUI/user.css" "$THEME_DIR/user.css"; then
  exit 0
fi

# colors.css/user.css mirror what spicetify's apply/watch produce, minus the
# preprocessing they also do; palette swaps alone are safe to do here.
{
  printf ':root {\n'
  awk -F' *= *' '
    /^\[/ { next }
    /=/ {
      key = $1; gsub(/[[:space:]]/, "", key)
      value = $2; gsub(/[[:space:]]/, "", value)
      rt  = (index("0123456789abcdef", tolower(substr(value,1,1))) - 1) * 16
      rt +=  index("0123456789abcdef", tolower(substr(value,2,1))) - 1
      gr  = (index("0123456789abcdef", tolower(substr(value,3,1))) - 1) * 16
      gr +=  index("0123456789abcdef", tolower(substr(value,4,1))) - 1
      bl  = (index("0123456789abcdef", tolower(substr(value,5,1))) - 1) * 16
      bl +=  index("0123456789abcdef", tolower(substr(value,6,1))) - 1
      printf "    --spice-%s: #%s;\n    --spice-rgb-%s: %d,%d,%d;\n", key, value, key, rt, gr, bl
    }' "$THEME_DIR/color.ini"
  printf '}\n'
} >"$XPUI/colors.css"
cp "$THEME_DIR/user.css" "$XPUI/user.css"

mkdir -p "$(dirname "$STATE_FILE")"
cp "$THEME_DIR/color.ini" "$STATE_FILE"
cp "$XPUI/colors.css" "$STATE_FILE.xpui"

pgrep -f /opt/spotify/spotify >/dev/null || exit 0

# reload the running UI over the CEF debug port (no process restart)
SPOTIFY_DEBUG_PORT="$DEBUG_PORT" python3 <<'PY' || true
import json, os, base64, socket, struct, urllib.parse, urllib.request

try:
    port = os.environ["SPOTIFY_DEBUG_PORT"]
    pages = [p for p in json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=2))
             if p.get("type") == "page" and "spotify" in p.get("url", "")]
except OSError:
    raise SystemExit(0)

msg = json.dumps({"id": 0, "method": "Runtime.evaluate",
                  "params": {"expression": "window.location.reload()"}}).encode()
for p in pages:
    url = urllib.parse.urlparse(p["webSocketDebuggerUrl"])
    sock = socket.create_connection((url.hostname, url.port), 2)
    key = base64.b64encode(os.urandom(16)).decode()
    sock.sendall((f"GET {url.path} HTTP/1.1\r\n"
                  f"Host: {url.hostname}:{url.port}\r\n"
                  "Upgrade: websocket\r\nConnection: Upgrade\r\n"
                  f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
    head = b""
    while b"\r\n\r\n" not in head:
        head += sock.recv(1024)
    if b"101" not in head.splitlines()[0]:
        continue
    mask = os.urandom(4)
    frame = bytearray([0x81])
    if len(msg) > 125:
        frame += bytes([0x80 | 126]) + struct.pack(">H", len(msg))
    else:
        frame += bytes([0x80 | len(msg)])
    frame += mask + bytes(b ^ mask[i % 4] for i, b in enumerate(msg))
    sock.sendall(frame)
    sock.close()
PY
