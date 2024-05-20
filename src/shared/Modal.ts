import { expandedModal, headerButton, headerButtonHover, headerDiv, minimizedModal, modalRoot, resizeHandle } from "./defaultStyles";

interface IModalStyleOptions {
  'modal_root': string,
  'resize_handle': string, 
  'expanded_modal': string,
  'header_div': string,
  'header_button': string,
  'header_button:hover'?: string,
  'minimized_modal': string, 
  [index: string]: string | undefined
}

export class Modal {
  _withPreact: boolean = false;
  _style: CSSStyleSheet;
  _x: number;
  _y: number;
  _shadowRoot: ShadowRoot;
  _rootDiv: HTMLDivElement;
  _minimizedDiv: HTMLDivElement;
  _expandedModalDiv: HTMLDivElement;
  _preactRoot?: HTMLDivElement;
  _isResizing: boolean = false;
  _isDragging: boolean = false;
  _isMinimized: boolean = false;
  _initialWidth: number = 200;
  _initialHeight: number = 300;
  _initialMouseX: number = 0;
  _initialMouseY: number = 0;
  _dragOffsetX: number = 0;
  _dragOffsetY: number = 0;
  _hasNotification: boolean = false;

  constructor(
    options: {
      withPreact?: boolean;
      withHeader?: boolean;
      style?: IModalStyleOptions;
    } = { withHeader: true, withPreact: true }
  ) {
    // Set up defaults
    const { withHeader, withPreact, style } = options;
    this._x = 200;
    this._y = 200;

    this._hasNotification = false;

    this._expandedModalDiv = document.createElement("div");
    this._expandedModalDiv.id = "dhp_expanded_modal";

    this._rootDiv = document.createElement("div");
    this._rootDiv.id = "dhp_modal_root";

    // Create minimized modal
    this._minimizedDiv = document.createElement("div");
    this._minimizedDiv.id = "dhp_minimized_modal";
    this._minimizedDiv.style.display = "none";
    const expandDiv = document.createElement("div");
    expandDiv.id = "dhp_expand_div";
    expandDiv.innerText = "+";
    this._minimizedDiv.appendChild(expandDiv);
    expandDiv.addEventListener("click", this.restoreModal.bind(this));
    this._minimizedDiv.addEventListener("mousedown", this.initDrag.bind(this));

    if (style) {
      this._style = new CSSStyleSheet()
      for (const key of Object.keys(style)){
        this._style.insertRule(`div#dhp_${key}{ ${style[key]}}`)
      };
    } else {
      this._style = new CSSStyleSheet();
      this._style.insertRule(modalRoot);
      this._style.insertRule(expandedModal);
      this._style.insertRule(resizeHandle);
      this._style.insertRule(headerDiv);
      this._style.insertRule(headerButton);
      this._style.insertRule(headerButtonHover);
      this._style.insertRule(minimizedModal);
    }

    // Create the shadow host element
    let shadowHost = document.createElement("div");
    shadowHost.id = "dhp_shadow_host";
    document.body.appendChild(shadowHost);

    // Attach a closed shadow root to the shadow host
    this._shadowRoot = shadowHost.attachShadow({ mode: "closed" });

    // Create a div element inside the shadow root
    this._rootDiv.appendChild(this._expandedModalDiv);
    this._rootDiv.appendChild(this._minimizedDiv);
    this._shadowRoot.appendChild(this._rootDiv);

    // Use the provided stylesheet or the default one
    this._shadowRoot.adoptedStyleSheets = [this._style];

    // Add an event listener to the div
    this._rootDiv.addEventListener(
      "mouseenter",
      this.handleMouseEnter.bind(this)
    );

    // Optionally create a Preact root if withPreact is true
    if (withPreact) {
      this._preactRoot = document.createElement("div");
      this._preactRoot.id = "dhp_modal_preactRoot";
      this._expandedModalDiv.appendChild(this._preactRoot);
    }

    if (withHeader) {
      let headerDiv = document.createElement("div");
      headerDiv.id = "dhp_header_div";

      let closeButton = document.createElement("button");
      closeButton.className = "dhp_header_button";
      closeButton.innerText = "×";
      closeButton.addEventListener("click", this.closeModal.bind(this));

      let minimizeButton = document.createElement("button");
      minimizeButton.className = "dhp_header_button";
      minimizeButton.innerText = "_";
      minimizeButton.addEventListener("click", this.minimizeModal.bind(this));

      headerDiv.appendChild(minimizeButton);
      headerDiv.appendChild(closeButton);
      this._expandedModalDiv.prepend(headerDiv);

      // Add drag event listeners to the header
      headerDiv.addEventListener("mousedown", this.initDrag.bind(this));
    }

    // Add resize handle
    const resizeHandleDiv = document.createElement("div");
    resizeHandleDiv.id = "dhp_resize_handle";
    resizeHandleDiv.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier"> 
        <path d="M10 20L20 20L20 10" stroke="#999693" stroke-width="2"></path> 
        <path d="M12 17L17 17L17 12" stroke="#999693" stroke-width="2"></path>
      </g>
    </svg>`;
    this._expandedModalDiv.appendChild(resizeHandleDiv);

    // Add event listeners for resizing
    resizeHandleDiv.addEventListener("mousedown", this.initResize.bind(this));

    // Register the menu command for reopening the modal
    GM_registerMenuCommand("Reopen Modal", this.reopenModal.bind(this));
  }

  handleMouseEnter(e: MouseEvent) {
    console.log(e);
    e.preventDefault();
  }

  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
    this.updatePosition();
  }

  updatePosition() {
    this._rootDiv.style.left = `${this._x}px`;
    this._rootDiv.style.top = `${this._y}px`;
  }

  initResize(e: MouseEvent) {
    this._isResizing = true;
    this._initialWidth = this._rootDiv.offsetWidth;
    this._initialHeight = this._rootDiv.offsetHeight;
    this._initialMouseX = e.clientX;
    this._initialMouseY = e.clientY;

    document.addEventListener("mousemove", this.doResize.bind(this));
    document.addEventListener("mouseup", this.stopResize.bind(this));
  }

  doResize(e: MouseEvent) {
    if (this._isResizing) {
      const width = this._initialWidth + (e.clientX - this._initialMouseX);
      const height = this._initialHeight + (e.clientY - this._initialMouseY);
      this._rootDiv.style.width = `${width}px`;
      this._rootDiv.style.height = `${height}px`;
    }
  }

  stopResize() {
    this._isResizing = false;
    document.removeEventListener("mousemove", this.doResize.bind(this));
    document.removeEventListener("mouseup", this.stopResize.bind(this));
  }

  initDrag(e: MouseEvent) {
    this._isDragging = true;
    this._dragOffsetX = e.clientX - this._x;
    this._dragOffsetY = e.clientY - this._y;

    document.addEventListener("mousemove", this.doDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  doDrag(e: MouseEvent) {
    if (this._isDragging) {
      this.setPosition(
        e.clientX - this._dragOffsetX,
        e.clientY - this._dragOffsetY
      );
    }
  }

  stopDrag() {
    this._isDragging = false;
    document.removeEventListener("mousemove", this.doDrag.bind(this));
    document.removeEventListener("mouseup", this.stopDrag.bind(this));
  }

  closeModal() {
    this._rootDiv.style.display = "none";
  }

  minimizeModal() {
    if (!this._isMinimized) {
      // Store the current position before minimizing
      this._x = parseInt(this._rootDiv.style.left, 10);
      this._y = parseInt(this._rootDiv.style.top, 10);

      this._expandedModalDiv.style.display = "none";
      this._minimizedDiv.style.display = "flex";
      this.setPosition(this._x, this._y); // Ensure minimized div is in the correct position
      this._isMinimized = true;
    }
  }

  restoreModal() {
    this._expandedModalDiv.style.display = "block";
    this._minimizedDiv.style.display = "none";
    this.setPosition(this._x, this._y); // Restore position
    this._isMinimized = false;
  }

  reopenModal() {
    this._rootDiv.style.display = "block";
  }

  setNotification() {
    this._hasNotification = true;
  }

  preactTarget() {
    return this._preactRoot
  }

}
