// NAME: Keymap
// AUTHOR: BibekBhusal0 (based on Keyboard Shortcut by khanhas, OhItsTom)
// DESCRIPTION: vim-style keybinds for keyboard-driven navigation in the Spotify client.

/// <reference path="../globals.d.ts" />

(function KeyboardShortcut() {
	if (!Spicetify.Mousetrap) {
		setTimeout(KeyboardShortcut, 1000);
		return;
	}

	const vim = new VimBind();
	const SCROLL_STEP = 100;

	/**
	 * Binds a keyboard shortcut using Mousetrap.
	 * @param {string} key - The Mousetrap keybind.
	 * @param {boolean | undefined} staticCondition - A static condition.
	 * @param {(event: KeyboardEvent) => void} callback - Callback function for the event.
	 */
	const binds = {
		"ctrl+q": {
			callback: () =>
				Spicetify.CosmosAsync.post("sp://esperanto/spotify.desktop.lifecycle_esperanto.proto.DesktopLifecycle/Shutdown") &&
				Spicetify.CosmosAsync.post("sp://desktop/v1/shutdown"),
		},

		"shift+pageup": { callback: () => focusOnApp() },
		"shift+pagedown": { callback: () => focusOnApp() },

		// Scroll actions: d/u (bare and with ctrl) jump half a page per press,
		// j/k step 100px per repeat keydown, and all of them hit the help
		// modal while it is open
		j: { callback: () => scrollLines(SCROLL_STEP) },
		k: { callback: () => scrollLines(-SCROLL_STEP) },
		d: { callback: () => scrollHalfPage(1) },
		u: { callback: () => scrollHalfPage(-1) },
		"ctrl+d": { callback: () => scrollHalfPage(1) },
		"ctrl+u": { callback: () => scrollHalfPage(-1) },
		n: { callback: () => Spicetify.Player.next() },
		p: { callback: () => Spicetify.Player.back() },

		// Scroll to the top ('gg') or bottom ('Shift+g') of the page
		"g g": { callback: () => scrollToPosition(0) },
		"shift+g": { callback: () => scrollToPosition(1) },

		// History back/forward on alt, "shift+l" opens the full library page
		"shift+h": { callback: () => Spicetify.Platform.History.goBack() },
		"shift+l": { callback: () => Spicetify.Platform.History.push("/library") },
		"alt+h": { callback: () => Spicetify.Platform.History.goBack() },
		"alt+l": { callback: () => Spicetify.Platform.History.goForward() },

		h: { callback: () => Spicetify.Platform.History.push("/") },
		s: { callback: () => Spicetify.Player.toggleShuffle() },
		l: { callback: () => Spicetify.Player.toggleRepeat() },
		a: { callback: () => Spicetify.Player.toggleHeart() },
		m: { callback: () => Spicetify.Player.toggleHeart() },
		q: { callback: () => document.querySelector('button[aria-label="Queue"]')?.click() },

		"ctrl+b": { callback: () => toggleSidebar(0) },
		"ctrl+shift+b": { callback: () => toggleSidebar(1) },

		"/": { callback: () => Spicetify.Platform.History.replace("/search") },

		"ctrl+left": { callback: () => Spicetify.Player.back() },
		"ctrl+right": { callback: () => Spicetify.Player.next() },

		"ctrl+up": { callback: () => Spicetify.Player.setVolume(Spicetify.Player.getVolume() + 0.05) },
		"ctrl+down": { callback: () => Spicetify.Player.setVolume(Spicetify.Player.getVolume() - 0.05) },

		f: { callback: () => document.querySelector('.main-nowPlayingBar-extraControls button[aria-label="Lyrics"]')?.click() },

		// Activate Vim mode (clickable elements get letter-key labels)
		"shift+f": {
			callback: (event) => {
				vim.activate(event);
				vim.setCancelKey("ESCAPE");
			},
		},
	};

	for (const [key, { staticCondition, callback }] of Object.entries(binds)) {
		if (typeof staticCondition === "undefined" || staticCondition) {
			Spicetify.Mousetrap.bind(key, (event) => {
				event.preventDefault();
				if (!vim.isActive) {
					callback(event);
				}
			});
		}
	}

	// Own modal on "?" (Spotify's native shortcuts modal is blocked in the
	// window-capture listener below); j/k/d/u scroll this modal first.
	const helpOpen = {};

	function buildHelp() {
		const sections = [
			["Scrolling", [
				["j / k", "Scroll lines"],
				["d / u", "Scroll half a page"],
				["Ctrl+d / Ctrl+u", "Scroll half a page"],
				["g g / Shift+g", "Top / bottom"],
			]],
			["Playback", [
				["n / p", "Next / previous track"],
				["a / m", "Like current track"],
				["s", "Toggle shuffle"],
				["l", "Toggle repeat"],
				["Ctrl+ ←/→", "Previous / next track"],
				["Ctrl+ ↑/↓", "Volume -/+"],
			]],
			["Navigation", [
				["h", "Go home"],
				["/", "Search page"],
				["q", "Toggle queue panel"],
				["Shift+l", "Open Your Library (full page)"],
				["Alt+h / Alt+l", "History back / forward"],
				["Shift+h", "History back"],
			]],
			["Panels", [
				["Ctrl+b", "Toggle library sidebar"],
				["Ctrl+Shift+b", "Toggle now playing view"],
				["f", "Toggle lyrics"],
			]],
			["Other", [
				["Shift+f", "Click-on-element vim mode"],
				["?", "Open this help"],
				["Esc", "Close modal / menu, unfocus field"],
				["Ctrl+q", "Quit Spotify"],
			]],
		];
		const panel = document.createElement("div");
		panel.id = "keymap-help";
		panel.innerHTML = `
		<style>
		#keymap-help .o-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 99999; }
		#keymap-help .o-panel { background: var(--spice-card); color: var(--spice-text); border-radius: var(--br-1); width: 420px; max-height: 75vh; padding: 20px 24px; display: flex; flex-direction: column; box-shadow: 0 12px 40px rgba(0,0,0,.5); }
		#keymap-help .o-title { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--spice-text); }
		#keymap-help .o-help-body { overflow-y: auto; min-height: 0; scrollbar-width: none; }
		#keymap-help .o-section { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--spice-subtext); margin: 12px 0 2px; }
		#keymap-help .o-section:first-child { margin-top: 0; }
		#keymap-help .o-row { display: flex; justify-content: space-between; gap: 24px; padding: 4px 0; font-size: 13.5px; align-items: center; }
		#keymap-help .o-keys { color: var(--spice-button); white-space: nowrap; font-weight: 600; }
		#keymap-help .o-desc { color: var(--spice-subtext); text-align: right; }
		</style>
		<div class="o-overlay"><div class="o-panel"><div class="o-title">Keybinds</div>
		<div class="o-help-body">
		${sections.map(([title, rows]) => `<div class="o-section">${title}</div>${rows.map(([k, d]) => `<div class="o-row"><span class="o-keys">${k}</span><span class="o-desc">${d}</span></div>`).join("")}`).join("")}
		</div></div></div>`;
		document.body.append(panel);
		return panel;
	}

	function toggleHelp() {
		let panel = document.getElementById("keymap-help");
		if (!panel) {
			panel = buildHelp();
			panel.style.display = "none";
		}
		helpOpen.v = !helpOpen.v;
		panel.style.display = helpOpen.v ? "block" : "none";
		if (helpOpen.v) panel.querySelector(".o-help-body")?.scrollTo(0, 0);
	}

	function isInputLike(el) {
		return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
	}

	// Escape + "?" helpers handled on window capture. Spotify's own "?" handler
	// still runs (registration order wins), so after opening ours we hide the
	// native shortcuts modal it opens.
	window.addEventListener(
		"keydown",
		(event) => {
			if (event.key === "?" && !isInputLike(document.activeElement)) {
				event.preventDefault();
				event.stopPropagation();
				toggleHelp();
				hideNativeHelp();
				return;
			}
			if (event.key === "Escape") {
				if (helpOpen.v) {
					toggleHelp();
					event.stopImmediatePropagation();
					return;
				}
				const ae = document.activeElement;
				if (isInputLike(ae)) {
					// Spotify's own Escape handling (closing the search
					// autocomplete) runs on this same event; dismiss
					// leftovers and blur after it has had its turn
					setTimeout(() => {
						document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
						ae.blur();
					});
				}
			}
		},
		true
	);

	function hideNativeHelp() {
		const kill = () => {
			for (const el of document.querySelectorAll('div[role="dialog"]')) {
				if (el.textContent.includes("Keyboard Shortcuts") && !el.dataset.keymapEaten) {
					el.style.display = "none";
					el.dataset.keymapEaten = "1";
				}
			}
		};
		requestAnimationFrame(kill);
		setTimeout(kill, 80);
	}

	// re-render vim on window resize & prevent mouse event while active
	window.addEventListener(
		"resize",
		(event) => {
			if (vim.isActive) {
				vim.activate();
			}
		},
		true
	);

	window.addEventListener(
		"mousedown",
		(event) => {
			if (vim.isActive) {
				event.stopPropagation();
			}
		},
		true
	);

	function focusOnApp() {
		return document.querySelector(
			".Root__main-view .os-viewport, .Root__main-view .main-view-container > .main-view-container__scroll-node:not([data-overlayscrollbars-initialize]), .Root__main-view .main-view-container__scroll-node > [data-overlayscrollbars-viewport]"
		);
	}

	function scrollLines(step) {
		const app = scrollTarget();
		if (app) {
			app.scrollTop += step;
		}
	}

	// Scroll action target: while the help modal is open, scroll keys act on it
	function scrollTarget() {
		return helpOpen.v ? document.querySelector("#keymap-help .o-help-body") : focusOnApp();
	}

	function scrollHalfPage(direction) {
		// throttle keydown auto-repeat: one half-page per 120ms while held
		if (Date.now() - scrollHalfPage.t < 120) return;
		scrollHalfPage.t = Date.now();
		const app = scrollTarget();
		if (app) {
			app.scrollTop += direction * app.clientHeight / 2;
		}
	}

	function scrollToPosition(position) {
		const app = scrollTarget();
		app.scroll(0, position === 0 ? 0 : app.scrollHeight);
	}

	// 0 = library sidebar (left), 1 = now playing view (right). Both are plain
	// toggle buttons: clicking an already-visible one collapses it.
	function toggleSidebar(side) {
		if (side === 0) {
			// the panel has separate buttons per state and hoists their labels
			// into aria-label: "Collapse Your Library" when expanded, "Open Your
			// Library" when collapsed
			document.querySelector("button[aria-label='Collapse Your Library'], button[aria-label='Open Your Library']")?.click();
		} else {
			document.querySelector('.main-coverSlotCollapsed-container button, button[aria-label="Now playing view"]')?.click();
		}
	}

})();

