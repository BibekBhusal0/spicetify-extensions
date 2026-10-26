type ModalDisplayOptions = {
	title: string;
	content: any;
	isLarge?: boolean;
	onClose?: (() => void) | null;
	closeBtn?: boolean;
	closeOnOutsideClick?: boolean;
	/** Close on Escape. Defaults to true; mirrors the close button, including any closeHandler. */
	closeOnEscape?: boolean;
	/** Replaces the default hide() behavior for the close button and outside-click. */
	closeHandler?: (() => void) | null;
	/** Optional class appended to `.sl-modal` for per-modal styling/identification. */
	modalId?: string | null;
};

type ModalTransitionOptions = {
	content: any;
	onClose?: (() => void) | null;
	closeHandler?: (() => void) | null;
	/** Optional class appended to `.sl-modal`. Replaces any previously set modalId class. */
	modalId?: string | null;
	/** Optional new header title. Omit to keep the current one. */
	title?: string | null;
};

/* An Escape that dismissed a modal must not also leave Spicy Lyrics fullscreen.
   The page shortcut can run after the modal is already gone, so it checks this
   instead of trusting the DOM alone. */
let escapeDismissAt = -Infinity;

export function MarkEscapeDismiss(): void {
	escapeDismissAt = performance.now();
}

export function IsEscapeDismissRecent(): boolean {
	return performance.now() - escapeDismissAt < 300;
}

class _HTMLGenericModal extends HTMLElement {
	private _onClose: (() => void) | null;
	private _currentModalId: string | null;
	private _onEscape: ((event: KeyboardEvent) => void) | null;

	constructor() {
		super();
		this.classList.add("SpicyLyricsModal");
		this._onClose = null;
		this._currentModalId = null;
		this._onEscape = null;
	}

	private _applyModalId(modalId: string | null | undefined): void {
		const modalEl = this.querySelector(".sl-modal");
		if (this._currentModalId && modalEl) {
			modalEl.classList.remove(this._currentModalId);
		}
		const nextId = typeof modalId === "string" && modalId.length > 0 ? `slmodal-${modalId}` : null;
		if (nextId && modalEl) {
			modalEl.classList.add(nextId);
		}
		this._currentModalId = nextId;
	}

	hide(): void {
        this._removeEscapeHandler();
        const capturedOnClose = this._onClose;
        this._onClose = null;
        this._currentModalId = null;
        const _removeFromDom = (timeoutDuration: number) => {
            setTimeout(() => {
                this?.remove();
                if (typeof capturedOnClose === "function") {
                    capturedOnClose();
                }
            }, timeoutDuration)
        };

        const genericModal = this?.querySelector(".sl-modal-overlay-animated");
        if (genericModal) {
            genericModal.classList.remove("Active");
            _removeFromDom((0.22 * 1000) + 30);
        } else {
            _removeFromDom(0);
        }
	}

	private _removeEscapeHandler(): void {
		if (!this._onEscape) return;
		document.removeEventListener("keydown", this._onEscape, true);
		this._onEscape = null;
	}

	/**
	 * Instantly swap modal content without hiding/re-animating.
	 * Use for modal-to-modal transitions where the frame should stay visible.
	 */
	transition({ content, onClose = null, closeHandler = null, modalId = null, title = null }: ModalTransitionOptions): void {
		if (typeof this._onClose === "function") {
			this._onClose();
		}
		this._onClose = onClose;
		const closeButton = this.querySelector(".sl-modal-close-btn");
		if (closeButton) {
			(closeButton as HTMLButtonElement).onclick = closeHandler ?? this.hide.bind(this);
		}
		if (typeof title === "string") {
			const titleEl = this.querySelector(".sl-modal-title");
			if (titleEl) titleEl.textContent = title;
		}
		this._applyModalId(modalId);
		const main = this.querySelector("main");
		if (main) {
			main.innerHTML = "";
			if (typeof content === "string") {
				main.innerHTML = content;
			} else if (content instanceof Node) {
				main.append(content);
			}
		}
	}

	/**
	 * Display the modal.
	 * @param {Object} options
	 * @param {string} options.title
	 * @param {any} options.content
	 * @param {boolean} [options.isLarge]
	 * @param {function} [options.onClose] - Optional callback to run when modal is closed
	 * @param {boolean} [options.closeBtn=true] - Show modal close button
	 * @param {boolean} [options.closeOnOutsideClick=true] - Allow closing modal by clicking outside
	 */
	display({ title, content, isLarge = false, onClose = null, closeBtn = true, closeOnOutsideClick = true, closeHandler = null, modalId = null, closeOnEscape = true }: ModalDisplayOptions): void {
		// If a previous onClose exists, call it before displaying a new popup
		if (typeof this._onClose === "function") {
			this._onClose();
		}
		this._onClose = onClose;
		// Reset tracked modalId since innerHTML below replaces the previous `.sl-modal` element.
		this._currentModalId = null;
		this._removeEscapeHandler();
		this.innerHTML = `
<div class="sl-modal-overlay sl-modal-overlay-animated" style="z-index: 100;">
	<div class="sl-modal" tabindex="-1" role="dialog" aria-label="${title}" aria-modal="true">
		<div class="${isLarge ? "sl-modal-container-large" : "sl-modal-container"}">
			<div class="sl-modal-header">
				<h1 class="sl-modal-title" as="h1">${title}</h1>
				${closeBtn ? '<button aria-label="Close" class="sl-modal-close-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13"/></svg></button>' : ""}
			</div>
			<div class="sl-modal-main-section">
				<main class="sl-modal-content"></main>
			</div>
		</div>
	</div>
</div>`;

		const closeButton = this.querySelector("button");
		if (closeButton) {
			(closeButton as HTMLButtonElement).onclick = closeHandler ?? this.hide.bind(this);
		}
		this._applyModalId(modalId);
		const main = this.querySelector("main");
		const hidePopup = closeHandler ?? this.hide.bind(this);

		// Listen for click events on Overlay
		const overlay = this.querySelector(".sl-modal-overlay");
		if (overlay) {
			// Only a press that also started on the overlay closes the modal. A drag that
			// began inside (a slider) and ended outside clicks the overlay too.
			let pressedOverlay = false;
			overlay.addEventListener("pointerdown", (event: PointerEvent) => {
				pressedOverlay = event.target === event.currentTarget;
			});
			overlay.addEventListener("click", (event: MouseEvent) => {
				if (closeOnOutsideClick && pressedOverlay && event.target === event.currentTarget) hidePopup();
			});
		}

		if (closeOnEscape) {
			this._onEscape = (event: KeyboardEvent) => {
				if (event.key !== "Escape") return;
				// Keeps Spotify's own Escape shortcut from also firing.
				event.preventDefault();
				event.stopImmediatePropagation();
				MarkEscapeDismiss();
				// Follow whatever the close button currently does; transitions rebind it.
				const closeButton = this.querySelector<HTMLButtonElement>(".sl-modal-close-btn");
				if (closeButton) closeButton.click();
				else hidePopup();
			};
			document.addEventListener("keydown", this._onEscape, true);
		}

		if (main) {
			if (typeof content === "string") {
				main.innerHTML = content;
			} else if (content instanceof Node) {
				main.append(content);
			} else if (content !== null && content !== undefined) {
				main.append(String(content));
			}
		}
		document.body.append(this);

        setTimeout(() => {
            const genericModal = this.querySelector(".sl-modal-overlay-animated");
            if (genericModal) genericModal.classList.add("Active");
        }, 50);
	}
}
customElements.define("sl-generic-modal", _HTMLGenericModal);
export const PopupModal = new _HTMLGenericModal();