function VimBind() {
	const elementQuery = ["[href]", "button", ".main-trackList-trackListRow", "[role='button']"].join(",");

	const keyList = "qwertasdfgzxcvyuiophjklbnm".split("");

	const lastKeyIndex = keyList.length - 1;

	this.isActive = false;

	const vimOverlay = document.createElement("div");
	const baseOverlay = document.createElement("div");
	const tippyOverlay = document.createElement("div");
	vimOverlay.id = "vim-overlay";
	baseOverlay.id = "base-overlay";
	tippyOverlay.id = "tippy-overlay";
	vimOverlay.style.position = baseOverlay.style.position = tippyOverlay.style.position = "absolute";
	vimOverlay.style.width = baseOverlay.style.width = tippyOverlay.style.width = "100%";
	vimOverlay.style.height = baseOverlay.style.height = tippyOverlay.style.height = "100%";
	baseOverlay.style.zIndex = "9999";
	tippyOverlay.style.zIndex = "10000";
	vimOverlay.style.display = "none";
	vimOverlay.innerHTML = `<style>
.vim-key {
    position: fixed;
    padding: 3px 6px;
    background-color: var(--spice-button-disabled);
    border-radius: 3px;
    border: solid 2px var(--spice-text);
    color: var(--spice-text);
    text-transform: lowercase;
    line-height: normal;
    font-size: 14px;
    font-weight: 500;
}
</style>`;
	vimOverlay.append(baseOverlay);
	vimOverlay.append(tippyOverlay);
	document.body.append(vimOverlay);

	const mousetrap = new Spicetify.Mousetrap(document);
	mousetrap.bind(keyList, listenToKeys.bind(this), "keypress");
	// Pause mousetrap event emitter
	const orgStopCallback = mousetrap.stopCallback;
	mousetrap.stopCallback = () => true;

	/**
	 *
	 * @param {KeyboardEvent} event
	 */
	this.activate = function (event) {
		vimOverlay.style.display = "block";

		const vimkey = getVims();
		if (vimkey.length > 0) {
			for (const e of vimkey) {
				e.remove();
			}
		}

		let firstKey = 0;
		let secondKey = 0;

		for (const e of getLinks()) {
			const computed = window.getComputedStyle(e);
			if (computed.display === "none" || computed.visibility === "hidden" || computed.opacity === "0") {
				continue;
			}

			const bound = e.getBoundingClientRect();
			const owner = document.body;

			let top = bound.top;
			let left = bound.left;

			if (
				bound.bottom > owner.clientHeight ||
				bound.left > owner.clientWidth ||
				bound.right < 0 ||
				bound.top < 0 ||
				bound.width === 0 ||
				bound.height === 0
			) {
				continue;
			}

			if (e.parentNode.role !== "row") {
				top = top + bound.height / 2 - 15;
				left = left + bound.width / 2 - 15;
			}

			if (e.tagName === "BUTTON" && e.parentNode.tagName === "LI") {
				tippyOverlay.append(createKey(e, keyList[firstKey] + keyList[secondKey], top, left));
			} else {
				baseOverlay.append(createKey(e, keyList[firstKey] + keyList[secondKey], top, left));
			}

			secondKey++;
			if (secondKey > lastKeyIndex) {
				secondKey = 0;
				firstKey++;
			}
		}

		this.isActive = true;
		setTimeout(() => {
			mousetrap.stopCallback = orgStopCallback.bind(mousetrap);
		}, 100);
	};

	/**
	 *
	 * @param {KeyboardEvent} event
	 */
	this.deactivate = function (event) {
		mousetrap.stopCallback = () => true;
		this.isActive = false;
		vimOverlay.style.display = "none";
		for (const e of getVims()) {
			e.remove();
		}
	};

	function getLinks() {
		const elements = Array.from(document.querySelectorAll(elementQuery));
		return elements;
	}

	function getVims() {
		return Array.from(vimOverlay.getElementsByClassName("vim-key"));
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function listenToKeys(event) {
		if (!this.isActive) {
			return;
		}

		const vimkey = getVims();

		if (vimkey.length === 0) {
			this.deactivate(event);
			return;
		}

		for (const div of vimkey) {
			const text = div.innerText.toLowerCase();
			if (text[0] !== event.key) {
				div.remove();
				continue;
			}

			const newText = text.slice(1);
			if (newText.length === 0) {
				interact(div.target);
				this.deactivate(event);
				return;
			}

			div.innerText = newText;
		}

		if (baseOverlay.childNodes.length === 0 && tippyOverlay.childNodes.length === 0) {
			this.deactivate(event);
		}
	}

	/**
	 * @param {HTMLElement} element
	 */
	function interact(element) {
		// Hover on contextmenu dropdown list items
		if (element.tagName === "BUTTON" && element.parentNode.tagName === "LI" && element.ariaExpanded !== null) {
			const event = new MouseEvent("mouseover", {
				view: window,
				bubbles: true,
				cancelable: true,
			});

			element.dispatchEvent(event);
			return;
		}

		if (element.hasAttribute("href") || element.tagName === "BUTTON" || element.role === "button" || element.parentNode.role === "row") {
			element.click();
			return;
		}

		const findButton = element.querySelector(`button[data-ta-id="play-button"]`) || element.querySelector(`button[data-button="play"]`);
		if (findButton instanceof HTMLButtonElement) {
			findButton.click();
			return;
		}
		alert("Let me know where you found this button, please. I can't click this for you without that information.");
		return;
	}

	/**
	 * @param {Element} target
	 * @param {string} key
	 * @param {string | number} top
	 * @param {string | number} left
	 */
	function createKey(target, key, top, left) {
		const div = document.createElement("span");
		div.classList.add("vim-key");
		div.innerText = key;
		div.style.top = `${top}px`;
		div.style.left = `${left}px`;
		div.target = target;
		return div;
	}

	/**
	 *
	 * @param {Spicetify.Keyboard.ValidKey} key
	 */
	this.setCancelKey = function (key) {
		mousetrap.bind(Spicetify.Keyboard.KEYS[key], this.deactivate.bind(this));
	};

	return this;
}
