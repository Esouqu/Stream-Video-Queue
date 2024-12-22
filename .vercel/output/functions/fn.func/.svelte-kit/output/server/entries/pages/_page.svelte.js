import { Q as push, S as pop, T as once, W as bind_props, V as spread_attributes, a6 as getAllContexts, $ as spread_props, a2 as copy_payload, a3 as assign_payload, X as ensure_array_like, a0 as slot, a1 as sanitize_props, Y as attr, _ as stringify, Z as escape_html, a7 as element, a4 as store_get, a5 as unsubscribe_stores, a8 as head, a9 as css_props } from "../../chunks/index2.js";
import { b as box, i as isBrowser, e as createContext, g as getDataOpenClosed, u as useRefById, f as getAriaExpanded, n as noop, m as mergeProps, a as useId, h as executeCallbacks, j as isElement, k as isSelectableInput, l as isElementHidden, o as composeHandlers, p as isHTMLElement, q as getDataDisabled, r as getDisabled, s as getRequired, t as styleToString, v as srOnlyStyles, w as getAriaHidden, x as useFloatingContentState, y as getAriaOrientation, z as getDataOrientation, F as Floating_layer, A as Floating_layer_anchor, B as getDataChecked, C as getDataRequired, D as getAriaChecked, E as getAriaRequired, G as getAriaSelected, H as getHidden, J as getAriaPressed, K as useTooltipContent, L as getFloatingContentCSSVars, c as cn, I as Icon, M as remToPx, R as Root$4, T as Trigger$2, N as msToHHMMSS, d as appManager, O as buttonVariants, Q as Button, S as INTEGRATION, U as SOCKET_STATE } from "../../chunks/button.js";
import "style-to-object";
import "clsx";
import { tv } from "tailwind-variants";
import { p as page, g as goto } from "../../chunks/stores.js";
async function tick() {
}
function afterTick(fn) {
  tick().then(fn);
}
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const END = "End";
const ENTER = "Enter";
const ESCAPE = "Escape";
const HOME = "Home";
const PAGE_DOWN = "PageDown";
const PAGE_UP = "PageUp";
const SPACE = " ";
const TAB = "Tab";
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
function getNextKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_LEFT : ARROW_RIGHT,
    vertical: ARROW_DOWN
  }[orientation];
}
function getPrevKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_RIGHT : ARROW_LEFT,
    vertical: ARROW_UP
  }[orientation];
}
function getDirectionalKeys(dir = "ltr", orientation = "horizontal") {
  if (!["ltr", "rtl"].includes(dir))
    dir = "ltr";
  if (!["horizontal", "vertical"].includes(orientation))
    orientation = "horizontal";
  return {
    nextKey: getNextKey(dir, orientation),
    prevKey: getPrevKey(dir, orientation)
  };
}
function useRovingFocus(props) {
  const currentTabStopId = props.currentTabStopId ? props.currentTabStopId : box(null);
  function getCandidateNodes() {
    if (!isBrowser) return [];
    const node = document.getElementById(props.rootNodeId.current);
    if (!node) return [];
    if (props.candidateSelector) {
      const candidates = Array.from(node.querySelectorAll(props.candidateSelector));
      return candidates;
    } else {
      const candidates = Array.from(node.querySelectorAll(`[${props.candidateAttr}]:not([data-disabled])`));
      return candidates;
    }
  }
  function focusFirstCandidate() {
    const items = getCandidateNodes();
    if (!items.length) return;
    items[0]?.focus();
  }
  function handleKeydown(node, e, both = false) {
    const rootNode = document.getElementById(props.rootNodeId.current);
    if (!rootNode || !node) return;
    const items = getCandidateNodes();
    if (!items.length) return;
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(rootNode);
    const { nextKey, prevKey } = getDirectionalKeys(dir, props.orientation.current);
    const loop = props.loop.current;
    const keyToIndex = {
      [nextKey]: currentIndex + 1,
      [prevKey]: currentIndex - 1,
      [HOME]: 0,
      [END]: items.length - 1
    };
    if (both) {
      const altNextKey = nextKey === ARROW_DOWN ? ARROW_RIGHT : ARROW_DOWN;
      const altPrevKey = prevKey === ARROW_UP ? ARROW_LEFT : ARROW_UP;
      keyToIndex[altNextKey] = currentIndex + 1;
      keyToIndex[altPrevKey] = currentIndex - 1;
    }
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === void 0) return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
      itemIndex = items.length - 1;
    } else if (itemIndex === items.length && loop) {
      itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus) return;
    itemToFocus.focus();
    currentTabStopId.current = itemToFocus.id;
    props.onCandidateFocus?.(itemToFocus);
    return itemToFocus;
  }
  function getTabIndex(node) {
    const items = getCandidateNodes();
    const anyActive = currentTabStopId.current !== null;
    if (node && !anyActive && items[0] === node) {
      currentTabStopId.current = node.id;
      return 0;
    } else if (node?.id === currentTabStopId.current) {
      return 0;
    }
    return -1;
  }
  return {
    setCurrentTabStopId(id) {
      currentTabStopId.current = id;
    },
    getTabIndex,
    handleKeydown,
    focusFirstCandidate,
    currentTabStopId
  };
}
function useDebounce(callback, wait = 250) {
  let context = null;
  function debounced(...args) {
    if (context) {
      if (context.timeout) {
        clearTimeout(context.timeout);
      }
    } else {
      let resolve;
      let reject;
      let promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      context = { timeout: null, promise, resolve, reject };
    }
    context.timeout = setTimeout(
      async () => {
        if (!context) return;
        const ctx = context;
        context = null;
        try {
          ctx.resolve(await callback.apply(this, args));
        } catch (error) {
          ctx.reject(error);
        }
      },
      typeof wait === "function" ? wait() : wait
    );
    return context.promise;
  }
  debounced.cancel = async () => {
    if (!context || context.timeout === null) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context || context.timeout === null) return;
    }
    clearTimeout(context.timeout);
    context.reject("Cancelled");
    context = null;
  };
  Object.defineProperty(debounced, "pending", {
    enumerable: true,
    get() {
      return !!context?.timeout;
    }
  });
  return debounced;
}
class IsMounted {
  #isMounted = false;
  constructor() {
  }
  get current() {
    return this.#isMounted;
  }
}
class Previous {
  #previous;
  #curr;
  constructor(getter) {
  }
  get current() {
    return this.#previous;
  }
}
function useStateMachine(initialState, machine) {
  const state = box(initialState);
  function reducer(event) {
    const nextState = machine[state.current][event];
    return nextState ?? state.current;
  }
  const dispatch = (event) => {
    state.current = reducer(event);
  };
  return { state, dispatch };
}
function usePresence(present, id) {
  const initialState = present.current ? "mounted" : "unmounted";
  const { state, dispatch } = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
    unmounted: { MOUNT: "mounted" }
  });
  const isPresentDerived = ["mounted", "unmountSuspended"].includes(state.current);
  return {
    get current() {
      return isPresentDerived;
    }
  };
}
function Presence_layer($$payload, $$props) {
  push();
  let { present, forceMount, presence, id } = $$props;
  const isPresent = usePresence(box.with(() => present), box.with(() => id));
  if (forceMount || present || isPresent.current) {
    $$payload.out += "<!--[-->";
    presence?.($$payload, { present: isPresent });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function createAttrs(variant) {
  return {
    content: `data-${variant}-content`,
    trigger: `data-${variant}-trigger`,
    overlay: `data-${variant}-overlay`,
    title: `data-${variant}-title`,
    description: `data-${variant}-description`,
    close: `data-${variant}-close`,
    cancel: `data-${variant}-cancel`,
    action: `data-${variant}-action`
  };
}
class DialogRootState {
  open;
  variant;
  triggerNode = null;
  titleNode = null;
  contentNode = null;
  descriptionNode = null;
  contentId = void 0;
  titleId = void 0;
  triggerId = void 0;
  descriptionId = void 0;
  cancelNode = null;
  #attrs = once(() => createAttrs(this.variant.current));
  get attrs() {
    return this.#attrs();
  }
  constructor(props) {
    this.open = props.open;
    this.variant = props.variant;
  }
  handleOpen = () => {
    if (this.open.current) return;
    this.open.current = true;
  };
  handleClose = () => {
    if (!this.open.current) return;
    this.open.current = false;
  };
  #sharedProps = once(() => ({
    "data-state": getDataOpenClosed(this.open.current)
  }));
  get sharedProps() {
    return this.#sharedProps();
  }
}
class DialogTriggerState {
  #id;
  #ref;
  #root;
  #disabled;
  constructor(props, root) {
    this.#id = props.id;
    this.#root = root;
    this.#ref = props.ref;
    this.#disabled = props.disabled;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.#root.triggerNode = node;
        this.#root.triggerId = node?.id;
      }
    });
  }
  #onclick = (e) => {
    if (this.#disabled.current) return;
    if (e.button > 0) return;
    this.#root.handleOpen();
  };
  #onpointerdown = (e) => {
    if (this.#disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    if (e.button > 0) return;
    e.preventDefault();
    this.#root.handleOpen();
  };
  #onkeydown = (e) => {
    if (this.#disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.#root.handleOpen();
    }
  };
  #props = once(() => ({
    id: this.#id.current,
    "aria-haspopup": "dialog",
    "aria-expanded": getAriaExpanded(this.#root.open.current),
    "aria-controls": this.#root.contentId,
    [this.#root.attrs.trigger]: "",
    onpointerdown: this.#onpointerdown,
    onkeydown: this.#onkeydown,
    onclick: this.#onclick,
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogCloseState {
  #id;
  #ref;
  #root;
  #variant;
  #disabled;
  #attr = once(() => this.#root.attrs[this.#variant.current]);
  constructor(props, root) {
    this.#root = root;
    this.#ref = props.ref;
    this.#id = props.id;
    this.#variant = props.variant;
    this.#disabled = props.disabled;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.#root.open.current
    });
  }
  #onclick = (e) => {
    if (this.#disabled.current) return;
    if (e.button > 0) return;
    this.#root.handleClose();
  };
  #onpointerdown = (e) => {
    if (this.#disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    if (e.button > 0) return;
    e.preventDefault();
    this.#root.handleClose();
  };
  #onkeydown = (e) => {
    if (this.#disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.#root.handleClose();
    }
  };
  #props = once(() => ({
    id: this.#id.current,
    [this.#attr()]: "",
    onpointerdown: this.#onpointerdown,
    onclick: this.#onclick,
    onkeydown: this.#onkeydown,
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogActionState {
  #id;
  #ref;
  #root;
  #attr = once(() => this.#root.attrs.action);
  constructor(props, root) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.#root = root;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    id: this.#id.current,
    [this.#attr()]: "",
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogTitleState {
  #id;
  #ref;
  #root;
  #level;
  constructor(props, root) {
    this.#id = props.id;
    this.#root = root;
    this.#ref = props.ref;
    this.#level = props.level;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.#root.titleNode = node;
        this.#root.titleId = node?.id;
      },
      deps: () => this.#root.open.current
    });
  }
  #props = once(() => ({
    id: this.#id.current,
    role: "heading",
    "aria-level": this.#level.current,
    [this.#root.attrs.title]: "",
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogDescriptionState {
  #id;
  #ref;
  #root;
  constructor(props, root) {
    this.#id = props.id;
    this.#root = root;
    this.#ref = props.ref;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.#root.open.current,
      onRefChange: (node) => {
        this.#root.descriptionNode = node;
        this.#root.descriptionId = node?.id;
      }
    });
  }
  #props = once(() => ({
    id: this.#id.current,
    [this.#root.attrs.description]: "",
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogContentState {
  #id;
  #ref;
  root;
  constructor(props, root) {
    this.#id = props.id;
    this.root = root;
    this.#ref = props.ref;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.root.open.current,
      onRefChange: (node) => {
        this.root.contentNode = node;
        this.root.contentId = node?.id;
      }
    });
  }
  #snippetProps = once(() => ({ open: this.root.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.#id.current,
    role: this.root.variant.current === "alert-dialog" ? "alertdialog" : "dialog",
    "aria-describedby": this.root.descriptionId,
    "aria-labelledby": this.root.titleId,
    [this.root.attrs.content]: "",
    style: { pointerEvents: "auto" },
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogOverlayState {
  #id;
  #ref;
  root;
  constructor(props, root) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.root = root;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.root.open.current
    });
  }
  #snippetProps = once(() => ({ open: this.root.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.#id.current,
    [this.root.attrs.overlay]: "",
    style: { pointerEvents: "auto" },
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class AlertDialogCancelState {
  #id;
  #ref;
  #root;
  #disabled;
  constructor(props, root) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.#root = root;
    this.#disabled = props.disabled;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.#root.open.current,
      onRefChange: (node) => {
        this.#root.cancelNode = node;
      }
    });
  }
  #onclick = (e) => {
    if (this.#disabled.current) return;
    if (e.button > 0) return;
    this.#root.handleClose();
  };
  #onpointerdown = (e) => {
    if (this.#disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    if (e.button > 0) return;
    e.preventDefault();
    this.#root.handleClose();
  };
  #onkeydown = (e) => {
    if (this.#disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.#root.handleClose();
    }
  };
  #props = once(() => ({
    id: this.#id.current,
    [this.#root.attrs.cancel]: "",
    onpointerdown: this.#onpointerdown,
    onclick: this.#onclick,
    onkeydown: this.#onkeydown,
    ...this.#root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
const [setDialogRootContext, getDialogRootContext] = createContext("Dialog.Root");
function useDialogRoot(props) {
  return setDialogRootContext(new DialogRootState(props));
}
function useDialogTrigger(props) {
  const root = getDialogRootContext();
  return new DialogTriggerState(props, root);
}
function useDialogTitle(props) {
  return new DialogTitleState(props, getDialogRootContext());
}
function useDialogContent(props) {
  return new DialogContentState(props, getDialogRootContext());
}
function useDialogOverlay(props) {
  return new DialogOverlayState(props, getDialogRootContext());
}
function useDialogDescription(props) {
  return new DialogDescriptionState(props, getDialogRootContext());
}
function useDialogClose(props) {
  return new DialogCloseState(props, getDialogRootContext());
}
function useAlertDialogCancel(props) {
  return new AlertDialogCancelState(props, getDialogRootContext());
}
function useAlertDialogAction(props) {
  return new DialogActionState(props, getDialogRootContext());
}
function Alert_dialog($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    controlledOpen = false,
    children
  } = $$props;
  useDialogRoot({
    variant: box.with(() => "alert-dialog"),
    open: box.with(() => open, (v) => {
      if (controlledOpen) {
        onOpenChange(v);
      } else {
        open = v;
        onOpenChange(v);
      }
    })
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { open });
  pop();
}
function Dialog_title$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    level = 2,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const titleState = useDialogTitle({
    id: box.with(() => id),
    level: box.with(() => level),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, titleState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_action$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const actionState = useAlertDialogAction({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, actionState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_cancel$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cancelState = useAlertDialogCancel({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, cancelState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Portal$1($$payload, $$props) {
  push();
  let { to = "body", children, disabled } = $$props;
  getAllContexts();
  getTarget();
  function getTarget() {
    if (!isBrowser || disabled) return null;
    let localTarget = null;
    if (typeof to === "string") {
      localTarget = document.querySelector(to);
    } else if (to instanceof HTMLElement || to instanceof DocumentFragment) {
      localTarget = to;
    } else ;
    return localTarget;
  }
  if (disabled) {
    $$payload.out += "<!--[-->";
    children?.($$payload);
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
function debounce(fn, wait = 500) {
  let timeout = null;
  const debounced = (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
  debounced.destroy = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
class DismissibleLayerState {
  #interactOutsideProp;
  #behaviorType;
  #interceptedEvents = { pointerdown: false };
  #isResponsibleLayer = false;
  node = box(null);
  #documentObj = void 0;
  #enabled;
  #isFocusInsideDOMTree = false;
  #onFocusOutside;
  currNode = null;
  #isValidEventProp;
  #unsubClickListener = noop;
  constructor(props) {
    this.#enabled = props.enabled;
    this.#isValidEventProp = props.isValidEvent;
    useRefById({
      id: props.id,
      ref: this.node,
      deps: () => this.#enabled.current,
      onRefChange: (node) => {
        this.currNode = node;
      }
    });
    this.#behaviorType = props.interactOutsideBehavior;
    this.#interactOutsideProp = props.onInteractOutside;
    this.#onFocusOutside = props.onFocusOutside;
  }
  #handleFocus = (event) => {
    if (event.defaultPrevented) return;
    if (!this.currNode) return;
    afterTick(() => {
      if (!this.currNode || this.#isTargetWithinLayer(event.target)) return;
      if (event.target && !this.#isFocusInsideDOMTree) {
        this.#onFocusOutside.current?.(event);
      }
    });
  };
  #addEventListeners() {
    return executeCallbacks(
      /**
      * CAPTURE INTERACTION START
      * mark interaction-start event as intercepted.
      * mark responsible layer during interaction start
      * to avoid checking if is responsible layer during interaction end
      * when a new floating element may have been opened.
      */
      addEventListener(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), true),
      /**
      * BUBBLE INTERACTION START
      * Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
      * to avoid prematurely checking if other events were intercepted.
      */
      addEventListener(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
      /**
      * HANDLE FOCUS OUTSIDE
      */
      addEventListener(this.#documentObj, "focusin", this.#handleFocus)
    );
  }
  #handleDismiss = (e) => {
    let event = e;
    if (event.defaultPrevented) {
      event = createWrappedEvent(e);
    }
    this.#interactOutsideProp.current(e);
  };
  #handleInteractOutside = debounce(
    (e) => {
      if (!this.currNode) {
        this.#unsubClickListener();
        return;
      }
      const isEventValid = this.#isValidEventProp.current(e, this.currNode) || isValidEvent(e, this.currNode);
      if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
        this.#unsubClickListener();
        return;
      }
      let event = e;
      if (event.defaultPrevented) {
        event = createWrappedEvent(event);
      }
      if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
        this.#unsubClickListener();
        return;
      }
      if (e.pointerType === "touch") {
        this.#unsubClickListener();
        this.#unsubClickListener = addEventListener(this.#documentObj, "click", this.#handleDismiss, { once: true });
      } else {
        this.#interactOutsideProp.current(event);
      }
    },
    10
  );
  #markInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = true;
  };
  #markNonInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = false;
  };
  #markResponsibleLayer = () => {
    if (!this.node.current) return;
    this.#isResponsibleLayer = isResponsibleLayer(this.node.current);
  };
  #isTargetWithinLayer = (target) => {
    if (!this.node.current) return false;
    return isOrContainsTarget(this.node.current, target);
  };
  #resetState = debounce(
    () => {
      for (const eventType in this.#interceptedEvents) {
        this.#interceptedEvents[eventType] = false;
      }
      this.#isResponsibleLayer = false;
    },
    20
  );
  #isAnyEventIntercepted() {
    const i = Object.values(this.#interceptedEvents).some(Boolean);
    return i;
  }
  #onfocuscapture = () => {
    this.#isFocusInsideDOMTree = true;
  };
  #onblurcapture = () => {
    this.#isFocusInsideDOMTree = false;
  };
  props = {
    onfocuscapture: this.#onfocuscapture,
    onblurcapture: this.#onblurcapture
  };
}
function useDismissibleLayer(props) {
  return new DismissibleLayerState(props);
}
function getTopMostLayer(layersArr) {
  return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
  const layersArr = [...globalThis.bitsDismissableLayers];
  const topMostLayer = getTopMostLayer(layersArr);
  if (topMostLayer) return topMostLayer[0].node.current === node;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode.node.current === node;
}
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0) return false;
  const target = e.target;
  if (!isElement(target)) return false;
  const ownerDocument = getOwnerDocument(target);
  const isValid = ownerDocument.documentElement.contains(target) && !isOrContainsTarget(node, target);
  return isValid;
}
function createWrappedEvent(e) {
  const capturedCurrentTarget = e.currentTarget;
  const capturedTarget = e.target;
  let newEvent;
  if (e instanceof PointerEvent) {
    newEvent = new PointerEvent(e.type, e);
  } else {
    newEvent = new PointerEvent("pointerdown", e);
  }
  let isPrevented = false;
  const wrappedEvent = new Proxy(newEvent, {
    get: (target, prop) => {
      if (prop === "currentTarget") {
        return capturedCurrentTarget;
      }
      if (prop === "target") {
        return capturedTarget;
      }
      if (prop === "preventDefault") {
        return () => {
          isPrevented = true;
          if (typeof target.preventDefault === "function") {
            target.preventDefault();
          }
        };
      }
      if (prop === "defaultPrevented") {
        return isPrevented;
      }
      if (prop in target) {
        return target[prop];
      }
      return e[prop];
    }
  });
  return wrappedEvent;
}
function Dismissible_layer($$payload, $$props) {
  push();
  let {
    interactOutsideBehavior = "close",
    onInteractOutside = noop,
    onFocusOutside = noop,
    id,
    children,
    enabled,
    isValidEvent: isValidEvent2 = () => false
  } = $$props;
  const dismissibleLayerState = useDismissibleLayer({
    id: box.with(() => id),
    interactOutsideBehavior: box.with(() => interactOutsideBehavior),
    onInteractOutside: box.with(() => onInteractOutside),
    enabled: box.with(() => enabled),
    onFocusOutside: box.with(() => onFocusOutside),
    isValidEvent: box.with(() => isValidEvent2)
  });
  children?.($$payload, { props: dismissibleLayerState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
class EscapeLayerState {
  #onEscapeProp;
  #behaviorType;
  #enabled;
  constructor(props) {
    this.#behaviorType = props.escapeKeydownBehavior;
    this.#onEscapeProp = props.onEscapeKeydown;
    this.#enabled = props.enabled;
  }
  #addEventListener = () => {
    return addEventListener(document, "keydown", this.#onkeydown, { passive: false });
  };
  #onkeydown = (e) => {
    if (e.key !== ESCAPE || !isResponsibleEscapeLayer(this)) return;
    const clonedEvent = new KeyboardEvent(e.type, e);
    e.preventDefault();
    const behaviorType = this.#behaviorType.current;
    if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
    this.#onEscapeProp.current(clonedEvent);
  };
}
function useEscapeLayer(props) {
  return new EscapeLayerState(props);
}
function isResponsibleEscapeLayer(instance) {
  const layersArr = [...globalThis.bitsEscapeLayers];
  const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
  if (topMostLayer) return topMostLayer[0] === instance;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode === instance;
}
function Escape_layer($$payload, $$props) {
  push();
  let {
    escapeKeydownBehavior = "close",
    onEscapeKeydown = noop,
    children,
    enabled
  } = $$props;
  useEscapeLayer({
    escapeKeydownBehavior: box.with(() => escapeKeydownBehavior),
    onEscapeKeydown: box.with(() => onEscapeKeydown),
    enabled: box.with(() => enabled)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function createFocusScopeAPI() {
  let paused = false;
  return {
    id: useId(),
    get paused() {
      return paused;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    }
  };
}
function focus(element2, { select = false } = {}) {
  if (!(element2 && element2.focus))
    return;
  const previouslyFocusedElement = document.activeElement;
  element2.focus({ preventScroll: true });
  if (element2 !== previouslyFocusedElement && isSelectableInput(element2) && select) {
    element2.select();
  }
}
function findVisible(elements, container) {
  for (const element2 of elements) {
    if (!isElementHidden(element2, container))
      return element2;
  }
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    // eslint-disable-next-line ts/no-explicit-any
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput)
        return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode())
    nodes.push(walker.currentNode);
  return nodes;
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function useFocusScope({
  id,
  loop,
  enabled,
  onOpenAutoFocus,
  onCloseAutoFocus,
  forceMount
}) {
  const focusScope = createFocusScopeAPI();
  const ref = box(null);
  useRefById({ id, ref, deps: () => enabled.current });
  function handleKeydown(e) {
    if (!enabled.current) return;
    if (!loop.current && !enabled.current) return;
    if (focusScope.paused) return;
    const isTabKey = e.key === TAB && !e.ctrlKey && !e.altKey && !e.metaKey;
    const focusedElement = document.activeElement;
    if (!(isTabKey && focusedElement)) return;
    const container = ref.current;
    if (!container) return;
    const [first, last] = getTabbableEdges(container);
    const hasTabbableElementsInside = first && last;
    if (!hasTabbableElementsInside) {
      if (focusedElement === container) {
        e.preventDefault();
      }
    } else {
      if (!e.shiftKey && focusedElement === last) {
        e.preventDefault();
        if (loop.current) focus(first, { select: true });
      } else if (e.shiftKey && focusedElement === first) {
        e.preventDefault();
        if (loop.current) focus(last, { select: true });
      }
    }
  }
  const props = (() => ({
    id: id.current,
    tabindex: -1,
    onkeydown: handleKeydown
  }))();
  return {
    get props() {
      return props;
    }
  };
}
function Focus_scope($$payload, $$props) {
  push();
  let {
    id,
    trapFocus = false,
    loop = false,
    onCloseAutoFocus = noop,
    onOpenAutoFocus = noop,
    focusScope,
    forceMount = false
  } = $$props;
  const focusScopeState = useFocusScope({
    enabled: box.with(() => trapFocus),
    loop: box.with(() => loop),
    onCloseAutoFocus: box.with(() => onCloseAutoFocus),
    onOpenAutoFocus: box.with(() => onOpenAutoFocus),
    id: box.with(() => id),
    forceMount: box.with(() => forceMount)
  });
  focusScope?.($$payload, { props: focusScopeState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
class TextSelectionLayerState {
  #id;
  #onPointerDownProp;
  #onPointerUpProp;
  #enabled;
  #unsubSelectionLock = noop;
  #ref = box(null);
  constructor(props) {
    this.#id = props.id;
    this.#enabled = props.preventOverflowTextSelection;
    this.#onPointerDownProp = props.onPointerDown;
    this.#onPointerUpProp = props.onPointerUp;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      deps: () => this.#enabled.current
    });
  }
  #addEventListeners() {
    return executeCallbacks(addEventListener(document, "pointerdown", this.#pointerdown), addEventListener(document, "pointerup", composeHandlers(this.#resetSelectionLock, this.#onPointerUpProp)));
  }
  #pointerdown = (e) => {
    const node = this.#ref.current;
    const target = e.target;
    if (!isHTMLElement(node) || !isHTMLElement(target) || !this.#enabled.current) return;
    if (!isHighestLayer(this) || !isOrContainsTarget(node, target)) return;
    this.#onPointerDownProp.current(e);
    if (e.defaultPrevented) return;
    this.#unsubSelectionLock = preventTextSelectionOverflow(node);
  };
  #resetSelectionLock = () => {
    this.#unsubSelectionLock();
    this.#unsubSelectionLock = noop;
  };
}
function useTextSelectionLayer(props) {
  return new TextSelectionLayerState(props);
}
const getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node) {
  const body = document.body;
  const originalBodyUserSelect = getUserSelect(body);
  const originalNodeUserSelect = getUserSelect(node);
  setUserSelect(body, "none");
  setUserSelect(node, "text");
  return () => {
    setUserSelect(body, originalBodyUserSelect);
    setUserSelect(node, originalNodeUserSelect);
  };
}
function setUserSelect(node, value) {
  node.style.userSelect = value;
  node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
  const layersArr = [...globalThis.bitsTextSelectionLayers];
  if (!layersArr.length) return false;
  const highestLayer = layersArr.at(-1);
  if (!highestLayer) return false;
  return highestLayer[0] === instance;
}
function Text_selection_layer($$payload, $$props) {
  push();
  let {
    preventOverflowTextSelection = true,
    onPointerDown = noop,
    onPointerUp = noop,
    id,
    children,
    enabled
  } = $$props;
  useTextSelectionLayer({
    id: box.with(() => id),
    preventOverflowTextSelection: box.with(() => preventOverflowTextSelection),
    onPointerDown: box.with(() => onPointerDown),
    onPointerUp: box.with(() => onPointerUp),
    enabled: box.with(() => enabled)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
const SvelteMap = globalThis.Map;
function createSharedHook(factory) {
  let state = void 0;
  return (...args) => {
    return state;
  };
}
const useBodyLockStackCount = createSharedHook();
function useBodyScrollLock(initialState, restoreScrollDelay = () => null) {
  const id = useId();
  const countState = useBodyLockStackCount();
  restoreScrollDelay();
  countState.map.set(id, initialState ?? false);
  const locked = box.with(() => countState.map.get(id) ?? false, (v) => countState.map.set(id, v));
  return locked;
}
function Scroll_lock($$payload, $$props) {
  push();
  let {
    preventScroll = true,
    restoreScrollDelay = null
  } = $$props;
  useBodyScrollLock(preventScroll, () => restoreScrollDelay);
  pop();
}
function shouldTrapFocus({ forceMount, present, trapFocus, open }) {
  if (forceMount) {
    return open && trapFocus;
  }
  return present && trapFocus && open;
}
function Alert_dialog_content$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    ref = null,
    forceMount = false,
    interactOutsideBehavior = "ignore",
    onCloseAutoFocus = noop,
    onEscapeKeydown = noop,
    onOpenAutoFocus = noop,
    onInteractOutside = noop,
    preventScroll = true,
    trapFocus = true,
    restoreScrollDelay = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useDialogContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  {
    let presence = function($$payload2, { present }) {
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, spread_props([
            mergedProps,
            {
              enabled: present.current,
              onEscapeKeydown: (e) => {
                onEscapeKeydown(e);
                if (e.defaultPrevented) return;
                contentState.root.handleClose();
              },
              children: ($$payload4) => {
                Dismissible_layer($$payload4, spread_props([
                  mergedProps,
                  {
                    enabled: present.current,
                    interactOutsideBehavior,
                    onInteractOutside: (e) => {
                      onInteractOutside(e);
                      if (e.defaultPrevented) return;
                      contentState.root.handleClose();
                    },
                    children: ($$payload5) => {
                      Text_selection_layer($$payload5, spread_props([
                        mergedProps,
                        {
                          enabled: present.current,
                          children: ($$payload6) => {
                            if (child) {
                              $$payload6.out += "<!--[-->";
                              if (contentState.root.open.current) {
                                $$payload6.out += "<!--[-->";
                                Scroll_lock($$payload6, { preventScroll, restoreScrollDelay });
                              } else {
                                $$payload6.out += "<!--[!-->";
                              }
                              $$payload6.out += `<!--]--> `;
                              child($$payload6, {
                                props: mergeProps(mergedProps, focusScopeProps),
                                ...contentState.snippetProps
                              });
                              $$payload6.out += `<!---->`;
                            } else {
                              $$payload6.out += "<!--[!-->";
                              Scroll_lock($$payload6, { preventScroll });
                              $$payload6.out += `<!----> <div${spread_attributes({
                                ...mergeProps(mergedProps, focusScopeProps)
                              })}>`;
                              children?.($$payload6);
                              $$payload6.out += `<!----></div>`;
                            }
                            $$payload6.out += `<!--]-->`;
                          },
                          $$slots: { default: true }
                        }
                      ]));
                    },
                    $$slots: { default: true }
                  }
                ]));
              },
              $$slots: { default: true }
            }
          ]));
        };
        Focus_scope($$payload2, spread_props([
          {
            loop: true,
            trapFocus: shouldTrapFocus({
              forceMount,
              present: present.current,
              trapFocus,
              open: contentState.root.open.current
            })
          },
          mergedProps,
          {
            onCloseAutoFocus: (e) => {
              onCloseAutoFocus(e);
              if (e.defaultPrevented) return;
              contentState.root.triggerNode?.focus();
            },
            onOpenAutoFocus: (e) => {
              onOpenAutoFocus(e);
              if (e.defaultPrevented) return;
              e.preventDefault();
              contentState.root.cancelNode?.focus();
            },
            focusScope,
            $$slots: { focusScope: true }
          }
        ]));
      }
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        forceMount,
        present: contentState.root.open.current || forceMount,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  bind_props($$props, { ref });
  pop();
}
function Dialog_overlay$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    forceMount = false,
    child,
    children,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const overlayState = useDialogOverlay({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, overlayState.props);
  {
    let presence = function($$payload2) {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, {
          props: mergeProps(mergedProps),
          ...overlayState.snippetProps
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergeProps(mergedProps) })}>`;
        children?.($$payload2, overlayState.snippetProps);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    };
    Presence_layer($$payload, {
      id,
      present: overlayState.root.open.current || forceMount,
      presence,
      $$slots: { presence: true }
    });
  }
  bind_props($$props, { ref });
  pop();
}
function Dialog_trigger($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useDialogTrigger({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, triggerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_description($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const descriptionState = useDialogDescription({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, descriptionState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function next(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  if (array.length === 1 && index === 0) {
    return array[0];
  }
  if (index === array.length - 1) {
    return loop ? array[0] : void 0;
  }
  return array[index + 1];
}
function prev(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  if (array.length === 1 && index === 0) {
    return array[0];
  }
  if (index === 0) {
    return loop ? array[array.length - 1] : void 0;
  }
  return array[index - 1];
}
function forward(array, index, increment, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  let targetIndex = index + increment;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function backward(array, index, decrement, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  let targetIndex = index - decrement;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch)
    wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) => value?.toLowerCase().startsWith(normalizedSearch.toLowerCase()));
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function Visually_hidden($$payload, $$props) {
  push();
  let {
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const style = {
    position: "absolute",
    border: 0,
    width: "1px",
    display: "inline-block",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal"
  };
  const mergedProps = mergeProps(restProps, { style });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<span${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></span>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function boxAutoReset(defaultValue, afterMs = 1e4) {
  let timeout = null;
  let value = defaultValue;
  function resetAfter() {
    return setTimeout(
      () => {
        value = defaultValue;
      },
      afterMs
    );
  }
  return box.with(() => value, (v) => {
    value = v;
    if (timeout) clearTimeout(timeout);
    timeout = resetAfter();
  });
}
function useDOMTypeahead(opts) {
  const search = boxAutoReset("", 1e3);
  const onMatch = opts?.onMatch ?? ((node) => node.focus());
  const getCurrentItem = opts?.getCurrentItem ?? (() => document.activeElement);
  function handleTypeaheadSearch(key, candidates) {
    if (!candidates.length) return;
    search.current = search.current + key;
    const currentItem = getCurrentItem();
    const currentMatch = candidates.find((item) => item === currentItem)?.textContent?.trim() ?? "";
    const values = candidates.map((item) => item.textContent?.trim() ?? "");
    const nextMatch = getNextMatch(values, search.current, currentMatch);
    const newItem = candidates.find((item) => item.textContent?.trim() === nextMatch);
    if (newItem) {
      onMatch(newItem);
    }
    return newItem;
  }
  function resetTypeahead() {
    search.current = "";
  }
  return {
    search,
    handleTypeaheadSearch,
    resetTypeahead
  };
}
function useDataTypeahead(opts) {
  const search = boxAutoReset("", 1e3);
  function handleTypeaheadSearch(key, candidateValues) {
    if (!opts.enabled) return;
    if (!candidateValues.length) return;
    search.current = search.current + key;
    const currentItem = opts.getCurrentItem();
    const currentMatch = candidateValues.find((item) => item === currentItem) ?? "";
    const values = candidateValues.map((item) => item ?? "");
    const nextMatch = getNextMatch(values, search.current, currentMatch);
    const newItem = candidateValues.find((item) => item === nextMatch);
    if (newItem) {
      opts.onMatch(newItem);
    }
    return newItem;
  }
  function resetTypeahead() {
    search.current = "";
  }
  return {
    search,
    handleTypeaheadSearch,
    resetTypeahead
  };
}
const FIRST_KEYS = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
class SelectBaseRootState {
  disabled;
  required;
  name;
  loop;
  open;
  scrollAlignment;
  items;
  allowDeselect;
  touchedInput = false;
  inputValue = "";
  inputNode = null;
  contentNode = null;
  triggerNode = null;
  valueId = "";
  highlightedNode = null;
  #highlightedValue = once(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-value");
  });
  get highlightedValue() {
    return this.#highlightedValue();
  }
  #highlightedId = once(() => {
    if (!this.highlightedNode) return void 0;
    return this.highlightedNode.id;
  });
  get highlightedId() {
    return this.#highlightedId();
  }
  #highlightedLabel = once(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-label");
  });
  get highlightedLabel() {
    return this.#highlightedLabel();
  }
  isUsingKeyboard = false;
  isCombobox = false;
  bitsAttrs;
  triggerPointerDownPos = { x: 0, y: 0 };
  constructor(props) {
    this.disabled = props.disabled;
    this.required = props.required;
    this.name = props.name;
    this.loop = props.loop;
    this.open = props.open;
    this.scrollAlignment = props.scrollAlignment;
    this.isCombobox = props.isCombobox;
    this.items = props.items;
    this.allowDeselect = props.allowDeselect;
    this.bitsAttrs = getSelectBitsAttrs(this);
  }
  setHighlightedNode = (node) => {
    this.highlightedNode = node;
    if (node) {
      if (this.isUsingKeyboard) {
        node.scrollIntoView({ block: "nearest" });
      }
    }
  };
  getCandidateNodes = () => {
    const node = this.contentNode;
    if (!node) return [];
    const nodes = Array.from(node.querySelectorAll(`[${this.bitsAttrs.item}]:not([data-disabled])`));
    return nodes;
  };
  setHighlightedToFirstCandidate = () => {
    this.setHighlightedNode(null);
    const candidateNodes = this.getCandidateNodes();
    if (!candidateNodes.length) return;
    this.setHighlightedNode(candidateNodes[0]);
  };
  getNodeByValue = (value) => {
    const candidateNodes = this.getCandidateNodes();
    return candidateNodes.find((node) => node.dataset.value === value) ?? null;
  };
  setOpen = (open) => {
    this.open.current = open;
  };
  toggleOpen = () => {
    this.open.current = !this.open.current;
  };
  handleOpen = () => {
    this.setOpen(true);
  };
  handleClose = () => {
    this.setHighlightedNode(null);
    this.setOpen(false);
  };
  toggleMenu = () => {
    this.toggleOpen();
  };
}
class SelectSingleRootState extends SelectBaseRootState {
  value;
  isMulti = false;
  #hasValue = once(() => this.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  #currentLabel = once(() => {
    if (!this.items.current.length) return "";
    const match = this.items.current.find((item) => item.value === this.value.current)?.label;
    return match ?? "";
  });
  get currentLabel() {
    return this.#currentLabel();
  }
  #candidateLabels = once(() => {
    if (!this.items.current.length) return [];
    const filteredItems = this.items.current.filter((item) => !item.disabled);
    return filteredItems.map((item) => item.label);
  });
  get candidateLabels() {
    return this.#candidateLabels();
  }
  #dataTypeaheadEnabled = once(() => {
    if (this.isMulti) return false;
    if (this.items.current.length === 0) return false;
    return true;
  });
  get dataTypeaheadEnabled() {
    return this.#dataTypeaheadEnabled();
  }
  constructor(props) {
    super(props);
    this.value = props.value;
  }
  includesItem = (itemValue) => {
    return this.value.current === itemValue;
  };
  toggleItem = (itemValue, itemLabel = itemValue) => {
    this.value.current = this.includesItem(itemValue) ? "" : itemValue;
    this.inputValue = itemLabel;
  };
  setInitialHighlightedNode = () => {
    if (this.highlightedNode && document.contains(this.highlightedNode)) return;
    if (this.value.current !== "") {
      const node = this.getNodeByValue(this.value.current);
      if (node) {
        this.setHighlightedNode(node);
        return;
      }
    }
    const firstCandidate = this.getCandidateNodes()[0];
    if (!firstCandidate) return;
    this.setHighlightedNode(firstCandidate);
  };
}
class SelectMultipleRootState extends SelectBaseRootState {
  value;
  isMulti = true;
  #hasValue = once(() => this.value.current.length > 0);
  get hasValue() {
    return this.#hasValue();
  }
  constructor(props) {
    super(props);
    this.value = props.value;
  }
  includesItem = (itemValue) => {
    return this.value.current.includes(itemValue);
  };
  toggleItem = (itemValue, itemLabel = itemValue) => {
    if (this.includesItem(itemValue)) {
      this.value.current = this.value.current.filter((v) => v !== itemValue);
    } else {
      this.value.current = [...this.value.current, itemValue];
    }
    this.inputValue = itemLabel;
  };
  setInitialHighlightedNode = () => {
    if (this.highlightedNode) return;
    if (this.value.current.length && this.value.current[0] !== "") {
      const node = this.getNodeByValue(this.value.current[0]);
      if (node) {
        this.setHighlightedNode(node);
        return;
      }
    }
    const firstCandidate = this.getCandidateNodes()[0];
    if (!firstCandidate) return;
    this.setHighlightedNode(firstCandidate);
  };
}
class SelectTriggerState {
  #id;
  #ref;
  root;
  #domTypeahead;
  #dataTypeahead;
  constructor(props, root) {
    this.root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.root.triggerNode = node;
      }
    });
    this.#domTypeahead = useDOMTypeahead({
      getCurrentItem: () => this.root.highlightedNode,
      onMatch: (node) => {
        this.root.setHighlightedNode(node);
      }
    });
    this.#dataTypeahead = useDataTypeahead({
      getCurrentItem: () => {
        if (this.root.isMulti) return "";
        return this.root.currentLabel;
      },
      onMatch: (label) => {
        if (this.root.isMulti) return;
        if (!this.root.items.current) return;
        const matchedItem = this.root.items.current.find((item) => item.label === label);
        if (!matchedItem) return;
        this.root.value.current = matchedItem.value;
      },
      enabled: !this.root.isMulti && this.root.dataTypeaheadEnabled
    });
  }
  #onkeydown = (e) => {
    this.root.isUsingKeyboard = true;
    if (e.key === ARROW_UP || e.key === ARROW_DOWN) e.preventDefault();
    if (!this.root.open.current) {
      if (e.key === ENTER || e.key === SPACE || e.key === ARROW_DOWN || e.key === ARROW_UP) {
        e.preventDefault();
        this.root.handleOpen();
      } else if (!this.root.isMulti && this.root.dataTypeaheadEnabled) {
        this.#dataTypeahead.handleTypeaheadSearch(e.key, this.root.candidateLabels);
        return;
      }
      afterTick(() => {
        if (this.root.hasValue) return;
        const candidateNodes2 = this.root.getCandidateNodes();
        if (!candidateNodes2.length) return;
        if (e.key === ARROW_DOWN) {
          const firstCandidate = candidateNodes2[0];
          this.root.setHighlightedNode(firstCandidate);
        } else if (e.key === ARROW_UP) {
          const lastCandidate = candidateNodes2[candidateNodes2.length - 1];
          this.root.setHighlightedNode(lastCandidate);
        }
      });
      return;
    }
    if (e.key === TAB) {
      this.root.handleClose();
      return;
    }
    if ((e.key === ENTER || e.key === SPACE) && !e.isComposing) {
      e.preventDefault();
      const highlightedValue = this.root.highlightedValue;
      const isCurrentSelectedValue = highlightedValue === this.root.value.current;
      if (!this.root.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
        this.root.handleClose();
        return;
      }
      if (highlightedValue !== null) {
        this.root.toggleItem(highlightedValue, this.root.highlightedLabel ?? void 0);
      }
      if (!this.root.isMulti && !isCurrentSelectedValue) {
        this.root.handleClose();
      }
    }
    if (e.key === ARROW_UP && e.altKey) {
      this.root.handleClose();
    }
    if (FIRST_LAST_KEYS.includes(e.key)) {
      e.preventDefault();
      const candidateNodes2 = this.root.getCandidateNodes();
      const currHighlightedNode = this.root.highlightedNode;
      const currIndex = currHighlightedNode ? candidateNodes2.indexOf(currHighlightedNode) : -1;
      const loop = this.root.loop.current;
      let nextItem;
      if (e.key === ARROW_DOWN) {
        nextItem = next(candidateNodes2, currIndex, loop);
      } else if (e.key === ARROW_UP) {
        nextItem = prev(candidateNodes2, currIndex, loop);
      } else if (e.key === PAGE_DOWN) {
        nextItem = forward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === PAGE_UP) {
        nextItem = backward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === HOME) {
        nextItem = candidateNodes2[0];
      } else if (e.key === END) {
        nextItem = candidateNodes2[candidateNodes2.length - 1];
      }
      if (!nextItem) return;
      this.root.setHighlightedNode(nextItem);
      return;
    }
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    if (e.code === "Space") return;
    const candidateNodes = this.root.getCandidateNodes();
    if (e.key === TAB) return;
    if (!isModifierKey && isCharacterKey) {
      this.#domTypeahead.handleTypeaheadSearch(e.key, candidateNodes);
      return;
    }
    if (!this.root.highlightedNode) {
      this.root.setHighlightedToFirstCandidate();
    }
  };
  #handleOpen = () => {
    this.root.open.current = true;
    this.#dataTypeahead.resetTypeahead();
    this.#domTypeahead.resetTypeahead();
  };
  #handlePointerOpen = (e) => {
    this.#handleOpen();
    this.root.triggerPointerDownPos = {
      x: Math.round(e.pageX),
      y: Math.round(e.pageY)
    };
  };
  #onclick = (e) => {
    const currTarget = e.currentTarget;
    currTarget.focus();
  };
  /**
   * `pointerdown` fires before the `focus` event, so we can prevent the default
   * behavior of focusing the button and keep focus on the input.
   */
  #onpointerdown = (e) => {
    if (this.root.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    const target = e.target;
    if (target?.hasPointerCapture(e.pointerId)) {
      target?.releasePointerCapture(e.pointerId);
    }
    if (e.button === 0 && e.ctrlKey === false) {
      if (this.root.open.current === false) {
        this.#handlePointerOpen(e);
        e.preventDefault();
      } else {
        this.root.handleClose();
      }
    }
  };
  #onpointerup = (e) => {
    e.preventDefault();
    if (e.pointerType === "touch") {
      this.#handlePointerOpen(e);
    }
  };
  #props = once(() => ({
    id: this.#id.current,
    disabled: this.root.disabled.current ? true : void 0,
    "aria-haspopup": "listbox",
    "data-state": getDataOpenClosed(this.root.open.current),
    "data-disabled": getDataDisabled(this.root.disabled.current),
    "data-placeholder": this.root.hasValue ? void 0 : "",
    [this.root.bitsAttrs.trigger]: "",
    onpointerdown: this.#onpointerdown,
    onkeydown: this.#onkeydown,
    onclick: this.#onclick,
    onpointerup: this.#onpointerup
    // onclick: this.#onclick,
  }));
  get props() {
    return this.#props();
  }
}
class SelectContentState {
  id;
  ref;
  viewportNode = null;
  root;
  isPositioned = false;
  constructor(props, root) {
    this.root = root;
    this.id = props.id;
    this.ref = props.ref;
    useRefById({
      id: this.id,
      ref: this.ref,
      onRefChange: (node) => {
        this.root.contentNode = node;
      },
      deps: () => this.root.open.current
    });
  }
  #onpointermove = () => {
    this.root.isUsingKeyboard = false;
  };
  #styles = once(() => {
    if (this.root.isCombobox) {
      return {
        "--bits-combobox-content-transform-origin": "var(--bits-floating-transform-origin)",
        "--bits-combobox-content-available-width": "var(--bits-floating-available-width)",
        "--bits-combobox-content-available-height": "var(--bits-floating-available-height)",
        "--bits-combobox-anchor-width": "var(--bits-floating-anchor-width)",
        "--bits-combobox-anchor-height": "var(--bits-floating-anchor-height)"
      };
    } else {
      return {
        "--bits-select-content-transform-origin": "var(--bits-floating-transform-origin)",
        "--bits-select-content-available-width": "var(--bits-floating-available-width)",
        "--bits-select-content-available-height": "var(--bits-floating-available-height)",
        "--bits-select-anchor-width": "var(--bits-floating-anchor-width)",
        "--bits-select-anchor-height": "var(--bits-floating-anchor-height)"
      };
    }
  });
  handleInteractOutside = (e) => {
    if (e.target === this.root.triggerNode || e.target === this.root.inputNode) {
      e.preventDefault();
    }
  };
  #snippetProps = once(() => ({ open: this.root.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.id.current,
    role: "listbox",
    "data-state": getDataOpenClosed(this.root.open.current),
    [this.root.bitsAttrs.content]: "",
    style: {
      display: "flex",
      flexDirection: "column",
      outline: "none",
      boxSizing: "border-box",
      pointerEvents: "auto",
      ...this.#styles()
    },
    onpointermove: this.#onpointermove
  }));
  get props() {
    return this.#props();
  }
}
class SelectItemState {
  #id;
  #ref;
  root;
  value;
  label;
  onHighlight;
  onUnhighlight;
  disabled;
  #isSelected = once(() => this.root.includesItem(this.value.current));
  get isSelected() {
    return this.#isSelected();
  }
  #isHighlighted = once(() => this.root.highlightedValue === this.value.current);
  get isHighlighted() {
    return this.#isHighlighted();
  }
  prevHighlighted = new Previous(() => this.isHighlighted);
  textId = "";
  mounted = false;
  constructor(props, root) {
    this.root = root;
    this.value = props.value;
    this.disabled = props.disabled;
    this.label = props.label;
    this.onHighlight = props.onHighlight;
    this.onUnhighlight = props.onUnhighlight;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #snippetProps = once(() => ({
    selected: this.isSelected,
    highlighted: this.isHighlighted
  }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #onpointerdown = (e) => {
    e.preventDefault();
  };
  /**
   * Using `pointerup` instead of `click` allows power users to pointerdown
   * the trigger, then release pointerup on an item to select it vs having to do
   * multiple clicks.
   */
  #onpointerup = (e) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (this.disabled.current) return;
    const isCurrentSelectedValue = this.value.current === this.root.value.current;
    if (!this.root.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return;
    }
    this.root.toggleItem(this.value.current, this.label.current);
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
    }
  };
  #onpointermove = (_) => {
    if (this.root.highlightedNode !== this.#ref.current) {
      this.root.setHighlightedNode(this.#ref.current);
    }
  };
  setTextId = (id) => {
    this.textId = id;
  };
  #props = once(() => ({
    id: this.#id.current,
    role: "option",
    "aria-selected": this.root.includesItem(this.value.current) ? "true" : void 0,
    "data-value": this.value.current,
    "data-disabled": getDataDisabled(this.disabled.current),
    "data-highlighted": this.root.highlightedValue === this.value.current ? "" : void 0,
    "data-selected": this.root.includesItem(this.value.current) ? "" : void 0,
    "data-label": this.label.current,
    [this.root.bitsAttrs.item]: "",
    onpointermove: this.#onpointermove,
    onpointerdown: this.#onpointerdown,
    onpointerup: this.#onpointerup
  }));
  get props() {
    return this.#props();
  }
}
class SelectHiddenInputState {
  #value;
  root;
  #shouldRender = once(() => this.root.name.current !== "");
  get shouldRender() {
    return this.#shouldRender();
  }
  constructor(props, root) {
    this.root = root;
    this.#value = props.value;
  }
  #onfocus = (e) => {
    e.preventDefault();
    if (!this.root.isCombobox) {
      this.root.triggerNode?.focus();
    } else {
      this.root.inputNode?.focus();
    }
  };
  #props = once(() => ({
    disabled: getDisabled(this.root.disabled.current),
    required: getRequired(this.root.required.current),
    name: this.root.name.current,
    value: this.#value.current,
    style: styleToString(srOnlyStyles),
    tabindex: -1,
    onfocus: this.#onfocus
  }));
  get props() {
    return this.#props();
  }
}
class SelectViewportState {
  #id;
  #ref;
  root;
  content;
  prevScrollTop = 0;
  constructor(props, content) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.content = content;
    this.root = content.root;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.content.viewportNode = node;
      },
      deps: () => this.root.open.current
    });
  }
  #props = once(() => ({
    id: this.#id.current,
    role: "presentation",
    [this.root.bitsAttrs.viewport]: "",
    style: {
      // we use position: 'relative' here on the `viewport` so that when we call
      // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
      // (independent of the scrollUpButton).
      position: "relative",
      flex: 1,
      overflow: "auto"
    }
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollButtonImplState {
  id;
  ref;
  content;
  root;
  autoScrollTimer = null;
  onAutoScroll = noop;
  mounted;
  constructor(props, content) {
    this.ref = props.ref;
    this.id = props.id;
    this.mounted = props.mounted;
    this.content = content;
    this.root = content.root;
    useRefById({
      id: this.id,
      ref: this.ref,
      deps: () => this.mounted.current
    });
  }
  clearAutoScrollTimer = () => {
    if (this.autoScrollTimer === null) return;
    window.clearInterval(this.autoScrollTimer);
    this.autoScrollTimer = null;
  };
  #onpointerdown = () => {
    if (this.autoScrollTimer !== null) return;
    this.autoScrollTimer = window.setInterval(
      () => {
        this.onAutoScroll();
      },
      50
    );
  };
  #onpointermove = () => {
    if (this.autoScrollTimer !== null) return;
    this.autoScrollTimer = window.setInterval(
      () => {
        this.onAutoScroll();
      },
      50
    );
  };
  #onpointerleave = () => {
    this.clearAutoScrollTimer();
  };
  #props = once(() => ({
    id: this.id.current,
    "aria-hidden": getAriaHidden(true),
    style: { flexShrink: 0 },
    onpointerdown: this.#onpointerdown,
    onpointermove: this.#onpointermove,
    onpointerleave: this.#onpointerleave
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollDownButtonState {
  state;
  content;
  root;
  canScrollDown = false;
  constructor(state) {
    this.state = state;
    this.content = state.content;
    this.root = state.root;
    this.state.onAutoScroll = this.handleAutoScroll;
  }
  handleAutoScroll = () => {
    afterTick(() => {
      const viewport = this.content.viewportNode;
      const selectedItem = this.root.highlightedNode;
      if (!viewport || !selectedItem) return;
      viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
    });
  };
  #props = once(() => ({
    ...this.state.props,
    [this.root.bitsAttrs["scroll-down-button"]]: ""
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollUpButtonState {
  state;
  content;
  root;
  canScrollUp = false;
  constructor(state) {
    this.state = state;
    this.content = state.content;
    this.root = state.root;
    this.state.onAutoScroll = this.handleAutoScroll;
  }
  handleAutoScroll = () => {
    afterTick(() => {
      const viewport = this.content.viewportNode;
      const selectedItem = this.root.highlightedNode;
      if (!viewport || !selectedItem) return;
      viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight;
    });
  };
  #props = once(() => ({
    ...this.state.props,
    [this.root.bitsAttrs["scroll-up-button"]]: ""
  }));
  get props() {
    return this.#props();
  }
}
const [setSelectRootContext, getSelectRootContext] = createContext(["Select.Root", "Combobox.Root"]);
createContext(["Select.Group", "Combobox.Group"]);
const [
  setSelectContentContext,
  getSelectContentContext
] = createContext(["Select.Content", "Combobox.Content"]);
function useSelectRoot(props) {
  const { type, ...rest } = props;
  const rootState = type === "single" ? new SelectSingleRootState(rest) : new SelectMultipleRootState(rest);
  return setSelectRootContext(rootState);
}
function useSelectContent(props) {
  return setSelectContentContext(new SelectContentState(props, getSelectRootContext()));
}
function useSelectTrigger(props) {
  return new SelectTriggerState(props, getSelectRootContext());
}
function useSelectItem(props) {
  return new SelectItemState(props, getSelectRootContext());
}
function useSelectViewport(props) {
  return new SelectViewportState(props, getSelectContentContext());
}
function useSelectScrollUpButton(props) {
  return new SelectScrollUpButtonState(new SelectScrollButtonImplState(props, getSelectContentContext()));
}
function useSelectScrollDownButton(props) {
  return new SelectScrollDownButtonState(new SelectScrollButtonImplState(props, getSelectContentContext()));
}
function useSelectHiddenInput(props) {
  return new SelectHiddenInputState(props, getSelectRootContext());
}
const selectParts = [
  "trigger",
  "content",
  "item",
  "viewport",
  "scroll-up-button",
  "scroll-down-button",
  "group",
  "group-label",
  "separator",
  "arrow",
  "input",
  "content-wrapper",
  "item-text",
  "value"
];
function getSelectBitsAttrs(root) {
  const isCombobox = root.isCombobox;
  const attrObj = {};
  for (const part of selectParts) {
    attrObj[part] = isCombobox ? `data-combobox-${part}` : `data-select-${part}`;
  }
  return attrObj;
}
function Select_hidden_input($$payload, $$props) {
  push();
  let { value = "" } = $$props;
  const hiddenInputState = useSelectHiddenInput({ value: box.with(() => value) });
  Visually_hidden($$payload, {
    children: ($$payload2) => {
      if (hiddenInputState.shouldRender) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<input${spread_attributes({ ...hiddenInputState.props, value })}>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  bind_props($$props, { value });
  pop();
}
function Floating_layer_content($$payload, $$props) {
  push();
  let {
    content,
    side = "bottom",
    sideOffset = 0,
    align = "center",
    alignOffset = 0,
    id,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 0,
    hideWhenDetached = false,
    onPlaced = () => {
    },
    sticky = "partial",
    updatePositionStrategy = "optimized",
    strategy = "fixed",
    dir = "ltr",
    style = {},
    wrapperId = useId(),
    customAnchor = null
  } = $$props;
  const contentState = useFloatingContentState({
    side: box.with(() => side),
    sideOffset: box.with(() => sideOffset),
    align: box.with(() => align),
    alignOffset: box.with(() => alignOffset),
    id: box.with(() => id),
    arrowPadding: box.with(() => arrowPadding),
    avoidCollisions: box.with(() => avoidCollisions),
    collisionBoundary: box.with(() => collisionBoundary),
    collisionPadding: box.with(() => collisionPadding),
    hideWhenDetached: box.with(() => hideWhenDetached),
    onPlaced: box.with(() => onPlaced),
    sticky: box.with(() => sticky),
    updatePositionStrategy: box.with(() => updatePositionStrategy),
    strategy: box.with(() => strategy),
    dir: box.with(() => dir),
    style: box.with(() => style),
    enabled: box.with(() => false),
    wrapperId: box.with(() => wrapperId),
    customAnchor: box.with(() => customAnchor)
  });
  const mergedProps = mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } });
  $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
  content?.($$payload, { props: contentState.props });
  $$payload.out += `<!----></div>`;
  pop();
}
function Floating_layer_content_static($$payload, $$props) {
  push();
  let { content, onPlaced } = $$props;
  content?.($$payload, { props: {} });
  $$payload.out += `<!---->`;
  pop();
}
const ROOT_ATTR$3 = "data-separator-root";
class SeparatorRootState {
  #id;
  #ref;
  #orientation;
  #decorative;
  constructor(props) {
    this.#orientation = props.orientation;
    this.#decorative = props.decorative;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    id: this.#id.current,
    role: this.#decorative.current ? "none" : "separator",
    "aria-orientation": getAriaOrientation(this.#orientation.current),
    "aria-hidden": getAriaHidden(this.#decorative.current),
    "data-orientation": getDataOrientation(this.#orientation.current),
    [ROOT_ATTR$3]: ""
  }));
  get props() {
    return this.#props();
  }
}
function useSeparatorRoot(props) {
  return new SeparatorRootState(props);
}
function Separator$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    decorative = false,
    orientation = "horizontal",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useSeparatorRoot({
    ref: box.with(() => ref, (v) => ref = v),
    id: box.with(() => id),
    decorative: box.with(() => decorative),
    orientation: box.with(() => orientation)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Popper_content($$payload, $$props) {
  let {
    content,
    isStatic = false,
    onPlaced,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (isStatic) {
    $$payload.out += "<!--[-->";
    Floating_layer_content_static($$payload, { content, onPlaced });
  } else {
    $$payload.out += "<!--[!-->";
    Floating_layer_content($$payload, spread_props([{ content, onPlaced }, restProps]));
  }
  $$payload.out += `<!--]-->`;
}
function Popper_layer_inner($$payload, $$props) {
  push();
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let content = function($$payload2, { props: floatingProps }) {
      if (restProps.forceMount && enabled) {
        $$payload2.out += "<!--[-->";
        Scroll_lock($$payload2, { preventScroll });
      } else {
        $$payload2.out += "<!--[!-->";
        if (!restProps.forceMount) {
          $$payload2.out += "<!--[-->";
          Scroll_lock($$payload2, { preventScroll });
        } else {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]-->`;
      }
      $$payload2.out += `<!--]--> `;
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, {
            onEscapeKeydown,
            escapeKeydownBehavior,
            enabled,
            children: ($$payload4) => {
              {
                let children = function($$payload5, { props: dismissibleProps }) {
                  Text_selection_layer($$payload5, {
                    id,
                    preventOverflowTextSelection,
                    onPointerDown,
                    onPointerUp,
                    enabled,
                    children: ($$payload6) => {
                      popper?.($$payload6, {
                        props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: "auto" } })
                      });
                      $$payload6.out += `<!---->`;
                    },
                    $$slots: { default: true }
                  });
                };
                Dismissible_layer($$payload4, {
                  id,
                  onInteractOutside,
                  onFocusOutside,
                  interactOutsideBehavior,
                  isValidEvent: isValidEvent2,
                  enabled,
                  children,
                  $$slots: { default: true }
                });
              }
            },
            $$slots: { default: true }
          });
        };
        Focus_scope($$payload2, {
          id,
          onOpenAutoFocus,
          onCloseAutoFocus,
          loop,
          trapFocus: enabled && trapFocus,
          forceMount: restProps.forceMount,
          focusScope,
          $$slots: { focusScope: true }
        });
      }
      $$payload2.out += `<!---->`;
    };
    Popper_content($$payload, {
      isStatic,
      id,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      content,
      $$slots: { content: true }
    });
  }
  pop();
}
function Popper_layer($$payload, $$props) {
  let {
    popper,
    present,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let presence = function($$payload2, { present: present2 }) {
      Popper_layer_inner($$payload2, spread_props([
        {
          popper,
          onEscapeKeydown,
          escapeKeydownBehavior,
          preventOverflowTextSelection,
          id,
          onPointerDown,
          onPointerUp,
          side,
          sideOffset,
          align,
          alignOffset,
          arrowPadding,
          avoidCollisions,
          collisionBoundary,
          collisionPadding,
          sticky,
          hideWhenDetached,
          updatePositionStrategy,
          strategy,
          dir,
          preventScroll,
          wrapperId,
          style,
          onPlaced,
          customAnchor,
          isStatic,
          enabled: present2.current,
          onInteractOutside,
          onCloseAutoFocus,
          onOpenAutoFocus,
          interactOutsideBehavior,
          loop,
          trapFocus,
          isValidEvent: isValidEvent2,
          onFocusOutside,
          forceMount: false
        },
        restProps
      ]));
    };
    Presence_layer($$payload, spread_props([
      { id, present },
      restProps,
      { presence, $$slots: { presence: true } }
    ]));
  }
}
function Popper_layer_force_mount($$payload, $$props) {
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  Popper_layer_inner($$payload, spread_props([
    {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      isStatic,
      enabled,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      interactOutsideBehavior,
      loop,
      trapFocus,
      isValidEvent: isValidEvent2,
      onFocusOutside
    },
    restProps,
    { forceMount: true }
  ]));
}
function Select_content$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    forceMount = false,
    side = "bottom",
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    children,
    child,
    preventScroll = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useSelectContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  function handleInteractOutside(e) {
    contentState.handleInteractOutside(e);
    if (e.defaultPrevented) return;
    onInteractOutside(e);
    if (e.defaultPrevented) return;
    contentState.root.handleClose();
  }
  function handleEscapeKeydown(e) {
    onEscapeKeydown(e);
    if (e.defaultPrevented) return;
    contentState.root.handleClose();
  }
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...finalProps })}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        {
          side,
          enabled: contentState.root.open.current,
          id,
          onInteractOutside: handleInteractOutside,
          onEscapeKeydown: handleEscapeKeydown,
          onOpenAutoFocus: (e) => e.preventDefault(),
          onCloseAutoFocus: (e) => e.preventDefault(),
          trapFocus: false,
          loop: false,
          preventScroll,
          onPlaced: () => contentState.isPositioned = true,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
    if (!forceMount) {
      $$payload.out += "<!--[-->";
      {
        let popper = function($$payload2, { props }) {
          const finalProps = mergeProps(props, { style: contentState.props.style });
          if (child) {
            $$payload2.out += "<!--[-->";
            child($$payload2, {
              props: finalProps,
              ...contentState.snippetProps
            });
            $$payload2.out += `<!---->`;
          } else {
            $$payload2.out += "<!--[!-->";
            $$payload2.out += `<div${spread_attributes({ ...finalProps })}>`;
            children?.($$payload2);
            $$payload2.out += `<!----></div>`;
          }
          $$payload2.out += `<!--]-->`;
        };
        Popper_layer($$payload, spread_props([
          mergedProps,
          {
            side,
            present: contentState.root.open.current,
            id,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            onOpenAutoFocus: (e) => e.preventDefault(),
            onCloseAutoFocus: (e) => e.preventDefault(),
            trapFocus: false,
            loop: false,
            preventScroll,
            onPlaced: () => contentState.isPositioned = true,
            forceMount: false,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Mounted($$payload, $$props) {
  push();
  let { isMounted = false, onMountedChange = noop } = $$props;
  bind_props($$props, { isMounted });
  pop();
}
function Select_item$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    value,
    label = value,
    disabled = false,
    children,
    child,
    onHighlight = noop,
    onUnhighlight = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = useSelectItem({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    label: box.with(() => label),
    onHighlight: box.with(() => onHighlight),
    onUnhighlight: box.with(() => onUnhighlight)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps, ...itemState.snippetProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload, itemState.snippetProps);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--> `;
  Mounted($$payload, {
    onMountedChange: (m) => {
      itemState.mounted = m;
    }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
function Select_viewport($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = useSelectViewport({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, { "svelte-uf90i5": true })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_down_button$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let mounted = false;
  const scrollDownButtonState = useSelectScrollDownButton({
    id: box.with(() => id),
    mounted: box.with(() => mounted),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, scrollDownButtonState.props);
  if (scrollDownButtonState.canScrollDown) {
    $$payload.out += "<!--[-->";
    Mounted($$payload, { onMountedChange: (m) => mounted = m });
    $$payload.out += `<!----> `;
    if (child) {
      $$payload.out += "<!--[-->";
      child($$payload, { props: restProps });
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
      children?.($$payload);
      $$payload.out += `<!----></div>`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_up_button$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let mounted = false;
  const scrollDownButtonState = useSelectScrollUpButton({
    id: box.with(() => id),
    mounted: box.with(() => mounted),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, scrollDownButtonState.props);
  if (scrollDownButtonState.canScrollUp) {
    $$payload.out += "<!--[-->";
    Mounted($$payload, { onMountedChange: (m) => mounted = m });
    $$payload.out += `<!----> `;
    if (child) {
      $$payload.out += "<!--[-->";
      child($$payload, { props: restProps });
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
      children?.($$payload);
      $$payload.out += `<!----></div>`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    controlledOpen = false,
    children
  } = $$props;
  useDialogRoot({
    variant: box.with(() => "dialog"),
    open: box.with(() => open, (v) => {
      if (controlledOpen) {
        onOpenChange(v);
      } else {
        open = v;
        onOpenChange(v);
      }
    })
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { open });
  pop();
}
function Dialog_close($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const closeState = useDialogClose({
    variant: box.with(() => "close"),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, closeState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_content$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    ref = null,
    forceMount = false,
    onCloseAutoFocus = noop,
    onEscapeKeydown = noop,
    onInteractOutside = noop,
    trapFocus = true,
    preventScroll = true,
    restoreScrollDelay = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useDialogContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  {
    let presence = function($$payload2, { present }) {
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, spread_props([
            mergedProps,
            {
              enabled: present.current,
              onEscapeKeydown: (e) => {
                onEscapeKeydown(e);
                if (e.defaultPrevented) return;
                contentState.root.handleClose();
              },
              children: ($$payload4) => {
                Dismissible_layer($$payload4, spread_props([
                  mergedProps,
                  {
                    enabled: present.current,
                    onInteractOutside: (e) => {
                      onInteractOutside(e);
                      if (e.defaultPrevented) return;
                      contentState.root.handleClose();
                    },
                    children: ($$payload5) => {
                      Text_selection_layer($$payload5, spread_props([
                        mergedProps,
                        {
                          enabled: present.current,
                          children: ($$payload6) => {
                            if (child) {
                              $$payload6.out += "<!--[-->";
                              if (contentState.root.open.current) {
                                $$payload6.out += "<!--[-->";
                                Scroll_lock($$payload6, { preventScroll, restoreScrollDelay });
                              } else {
                                $$payload6.out += "<!--[!-->";
                              }
                              $$payload6.out += `<!--]--> `;
                              child($$payload6, {
                                props: mergeProps(mergedProps, focusScopeProps),
                                ...contentState.snippetProps
                              });
                              $$payload6.out += `<!---->`;
                            } else {
                              $$payload6.out += "<!--[!-->";
                              Scroll_lock($$payload6, { preventScroll });
                              $$payload6.out += `<!----> <div${spread_attributes({
                                ...mergeProps(mergedProps, focusScopeProps)
                              })}>`;
                              children?.($$payload6);
                              $$payload6.out += `<!----></div>`;
                            }
                            $$payload6.out += `<!--]-->`;
                          },
                          $$slots: { default: true }
                        }
                      ]));
                    },
                    $$slots: { default: true }
                  }
                ]));
              },
              $$slots: { default: true }
            }
          ]));
        };
        Focus_scope($$payload2, spread_props([
          {
            loop: true,
            trapFocus: shouldTrapFocus({
              forceMount,
              present: present.current,
              trapFocus,
              open: contentState.root.open.current
            })
          },
          mergedProps,
          {
            onCloseAutoFocus: (e) => {
              onCloseAutoFocus(e);
              if (e.defaultPrevented) return;
              contentState.root.triggerNode?.focus();
            },
            focusScope,
            $$slots: { focusScope: true }
          }
        ]));
      }
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        forceMount,
        present: contentState.root.open.current || forceMount,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  bind_props($$props, { ref });
  pop();
}
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function useResizeObserver(node, onResize) {
}
const SCROLL_AREA_ROOT_ATTR = "data-scroll-area-root";
const SCROLL_AREA_VIEWPORT_ATTR = "data-scroll-area-viewport";
const SCROLL_AREA_CORNER_ATTR = "data-scroll-area-corner";
const SCROLL_AREA_THUMB_ATTR = "data-scroll-area-thumb";
const SCROLL_AREA_SCROLLBAR_ATTR = "data-scroll-area-scrollbar";
class ScrollAreaRootState {
  #id;
  #ref;
  dir;
  type;
  scrollHideDelay;
  scrollAreaNode = null;
  viewportNode = null;
  contentNode = null;
  scrollbarXNode = null;
  scrollbarYNode = null;
  cornerWidth = 0;
  cornerHeight = 0;
  scrollbarXEnabled = false;
  scrollbarYEnabled = false;
  constructor(props) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.dir = props.dir;
    this.type = props.type;
    this.scrollHideDelay = props.scrollHideDelay;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.scrollAreaNode = node;
      }
    });
  }
  #props = once(() => ({
    id: this.#id.current,
    dir: this.dir.current,
    style: {
      position: "relative",
      "--bits-scroll-area-corner-height": `${this.cornerHeight}px`,
      "--bits-scroll-area-corner-width": `${this.cornerWidth}px`
    },
    [SCROLL_AREA_ROOT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaViewportState {
  #id;
  #ref;
  #contentId = box(useId());
  #contentRef = box(null);
  root;
  constructor(props, root) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.root = root;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.root.viewportNode = node;
      }
    });
    useRefById({
      id: this.#contentId,
      ref: this.#contentRef,
      onRefChange: (node) => {
        this.root.contentNode = node;
      }
    });
  }
  #props = once(() => ({
    id: this.#id.current,
    style: {
      overflowX: this.root.scrollbarXEnabled ? "scroll" : "hidden",
      overflowY: this.root.scrollbarYEnabled ? "scroll" : "hidden"
    },
    [SCROLL_AREA_VIEWPORT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
  #contentProps = once(() => ({
    id: this.#contentId.current,
    "data-scroll-area-content": "",
    /**
     * When horizontal scrollbar is visible: this element should be at least
     * as wide as its children for size calculations to work correctly.
     *
     * When horizontal scrollbar is NOT visible: this element's width should
     * be constrained by the parent container to enable `text-overflow: ellipsis`
     */
    style: {
      minWidth: this.root.scrollbarXEnabled ? "fit-content" : void 0
    }
  }));
  get contentProps() {
    return this.#contentProps();
  }
}
class ScrollAreaScrollbarState {
  ref;
  id;
  root;
  orientation;
  #isHorizontal = once(() => this.orientation.current === "horizontal");
  get isHorizontal() {
    return this.#isHorizontal();
  }
  hasThumb = false;
  constructor(props, root) {
    this.root = root;
    this.orientation = props.orientation;
    this.ref = props.ref;
    this.id = props.id;
  }
}
class ScrollAreaScrollbarHoverState {
  root;
  isVisible = false;
  scrollbar;
  constructor(scrollbar) {
    this.root = scrollbar.root;
    this.scrollbar = scrollbar;
  }
  #props = once(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarScrollState {
  orientation;
  root;
  scrollbar;
  machine = useStateMachine("hidden", {
    hidden: { SCROLL: "scrolling" },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: { SCROLL: "interacting", POINTER_LEAVE: "idle" },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  #isHidden = once(() => this.machine.state.current === "hidden");
  get isHidden() {
    return this.#isHidden();
  }
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    this.orientation = this.scrollbar.orientation;
    useDebounce(() => this.machine.dispatch("SCROLL_END"), 100);
  }
  #onpointerenter = () => {
    this.machine.dispatch("POINTER_ENTER");
  };
  #onpointerleave = () => {
    this.machine.dispatch("POINTER_LEAVE");
  };
  #props = once(() => ({
    "data-state": this.machine.state.current === "hidden" ? "hidden" : "visible",
    onpointerenter: this.#onpointerenter,
    onpointerleave: this.#onpointerleave
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarAutoState {
  scrollbar;
  root;
  isVisible = false;
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    useDebounce(
      () => {
        const viewportNode = this.root.viewportNode;
        if (!viewportNode) return;
        const isOverflowX = viewportNode.offsetWidth < viewportNode.scrollWidth;
        const isOverflowY = viewportNode.offsetHeight < viewportNode.scrollHeight;
        this.isVisible = this.scrollbar.isHorizontal ? isOverflowX : isOverflowY;
      },
      10
    );
  }
  #props = once(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarVisibleState {
  scrollbar;
  root;
  thumbNode = null;
  pointerOffset = 0;
  sizes = {
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  };
  #thumbRatio = once(() => getThumbRatio(this.sizes.viewport, this.sizes.content));
  get thumbRatio() {
    return this.#thumbRatio();
  }
  #hasThumb = once(() => Boolean(this.thumbRatio > 0 && this.thumbRatio < 1));
  get hasThumb() {
    return this.#hasThumb();
  }
  prevTransformStyle = "";
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
  }
  setSizes = (sizes) => {
    this.sizes = sizes;
  };
  getScrollPosition = (pointerPos, dir) => {
    return getScrollPositionFromPointer({
      pointerPos,
      pointerOffset: this.pointerOffset,
      sizes: this.sizes,
      dir
    });
  };
  onThumbPointerUp = () => {
    this.pointerOffset = 0;
  };
  onThumbPointerDown = (pointerPos) => {
    this.pointerOffset = pointerPos;
  };
  xOnThumbPositionChange = () => {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollLeft;
    const offset = getThumbOffsetFromScroll({
      scrollPos,
      sizes: this.sizes,
      dir: this.root.dir.current
    });
    const transformStyle = `translate3d(${offset}px, 0, 0)`;
    this.thumbNode.style.transform = transformStyle;
  };
  xOnWheelScroll = (scrollPos) => {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = scrollPos;
  };
  xOnDragScroll = (pointerPos) => {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = this.getScrollPosition(pointerPos, this.root.dir.current);
  };
  yOnThumbPositionChange = () => {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollTop;
    const offset = getThumbOffsetFromScroll({ scrollPos, sizes: this.sizes });
    const transformStyle = `translate3d(0, ${offset}px, 0)`;
    this.thumbNode.style.transform = transformStyle;
  };
  yOnWheelScroll = (scrollPos) => {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = scrollPos;
  };
  yOnDragScroll = (pointerPos) => {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = this.getScrollPosition(pointerPos, this.root.dir.current);
  };
}
class ScrollAreaScrollbarXState {
  #id;
  #mounted;
  ref;
  scrollbarVis;
  root;
  computedStyle;
  constructor(props, scrollbarVis) {
    this.#mounted = props.mounted;
    this.scrollbarVis = scrollbarVis;
    this.#id = this.scrollbarVis.scrollbar.id;
    this.ref = this.scrollbarVis.scrollbar.ref;
    this.root = scrollbarVis.root;
    useRefById({
      id: this.#id,
      ref: this.ref,
      onRefChange: (node) => {
        this.root.scrollbarXNode = node;
      },
      deps: () => this.#mounted.current
    });
  }
  onThumbPointerDown = (pointerPos) => {
    this.scrollbarVis.onThumbPointerDown(pointerPos.x);
  };
  onDragScroll = (pointerPos) => {
    this.scrollbarVis.xOnDragScroll(pointerPos.x);
  };
  onThumbPointerUp = () => {
    this.scrollbarVis.onThumbPointerUp();
  };
  onThumbPositionChange = () => {
    this.scrollbarVis.xOnThumbPositionChange();
  };
  onWheelScroll = (e, maxScrollPos) => {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollLeft + e.deltaX;
    this.scrollbarVis.xOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  };
  onResize = () => {
    if (!(this.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollWidth,
      viewport: this.root.viewportNode.offsetWidth,
      scrollbar: {
        size: this.ref.current.clientWidth,
        paddingStart: toInt(this.computedStyle.paddingLeft),
        paddingEnd: toInt(this.computedStyle.paddingRight)
      }
    });
  };
  #thumbSize = once(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  #props = once(() => ({
    id: this.#id.current,
    "data-orientation": "horizontal",
    style: {
      bottom: 0,
      left: this.root.dir.current === "rtl" ? "var(--bits-scroll-area-corner-width)" : 0,
      right: this.root.dir.current === "ltr" ? "var(--bits-scroll-area-corner-width)" : 0,
      "--bits-scroll-area-thumb-width": `${this.thumbSize}px`
    }
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarYState {
  #id;
  #mounted;
  ref;
  scrollbarVis;
  root;
  computedStyle;
  constructor(props, scrollbarVis) {
    this.#mounted = props.mounted;
    this.scrollbarVis = scrollbarVis;
    this.#id = this.scrollbarVis.scrollbar.id;
    this.ref = this.scrollbarVis.scrollbar.ref;
    this.root = scrollbarVis.root;
    useRefById({
      id: this.scrollbarVis.scrollbar.id,
      ref: this.scrollbarVis.scrollbar.ref,
      onRefChange: (node) => {
        this.root.scrollbarYNode = node;
      },
      deps: () => this.#mounted.current
    });
  }
  onThumbPointerDown = (pointerPos) => {
    this.scrollbarVis.onThumbPointerDown(pointerPos.y);
  };
  onDragScroll = (pointerPos) => {
    this.scrollbarVis.yOnDragScroll(pointerPos.y);
  };
  onThumbPointerUp = () => {
    this.scrollbarVis.onThumbPointerUp();
  };
  onThumbPositionChange = () => {
    this.scrollbarVis.yOnThumbPositionChange();
  };
  onWheelScroll = (e, maxScrollPos) => {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollTop + e.deltaY;
    this.scrollbarVis.yOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  };
  onResize = () => {
    if (!(this.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollHeight,
      viewport: this.root.viewportNode.offsetHeight,
      scrollbar: {
        size: this.ref.current.clientHeight,
        paddingStart: toInt(this.computedStyle.paddingTop),
        paddingEnd: toInt(this.computedStyle.paddingBottom)
      }
    });
  };
  #thumbSize = once(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  #props = once(() => ({
    id: this.#id.current,
    "data-orientation": "vertical",
    style: {
      top: 0,
      right: this.root.dir.current === "ltr" ? 0 : void 0,
      left: this.root.dir.current === "rtl" ? 0 : void 0,
      bottom: "var(--bits-scroll-area-corner-height)",
      "--bits-scroll-area-thumb-height": `${this.thumbSize}px`
    }
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarSharedState {
  scrollbarState;
  root;
  scrollbarVis;
  rect = null;
  prevWebkitUserSelect = "";
  handleResize;
  handleThumbPositionChange;
  handleWheelScroll;
  handleThumbPointerDown;
  handleThumbPointerUp;
  #maxScrollPos = once(() => this.scrollbarVis.sizes.content - this.scrollbarVis.sizes.viewport);
  get maxScrollPos() {
    return this.#maxScrollPos();
  }
  constructor(scrollbarState) {
    this.scrollbarState = scrollbarState;
    this.root = scrollbarState.root;
    this.scrollbarVis = scrollbarState.scrollbarVis;
    this.handleResize = useDebounce(() => this.scrollbarState.onResize(), 10);
    this.handleThumbPositionChange = this.scrollbarState.onThumbPositionChange;
    this.handleWheelScroll = this.scrollbarState.onWheelScroll;
    this.handleThumbPointerDown = this.scrollbarState.onThumbPointerDown;
    this.handleThumbPointerUp = this.scrollbarState.onThumbPointerUp;
    useResizeObserver(() => this.scrollbarState.ref.current, this.handleResize);
    useResizeObserver(() => this.root.contentNode, this.handleResize);
  }
  handleDragScroll = (e) => {
    if (!this.rect) return;
    const x = e.clientX - this.rect.left;
    const y = e.clientY - this.rect.top;
    this.scrollbarState.onDragScroll({ x, y });
  };
  #onpointerdown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    target.setPointerCapture(e.pointerId);
    this.rect = this.scrollbarState.ref.current?.getBoundingClientRect() ?? null;
    this.prevWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.webkitUserSelect = "none";
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "auto";
    this.handleDragScroll(e);
  };
  #onpointermove = (e) => {
    this.handleDragScroll(e);
  };
  #onpointerup = (e) => {
    const target = e.target;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    document.body.style.webkitUserSelect = this.prevWebkitUserSelect;
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "";
    this.rect = null;
  };
  #props = once(() => mergeProps({
    ...this.scrollbarState.props,
    style: {
      position: "absolute",
      ...this.scrollbarState.props.style
    },
    [SCROLL_AREA_SCROLLBAR_ATTR]: "",
    onpointerdown: this.#onpointerdown,
    onpointermove: this.#onpointermove,
    onpointerup: this.#onpointerup
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaThumbImplState {
  #id;
  #ref;
  #root;
  #scrollbarState;
  #removeUnlinkedScrollListener;
  #debounceScrollEnd = useDebounce(
    () => {
      if (this.#removeUnlinkedScrollListener) {
        this.#removeUnlinkedScrollListener();
        this.#removeUnlinkedScrollListener = void 0;
      }
    },
    100
  );
  #mounted;
  constructor(props, scrollbarState) {
    this.#root = scrollbarState.root;
    this.#scrollbarState = scrollbarState;
    this.#mounted = props.mounted;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.#scrollbarState.scrollbarVis.thumbNode = node;
      },
      deps: () => this.#mounted.current
    });
  }
  #onpointerdowncapture = (e) => {
    const thumb = e.target;
    if (!thumb) return;
    const thumbRect = thumb.getBoundingClientRect();
    const x = e.clientX - thumbRect.left;
    const y = e.clientY - thumbRect.top;
    this.#scrollbarState.handleThumbPointerDown({ x, y });
  };
  #onpointerup = () => {
    this.#scrollbarState.handleThumbPointerUp();
  };
  #props = once(() => ({
    id: this.#id.current,
    "data-state": this.#scrollbarState.scrollbarVis.hasThumb ? "visible" : "hidden",
    style: {
      width: "var(--bits-scroll-area-thumb-width)",
      height: "var(--bits-scroll-area-thumb-height)",
      transform: this.#scrollbarState.scrollbarVis.prevTransformStyle
    },
    onpointerdowncapture: this.#onpointerdowncapture,
    onpointerup: this.#onpointerup,
    [SCROLL_AREA_THUMB_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaCornerImplState {
  #id;
  #ref;
  #root;
  #width = 0;
  #height = 0;
  #hasSize = once(() => Boolean(this.#width && this.#height));
  get hasSize() {
    return this.#hasSize();
  }
  constructor(props, root) {
    this.#root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    id: this.#id.current,
    style: {
      width: this.#width,
      height: this.#height,
      position: "absolute",
      right: this.#root.dir.current === "ltr" ? 0 : void 0,
      left: this.#root.dir.current === "rtl" ? 0 : void 0,
      bottom: 0
    },
    [SCROLL_AREA_CORNER_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
const [
  setScrollAreaRootContext,
  getScrollAreaRootContext
] = createContext("ScrollArea.Root");
const [
  setScrollAreaScrollbarContext,
  getScrollAreaScrollbarContext
] = createContext("ScrollArea.Scrollbar");
const [
  setScrollAreaScrollbarVisibleContext,
  getScrollAreaScrollbarVisibleContext
] = createContext("ScrollArea.ScrollbarVisible");
const [
  setScrollAreaScrollbarAxisContext,
  getScrollAreaScrollbarAxisContext
] = createContext("ScrollArea.ScrollbarAxis");
const [
  setScrollAreaScrollbarSharedContext,
  getScrollAreaScrollbarSharedContext
] = createContext("ScrollArea.ScrollbarShared");
function useScrollAreaRoot(props) {
  return setScrollAreaRootContext(new ScrollAreaRootState(props));
}
function useScrollAreaViewport(props) {
  return new ScrollAreaViewportState(props, getScrollAreaRootContext());
}
function useScrollAreaScrollbar(props) {
  return setScrollAreaScrollbarContext(new ScrollAreaScrollbarState(props, getScrollAreaRootContext()));
}
function useScrollAreaScrollbarVisible() {
  return setScrollAreaScrollbarVisibleContext(new ScrollAreaScrollbarVisibleState(getScrollAreaScrollbarContext()));
}
function useScrollAreaScrollbarAuto() {
  return new ScrollAreaScrollbarAutoState(getScrollAreaScrollbarContext());
}
function useScrollAreaScrollbarScroll() {
  return new ScrollAreaScrollbarScrollState(getScrollAreaScrollbarContext());
}
function useScrollAreaScrollbarHover() {
  return new ScrollAreaScrollbarHoverState(getScrollAreaScrollbarContext());
}
function useScrollAreaScrollbarX(props) {
  return setScrollAreaScrollbarAxisContext(new ScrollAreaScrollbarXState(props, getScrollAreaScrollbarVisibleContext()));
}
function useScrollAreaScrollbarY(props) {
  return setScrollAreaScrollbarAxisContext(new ScrollAreaScrollbarYState(props, getScrollAreaScrollbarVisibleContext()));
}
function useScrollAreaScrollbarShared() {
  return setScrollAreaScrollbarSharedContext(new ScrollAreaScrollbarSharedState(getScrollAreaScrollbarAxisContext()));
}
function useScrollAreaThumb(props) {
  return new ScrollAreaThumbImplState(props, getScrollAreaScrollbarSharedContext());
}
function useScrollAreaCorner(props) {
  return new ScrollAreaCornerImplState(props, getScrollAreaRootContext());
}
function toInt(value) {
  return value ? Number.parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return Number.isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer({
  pointerPos,
  pointerOffset,
  sizes,
  dir = "ltr"
}) {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll({ scrollPos, sizes, dir = "ltr" }) {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange[0], scrollClampRange[1]);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
function Scroll_area$1($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    type = "hover",
    dir = "ltr",
    scrollHideDelay = 600,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useScrollAreaRoot({
    type: box.with(() => type),
    dir: box.with(() => dir),
    scrollHideDelay: box.with(() => scrollHideDelay),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_viewport($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = useScrollAreaViewport({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  const mergedContentProps = mergeProps({}, viewportState.contentProps);
  $$payload.out += `<div${spread_attributes({ ...mergedProps }, { "svelte-w8xgs5": true })}><div${spread_attributes({ ...mergedContentProps }, { "svelte-w8xgs5": true })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div></div>`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_scrollbar_shared($$payload, $$props) {
  push();
  let {
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarSharedState = useScrollAreaScrollbarShared();
  const mergedProps = mergeProps(restProps, scrollbarSharedState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_x($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarXState = useScrollAreaScrollbarX({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarXState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_y($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarYState = useScrollAreaScrollbarY({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarYState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_visible($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const scrollbarVisibleState = useScrollAreaScrollbarVisible();
  if (scrollbarVisibleState.scrollbar.orientation.current === "horizontal") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_x($$payload, spread_props([restProps]));
  } else {
    $$payload.out += "<!--[!-->";
    Scroll_area_scrollbar_y($$payload, spread_props([restProps]));
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_auto($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarAutoState = useScrollAreaScrollbarAuto();
  const mergedProps = mergeProps(restProps, scrollbarAutoState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      {
        present: forceMount || scrollbarAutoState.isVisible
      },
      mergedProps,
      { presence, $$slots: { presence: true } }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar_scroll($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarScrollState = useScrollAreaScrollbarScroll();
  const mergedProps = mergeProps(restProps, scrollbarScrollState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        present: forceMount || !scrollbarScrollState.isHidden,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar_hover($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarHoverState = useScrollAreaScrollbarHover();
  const scrollbarAutoState = useScrollAreaScrollbarAuto();
  const mergedProps = mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, {
    "data-state": scrollbarHoverState.isVisible ? "visible" : "hidden"
  });
  const present = forceMount || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible;
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        present,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar$1($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    orientation,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = useScrollAreaScrollbar({
    orientation: box.with(() => orientation),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const type = scrollbarState.root.type.current;
  if (type === "hover") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_hover($$payload, spread_props([restProps, { id }]));
  } else {
    $$payload.out += "<!--[!-->";
    if (type === "scroll") {
      $$payload.out += "<!--[-->";
      Scroll_area_scrollbar_scroll($$payload, spread_props([restProps, { id }]));
    } else {
      $$payload.out += "<!--[!-->";
      if (type === "auto") {
        $$payload.out += "<!--[-->";
        Scroll_area_scrollbar_auto($$payload, spread_props([restProps, { id }]));
      } else {
        $$payload.out += "<!--[!-->";
        if (type === "always") {
          $$payload.out += "<!--[-->";
          Scroll_area_scrollbar_visible($$payload, spread_props([restProps, { id }]));
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    child,
    children,
    present,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const isMounted = new IsMounted();
  const thumbState = useScrollAreaThumb({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    mounted: box.with(() => isMounted.current)
  });
  const mergedProps = mergeProps(restProps, thumbState.props, { style: { hidden: !present } });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = getScrollAreaScrollbarVisibleContext();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let presence = function($$payload3, { present }) {
        Scroll_area_thumb_impl($$payload3, spread_props([
          restProps,
          {
            id,
            present: present.current,
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
      };
      Presence_layer($$payload2, spread_props([
        { present: forceMount || scrollbarState.hasThumb },
        restProps,
        { id, presence, $$slots: { presence: true } }
      ]));
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cornerState = useScrollAreaCorner({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, cornerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollAreaState = getScrollAreaRootContext();
  const hasBothScrollbarsVisible = Boolean(scrollAreaState.scrollbarXNode && scrollAreaState.scrollbarYNode);
  const hasCorner = scrollAreaState.type.current !== "scroll" && hasBothScrollbarsVisible;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hasCorner) {
      $$payload2.out += "<!--[-->";
      Scroll_area_corner_impl($$payload2, spread_props([
        restProps,
        {
          id,
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select($$payload, $$props) {
  push();
  let {
    value = void 0,
    onValueChange = noop,
    name = "",
    disabled = false,
    type,
    open = false,
    onOpenChange = noop,
    loop = false,
    scrollAlignment = "nearest",
    required = false,
    controlledOpen = false,
    controlledValue = false,
    items = [],
    allowDeselect = true,
    children
  } = $$props;
  if (value === void 0) {
    const defaultValue = type === "single" ? "" : [];
    if (controlledValue) {
      onValueChange(defaultValue);
    } else {
      value = defaultValue;
    }
  }
  const rootState = useSelectRoot({
    type,
    value: box.with(() => value, (v) => {
      if (controlledValue) {
        onValueChange(v);
      } else {
        value = v;
        onValueChange(v);
      }
    }),
    disabled: box.with(() => disabled),
    required: box.with(() => required),
    open: box.with(() => open, (v) => {
      if (controlledOpen) {
        onOpenChange(v);
      } else {
        open = v;
        onOpenChange(v);
      }
    }),
    loop: box.with(() => loop),
    scrollAlignment: box.with(() => scrollAlignment),
    name: box.with(() => name),
    isCombobox: false,
    items: box.with(() => items),
    allowDeselect: box.with(() => allowDeselect)
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer($$payload2, {
      children: ($$payload3) => {
        children?.($$payload3);
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> `;
    if (Array.isArray(rootState.value.current)) {
      $$payload2.out += "<!--[-->";
      if (rootState.value.current.length) {
        $$payload2.out += "<!--[-->";
        const each_array = ensure_array_like(rootState.value.current);
        $$payload2.out += `<!--[-->`;
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          Select_hidden_input($$payload2, { value: item });
        }
        $$payload2.out += `<!--]-->`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
      Select_hidden_input($$payload2, {
        get value() {
          return rootState.value.current;
        },
        set value($$value) {
          rootState.value.current = $$value;
          $$settled = false;
        }
      });
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value, open });
  pop();
}
function Select_trigger$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useSelectTrigger({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  $$payload.out += `<!---->`;
  Floating_layer_anchor($$payload, {
    id,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps })}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
const ROOT_ATTR$2 = "data-switch-root";
const THUMB_ATTR = "data-switch-thumb";
class SwitchRootState {
  #id;
  #ref;
  checked;
  disabled;
  required;
  name;
  value;
  constructor(props) {
    this.checked = props.checked;
    this.disabled = props.disabled;
    this.required = props.required;
    this.name = props.name;
    this.value = props.value;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #toggle = () => {
    this.checked.current = !this.checked.current;
  };
  #onkeydown = (e) => {
    if (!(e.key === ENTER || e.key === SPACE) || this.disabled.current) return;
    e.preventDefault();
    this.#toggle();
  };
  #onclick = (e) => {
    if (this.disabled.current) return;
    this.#toggle();
  };
  #sharedProps = once(() => ({
    "data-disabled": getDataDisabled(this.disabled.current),
    "data-state": getDataChecked(this.checked.current),
    "data-required": getDataRequired(this.required.current)
  }));
  get sharedProps() {
    return this.#sharedProps();
  }
  #props = once(() => ({
    ...this.sharedProps,
    id: this.#id.current,
    role: "switch",
    disabled: getDisabled(this.disabled.current),
    "aria-checked": getAriaChecked(this.checked.current),
    "aria-required": getAriaRequired(this.required.current),
    [ROOT_ATTR$2]: "",
    //
    onclick: this.#onclick,
    onkeydown: this.#onkeydown
  }));
  get props() {
    return this.#props();
  }
}
class SwitchInputState {
  #root;
  #shouldRender = once(() => this.#root.name.current !== void 0);
  get shouldRender() {
    return this.#shouldRender();
  }
  constructor(root) {
    this.#root = root;
  }
  #props = once(() => ({
    type: "checkbox",
    name: this.#root.name.current,
    value: this.#root.value.current,
    checked: this.#root.checked.current,
    disabled: this.#root.disabled.current,
    required: this.#root.required.current,
    "aria-hidden": getAriaHidden(true),
    style: styleToString(srOnlyStyles)
  }));
  get props() {
    return this.#props();
  }
}
class SwitchThumbState {
  #id;
  #ref;
  root;
  constructor(props, root) {
    this.root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    ...this.root.sharedProps,
    id: this.#id.current,
    [THUMB_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
const [setSwitchRootContext, getSwitchRootContext] = createContext("Switch.Root");
function useSwitchRoot(props) {
  return setSwitchRootContext(new SwitchRootState(props));
}
function useSwitchInput() {
  return new SwitchInputState(getSwitchRootContext());
}
function useSwitchThumb(props) {
  return new SwitchThumbState(props, getSwitchRootContext());
}
function Switch_input($$payload, $$props) {
  push();
  const inputState = useSwitchInput();
  if (inputState.shouldRender) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<input${spread_attributes({ ...inputState.props })}>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Switch$1($$payload, $$props) {
  push();
  let {
    child,
    children,
    ref = null,
    id = useId(),
    disabled = false,
    required = false,
    checked = false,
    value = "on",
    name = void 0,
    type = "button",
    onCheckedChange = noop,
    controlledChecked = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useSwitchRoot({
    checked: box.with(() => checked, (v) => {
      if (controlledChecked) {
        onCheckedChange(v);
      } else {
        checked = v;
        onCheckedChange?.(v);
      }
    }),
    disabled: box.with(() => disabled ?? false),
    required: box.with(() => required),
    value: box.with(() => value),
    name: box.with(() => name),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props, { type });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, {
      props: mergedProps,
      checked: rootState.checked.current
    });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload, { checked: rootState.checked.current });
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]--> `;
  Switch_input($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { ref, checked });
  pop();
}
function Switch_thumb($$payload, $$props) {
  push();
  let {
    child,
    children,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const thumbState = useSwitchThumb({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, thumbState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, {
      props: mergedProps,
      checked: thumbState.root.checked.current
    });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<span${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload, { checked: thumbState.root.checked.current });
    $$payload.out += `<!----></span>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
const ROOT_ATTR$1 = "data-tabs-root";
const LIST_ATTR = "data-tabs-list";
const TRIGGER_ATTR = "data-tabs-trigger";
const CONTENT_ATTR = "data-tabs-content";
class TabsRootState {
  #id;
  ref;
  orientation;
  loop;
  activationMode;
  value;
  disabled;
  rovingFocusGroup;
  triggerIds = [];
  // holds the trigger ID for each value to associate it with the content
  valueToTriggerId = new SvelteMap();
  // holds the content ID for each value to associate it with the trigger
  valueToContentId = new SvelteMap();
  constructor(props) {
    this.#id = props.id;
    this.ref = props.ref;
    this.orientation = props.orientation;
    this.loop = props.loop;
    this.activationMode = props.activationMode;
    this.value = props.value;
    this.disabled = props.disabled;
    useRefById({ id: this.#id, ref: this.ref });
    this.rovingFocusGroup = useRovingFocus({
      candidateAttr: TRIGGER_ATTR,
      rootNodeId: this.#id,
      loop: this.loop,
      orientation: this.orientation
    });
  }
  registerTrigger = (id, value) => {
    this.triggerIds.push(id);
    this.valueToTriggerId.set(value, id);
    return () => {
      this.triggerIds = this.triggerIds.filter((triggerId) => triggerId !== id);
      this.valueToTriggerId.delete(value);
    };
  };
  registerContent = (id, value) => {
    this.valueToContentId.set(value, id);
    return () => {
      this.valueToContentId.delete(value);
    };
  };
  setValue = (v) => {
    this.value.current = v;
  };
  #props = once(() => ({
    id: this.#id.current,
    "data-orientation": getDataOrientation(this.orientation.current),
    [ROOT_ATTR$1]: ""
  }));
  get props() {
    return this.#props();
  }
}
class TabsListState {
  #id;
  #ref;
  #root;
  #isDisabled = once(() => this.#root.disabled.current);
  constructor(props, root) {
    this.#root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    id: this.#id.current,
    role: "tablist",
    "aria-orientation": getAriaOrientation(this.#root.orientation.current),
    "data-orientation": getDataOrientation(this.#root.orientation.current),
    [LIST_ATTR]: "",
    "data-disabled": getDataDisabled(this.#isDisabled())
  }));
  get props() {
    return this.#props();
  }
}
class TabsTriggerState {
  #root;
  #id;
  #ref;
  #disabled;
  #value;
  #isActive = once(() => this.#root.value.current === this.#value.current);
  #isDisabled = once(() => this.#disabled.current || this.#root.disabled.current);
  #tabIndex = 0;
  #ariaControls = once(() => this.#root.valueToContentId.get(this.#value.current));
  constructor(props, root) {
    this.#root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    this.#value = props.value;
    this.#disabled = props.disabled;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  activate = () => {
    if (this.#root.value.current === this.#value.current) return;
    this.#root.setValue(this.#value.current);
  };
  #onfocus = () => {
    if (this.#root.activationMode.current !== "automatic" || this.#isDisabled()) return;
    this.activate();
  };
  #onclick = (e) => {
    if (this.#isDisabled()) return;
    this.activate();
  };
  #onkeydown = (e) => {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.activate();
      return;
    }
    this.#root.rovingFocusGroup.handleKeydown(this.#ref.current, e);
  };
  #props = once(() => ({
    id: this.#id.current,
    role: "tab",
    "data-state": getTabDataState(this.#isActive()),
    "data-value": this.#value.current,
    "data-orientation": getDataOrientation(this.#root.orientation.current),
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "aria-selected": getAriaSelected(this.#isActive()),
    "aria-controls": this.#ariaControls(),
    [TRIGGER_ATTR]: "",
    disabled: getDisabled(this.#isDisabled()),
    tabindex: this.#tabIndex,
    //
    onclick: this.#onclick,
    onfocus: this.#onfocus,
    onkeydown: this.#onkeydown
  }));
  get props() {
    return this.#props();
  }
}
class TabsContentState {
  #root;
  #id;
  #ref;
  #value;
  #isActive = once(() => this.#root.value.current === this.#value.current);
  #ariaLabelledBy = once(() => this.#root.valueToTriggerId.get(this.#value.current));
  constructor(props, root) {
    this.#root = root;
    this.#value = props.value;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    id: this.#id.current,
    role: "tabpanel",
    hidden: getHidden(!this.#isActive()),
    tabindex: 0,
    "data-value": this.#value.current,
    "data-state": getTabDataState(this.#isActive()),
    "aria-labelledby": this.#ariaLabelledBy(),
    [CONTENT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
const [setTabsRootContext, getTabsRootContext] = createContext("Tabs.Root");
function useTabsRoot(props) {
  return setTabsRootContext(new TabsRootState(props));
}
function useTabsTrigger(props) {
  return new TabsTriggerState(props, getTabsRootContext());
}
function useTabsList(props) {
  return new TabsListState(props, getTabsRootContext());
}
function useTabsContent(props) {
  return new TabsContentState(props, getTabsRootContext());
}
function getTabDataState(condition) {
  return condition ? "active" : "inactive";
}
function Tabs($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    value = "",
    onValueChange = noop,
    orientation = "horizontal",
    loop = true,
    activationMode = "automatic",
    disabled = false,
    controlledValue = false,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useTabsRoot({
    id: box.with(() => id),
    value: box.with(() => value, (v) => {
      if (controlledValue) {
        onValueChange(v);
      } else {
        value = v;
        onValueChange(v);
      }
    }),
    orientation: box.with(() => orientation),
    loop: box.with(() => loop),
    activationMode: box.with(() => activationMode),
    disabled: box.with(() => disabled),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref, value });
  pop();
}
function Tabs_content$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    value,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useTabsContent({
    value: box.with(() => value),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Tabs_list$1($$payload, $$props) {
  push();
  let {
    child,
    children,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const listState = useTabsList({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, listState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Tabs_trigger$1($$payload, $$props) {
  push();
  let {
    child,
    children,
    disabled = false,
    id = useId(),
    type = "button",
    value,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useTabsTrigger({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    value: box.with(() => value),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
const ROOT_ATTR = "data-toggle-root";
class ToggleRootState {
  #id;
  #ref;
  #disabled;
  pressed;
  constructor(props) {
    this.#disabled = props.disabled;
    this.pressed = props.pressed;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #togglePressed = () => {
    if (!this.#disabled.current) {
      this.pressed.current = !this.pressed.current;
    }
  };
  #onclick = () => {
    if (this.#disabled.current) return;
    this.#togglePressed();
  };
  #props = once(() => ({
    [ROOT_ATTR]: "",
    id: this.#id.current,
    "data-disabled": getDataDisabled(this.#disabled.current),
    "aria-pressed": getAriaPressed(this.pressed.current),
    "data-state": getToggleDataState(this.pressed.current),
    disabled: getDisabled(this.#disabled.current),
    onclick: this.#onclick
  }));
  get props() {
    return this.#props();
  }
}
function useToggleRoot(props) {
  return new ToggleRootState(props);
}
function getToggleDataState(condition) {
  return condition ? "on" : "off";
}
function Toggle$1($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    pressed = false,
    onPressedChange = noop,
    disabled = false,
    type = "button",
    controlledPressed = false,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const toggleState = useToggleRoot({
    pressed: box.with(() => pressed, (v) => {
      if (controlledPressed) {
        onPressedChange(v);
      } else {
        pressed = v;
        onPressedChange(v);
      }
    }),
    disabled: box.with(() => disabled ?? false),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, toggleState.props, { type });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, {
      props: mergedProps,
      pressed: toggleState.pressed.current
    });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps })}>`;
    children?.($$payload, { pressed: toggleState.pressed.current });
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref, pressed });
  pop();
}
function Tooltip_content$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    side = "top",
    sideOffset = 0,
    align = "center",
    avoidCollisions = true,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    collisionPadding = 0,
    onInteractOutside,
    onEscapeKeydown,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useTooltipContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const floatingProps = {
    side,
    sideOffset,
    align,
    avoidCollisions,
    arrowPadding,
    sticky,
    hideWhenDetached,
    collisionPadding
  };
  const mergedProps = mergeProps(restProps, floatingProps, contentState.props);
  function handleInteractOutside(e) {
    onInteractOutside?.(e);
    if (e.defaultPrevented) return;
    contentState.root.handleClose();
  }
  function handleEscapeKeydown(e) {
    onEscapeKeydown?.(e);
    if (e.defaultPrevented) return;
    contentState.root.handleClose();
  }
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props }) {
        const mergedProps2 = mergeProps(props, {
          style: getFloatingContentCSSVars("tooltip")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: mergedProps2,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...mergedProps2 })}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        {
          enabled: contentState.root.open.current,
          id,
          onInteractOutside: handleInteractOutside,
          onEscapeKeydown: handleEscapeKeydown,
          onOpenAutoFocus: (e) => e.preventDefault(),
          onCloseAutoFocus: (e) => e.preventDefault(),
          trapFocus: false,
          loop: false,
          preventScroll: false,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
    if (!forceMount) {
      $$payload.out += "<!--[-->";
      {
        let popper = function($$payload2, { props }) {
          const mergedProps2 = mergeProps(props, {
            style: getFloatingContentCSSVars("tooltip")
          });
          if (child) {
            $$payload2.out += "<!--[-->";
            child($$payload2, {
              props: mergedProps2,
              ...contentState.snippetProps
            });
            $$payload2.out += `<!---->`;
          } else {
            $$payload2.out += "<!--[!-->";
            $$payload2.out += `<div${spread_attributes({ ...mergedProps2 })}>`;
            children?.($$payload2);
            $$payload2.out += `<!----></div>`;
          }
          $$payload2.out += `<!--]-->`;
        };
        Popper_layer($$payload, spread_props([
          mergedProps,
          {
            present: contentState.root.open.current,
            id,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            onOpenAutoFocus: (e) => e.preventDefault(),
            onCloseAutoFocus: (e) => e.preventDefault(),
            trapFocus: false,
            loop: false,
            preventScroll: false,
            forceMount: false,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Tooltip_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Tooltip_content$1($$payload2, spread_props([
      {
        sideOffset,
        class: cn("bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Input($$payload, $$props) {
  push();
  let {
    ref = void 0,
    value = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<input${spread_attributes({
    class: cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
    value,
    ...restProps
  })}>`;
  bind_props($$props, { ref, value });
  pop();
}
function Input_1($$payload, $$props) {
  push();
  let {
    id,
    class: className,
    type,
    value = type === "number" ? null : "",
    confirmAction = "default",
    placeholder = "",
    disabled = false,
    onConfirmation
  } = $$props;
  let ref = void 0;
  function onkeydown(e) {
    if (confirmAction === "enter/blur" && e.key === "Enter") {
      onConfirmation?.(value);
      ref?.blur();
    }
  }
  function oninput(e) {
    const target = e.target;
    if (type === "number") {
      value = Number(target.value);
    } else {
      value = target.value;
    }
    if (confirmAction === "default") {
      onConfirmation?.(value);
    }
  }
  function onblur() {
    if (confirmAction === "enter/blur") {
      onConfirmation?.(value);
    }
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Input($$payload2, {
      id,
      type,
      value,
      placeholder,
      disabled,
      onkeydown,
      oninput,
      onblur,
      class: className,
      get ref() {
        return ref;
      },
      set ref($$value) {
        ref = $$value;
        $$settled = false;
      }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Dialog_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_title$1($$payload2, spread_props([
      {
        class: cn("text-lg font-semibold leading-none tracking-tight", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dialog_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes({
    class: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
    ...restProps
  })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_overlay($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_overlay$1($$payload2, spread_props([
      {
        class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-black/80", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function X($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$payload, spread_props([
    { name: "x" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Dialog_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Dialog_overlay($$payload3, {});
          $$payload3.out += `<!----> <!---->`;
          Dialog_content$1($$payload3, spread_props([
            {
              class: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                children?.($$payload4);
                $$payload4.out += `<!----> <!---->`;
                Dialog_close($$payload4, {
                  class: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
                  children: ($$payload5) => {
                    X($$payload5, { class: "size-4" });
                    $$payload5.out += `<!----> <span class="sr-only">Close</span>`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$3 = Dialog;
const Trigger$1 = Dialog_trigger;
const Portal = Portal$1;
function Separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "horizontal",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Separator$1($$payload2, spread_props([
      {
        class: cn("bg-border shrink-0", orientation === "horizontal" ? "h-[1px] w-full" : "min-h-full w-[1px]", className),
        orientation
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_scrollbar($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area_scrollbar$1($$payload2, spread_props([
      {
        orientation,
        class: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px", orientation === "horizontal" && "h-2.5 w-full border-t border-t-transparent p-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> <!---->`;
          Scroll_area_thumb($$payload3, {
            class: cn("relative rounded-full bg-border", orientation === "vertical" && "flex-1")
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    scrollbarXClasses = "",
    scrollbarYClasses = "",
    onscroll,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area$1($$payload2, spread_props([
      restProps,
      {
        class: cn("relative overflow-hidden", className),
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Scroll_area_viewport($$payload3, {
            onscroll,
            class: "h-full w-full rounded-[inherit]",
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            children: ($$payload4) => {
              children?.($$payload4);
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----> `;
          if (orientation === "vertical" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "vertical",
              class: scrollbarYClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> `;
          if (orientation === "horizontal" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "horizontal",
              class: scrollbarXClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> <!---->`;
          Scroll_area_corner($$payload3, {});
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Queue($$payload, $$props) {
  push();
  let {
    items,
    currentItemIndex,
    scrollElement = null,
    children
  } = $$props;
  let itemHeight = remToPx();
  let minHeight = 0;
  let visibleItems = [];
  items.map((l, idx) => ({ ...l, position: idx + 1 }));
  function onscroll(e) {
    const target = e.target;
    target.scrollTop;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Scroll_area($$payload2, {
      class: "relative flex h-full p-2",
      onscroll,
      get ref() {
        return scrollElement;
      },
      set ref($$value) {
        scrollElement = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        const each_array = ensure_array_like(visibleItems);
        $$payload3.out += `<div class="queue-list svelte-nzgc12"${attr("style", `grid-auto-rows: ${stringify(itemHeight)}px; height: ${stringify(minHeight)}px;`)}>`;
        if (each_array.length !== 0) {
          $$payload3.out += "<!--[-->";
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let item = each_array[$$index];
            $$payload3.out += `<div class="flex"${attr("style", `grid-row: ${stringify(item.position)};`)}>`;
            children($$payload3, item);
            $$payload3.out += `<!----></div>`;
          }
        } else {
          $$payload3.out += "<!--[!-->";
          $$payload3.out += `<div class="queue-list-empty svelte-nzgc12"><p class="text-lg font-medium text-muted-foreground">Очередь пуста</p></div>`;
        }
        $$payload3.out += `<!--]--></div>`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { scrollElement });
  pop();
}
function Play($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "polygon",
      { "points": "6 3 20 12 6 21 6 3" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "play" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Grip_vertical($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "circle",
      { "cx": "9", "cy": "12", "r": "1" }
    ],
    [
      "circle",
      { "cx": "9", "cy": "5", "r": "1" }
    ],
    [
      "circle",
      { "cx": "9", "cy": "19", "r": "1" }
    ],
    [
      "circle",
      { "cx": "15", "cy": "12", "r": "1" }
    ],
    [
      "circle",
      { "cx": "15", "cy": "5", "r": "1" }
    ],
    [
      "circle",
      { "cx": "15", "cy": "19", "r": "1" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "grip-vertical" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Draggable($$payload, $$props) {
  push();
  let {
    isSelected = false,
    isWatched = false,
    onSwipe,
    children
  } = $$props;
  $$payload.out += `<div${attr("class", `queue-item svelte-epv4z9 ${stringify([
    isSelected ? "selected" : "",
    isWatched ? "watched" : "",
    ""
  ].filter(Boolean).join(" "))}`)}><div${attr("class", `drag-handler svelte-epv4z9 ${stringify([!isSelected ? "draggable" : ""].filter(Boolean).join(" "))}`)}>`;
  if (isSelected) {
    $$payload.out += "<!--[-->";
    Play($$payload, {
      size: "1.25rem",
      fill: "#e5e7eb",
      strokeWidth: "0"
    });
  } else {
    $$payload.out += "<!--[!-->";
    Grip_vertical($$payload, { size: "1.25rem" });
  }
  $$payload.out += `<!--]--></div> `;
  children($$payload);
  $$payload.out += `<!----> <div class="queue-item-delete-bg svelte-epv4z9">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div>`;
  pop();
}
function QueueItem($$payload, $$props) {
  push();
  let {
    title,
    thumbnail,
    submittedBy,
    channelTitle,
    donationAmount,
    startSeconds,
    isSelected,
    onclick
  } = $$props;
  Root$4($$payload, {
    disableHoverableContent: true,
    delayDuration: 1e3,
    children: ($$payload2) => {
      Trigger$2($$payload2, {
        class: "w-full",
        onclick,
        children: ($$payload3) => {
          $$payload3.out += `<div class="relative flex w-full items-center gap-2 py-2"><div${attr("class", `relative aspect-video h-full w-32 flex-none select-none overflow-hidden rounded-lg ${stringify([isSelected ? "shadow-[0_0_0.25rem_black]" : ""].filter(Boolean).join(" "))}`)}><img class="h-full w-full object-cover"${attr("src", thumbnail)} alt="Video Thumbnail" draggable="false"> `;
          if (donationAmount > 0) {
            $$payload3.out += "<!--[-->";
            if (isSelected && appManager.timer.isEnabled) {
              $$payload3.out += "<!--[-->";
              $$payload3.out += `<div class="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-background bg-opacity-70 text-sm font-medium">`;
              if (appManager.timer.time > 0) {
                $$payload3.out += "<!--[-->";
                $$payload3.out += `${escape_html(appManager.timer.hhmmss)}`;
              } else {
                $$payload3.out += "<!--[!-->";
                $$payload3.out += `Время вышло`;
              }
              $$payload3.out += `<!--]--></div>`;
            } else {
              $$payload3.out += "<!--[!-->";
            }
            $$payload3.out += `<!--]--> <span class="absolute bottom-0 right-0 rounded-tl-lg bg-primary px-1.5 text-xs font-medium text-primary-foreground">${escape_html(donationAmount)} RUB</span>`;
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--></div> <div class="flex h-full w-full flex-col justify-center"><p class="line-clamp-2 overflow-hidden text-ellipsis text-start text-sm font-medium">${escape_html(title)}</p> <p class="text-ellipsis text-start text-xs text-muted-foreground">${escape_html(channelTitle)}</p> <p class="text-ellipsis text-start text-xs text-muted-foreground">Добавил ${escape_html(submittedBy[0])} `;
          if (submittedBy.length > 1) {
            $$payload3.out += "<!--[-->";
            $$payload3.out += `+ ${escape_html(submittedBy.length - 1)}`;
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--></p></div></div>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      Portal$1($$payload2, {
        children: ($$payload3) => {
          Tooltip_content($$payload3, {
            side: "left",
            sideOffset: 48,
            class: "max-w-xs",
            children: ($$payload4) => {
              $$payload4.out += `<div><p><span class="text-sm font-medium">Название</span>: ${escape_html(title)}</p> <p><span class="text-sm font-medium">Канал</span>: ${escape_html(channelTitle)}</p> <p><span class="text-sm font-medium">Добавил${escape_html(submittedBy.length > 1 ? "и" : "")}</span>: ${escape_html(submittedBy.join(", "))}</p> <p><span class="text-sm font-medium">Сумма</span>: ${escape_html(donationAmount)} RUB</p> <p><span class="text-sm font-medium">Старт</span>: ${escape_html(msToHHMMSS(startSeconds * 1e3))}</p></div>`;
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  pop();
}
function Skip_forward($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "polygon",
      { "points": "5 4 15 12 5 20 5 4" }
    ],
    [
      "line",
      {
        "x1": "19",
        "x2": "19",
        "y1": "5",
        "y2": "19"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "skip-forward" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
const badgeVariants = tv({
  base: "focus:ring-ring inline-flex select-none items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent",
      outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground border"
    }
  },
  defaultVariants: { variant: "default" }
});
function Badge($$payload, $$props) {
  push();
  let {
    ref = null,
    href,
    class: className,
    variant = "default",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  element(
    $$payload,
    href ? "a" : "span",
    () => {
      $$payload.out += `${spread_attributes({
        href,
        class: cn(badgeVariants({ variant, className })),
        ...restProps
      })}`;
    },
    () => {
      children?.($$payload);
      $$payload.out += `<!---->`;
    }
  );
  bind_props($$props, { ref });
  pop();
}
function AutoIndicator($$payload) {
  $$payload.out += `<div class="auto-indicator svelte-10ttw0v">`;
  Badge($$payload, {
    class: "px-1 py-[0.125rem] leading-none",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Авто`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div>`;
}
function Trash_2($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M3 6h18" }],
    [
      "path",
      { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }
    ],
    [
      "path",
      { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }
    ],
    [
      "line",
      {
        "x1": "10",
        "x2": "10",
        "y1": "11",
        "y2": "17"
      }
    ],
    [
      "line",
      {
        "x1": "14",
        "x2": "14",
        "y1": "11",
        "y2": "17"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "trash-2" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Alert_dialog_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    level = 3,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_title$1($$payload2, spread_props([
      {
        class: cn("text-lg font-semibold", className),
        level
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_action($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Alert_dialog_action$1($$payload2, spread_props([
      { class: cn(buttonVariants(), className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_cancel($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Alert_dialog_cancel$1($$payload2, spread_props([
      {
        class: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_footer($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes({
    class: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...restProps
  })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes({
    class: cn("flex flex-col space-y-2 text-center sm:text-left", className),
    ...restProps
  })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_overlay($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_overlay$1($$payload2, spread_props([
      {
        class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-black/80", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    portalProps,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          Alert_dialog_overlay($$payload3, {});
          $$payload3.out += `<!----> <!---->`;
          Alert_dialog_content$1($$payload3, spread_props([
            {
              class: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_description($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_description($$payload2, spread_props([
      {
        class: cn("text-muted-foreground text-sm", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$2 = Alert_dialog;
const Trigger = Dialog_trigger;
function DeleteQueue($$payload, $$props) {
  push();
  const { disabled } = $$props;
  let isAlertOpened = false;
  function onAlertAction() {
    appManager.queue.clear();
    isAlertOpened = false;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Root$2($$payload2, {
      get open() {
        return isAlertOpened;
      },
      set open($$value) {
        isAlertOpened = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        Trigger($$payload3, {
          class: buttonVariants({ variant: "outline", size: "icon" }),
          disabled,
          children: ($$payload4) => {
            Trash_2($$payload4, {});
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        Alert_dialog_content($$payload3, {
          children: ($$payload4) => {
            Alert_dialog_header($$payload4, {
              children: ($$payload5) => {
                Alert_dialog_title($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Вы уверены?`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> `;
                Alert_dialog_description($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Это действие необратимо. Нажимая "Удалить", вы навсегда удалите все видео из очереди.`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Alert_dialog_footer($$payload4, {
              children: ($$payload5) => {
                Alert_dialog_cancel($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Отмена`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> `;
                Alert_dialog_action($$payload5, {
                  onclick: onAlertAction,
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Удалить`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
const toggleVariants = tv({
  base: "ring-offset-background hover:bg-muted hover:text-muted-foreground focus-visible:ring-ring data-[state=on]:text-primary inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ",
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent"
    },
    size: {
      default: "h-10 min-w-10 px-3",
      sm: "h-9 min-w-9 px-2.5",
      lg: "h-11 min-w-11 px-5"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Toggle($$payload, $$props) {
  push();
  let {
    ref = null,
    pressed = false,
    class: className,
    size = "default",
    variant = "default",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Toggle$1($$payload2, spread_props([
      {
        class: cn(toggleVariants({ variant, size, className }))
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get pressed() {
          return pressed;
        },
        set pressed($$value) {
          pressed = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, pressed });
  pop();
}
function Shuffle($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"
      }
    ],
    ["path", { "d": "m18 2 4 4-4 4" }],
    [
      "path",
      { "d": "M2 6h1.9c1.5 0 2.9.9 3.6 2.2" }
    ],
    [
      "path",
      {
        "d": "M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"
      }
    ],
    ["path", { "d": "m18 14 4 4-4 4" }]
  ];
  Icon($$payload, spread_props([
    { name: "shuffle" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Eye_off($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
      }
    ],
    [
      "path",
      { "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242" }
    ],
    [
      "path",
      {
        "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
      }
    ],
    ["path", { "d": "m2 2 20 20" }]
  ];
  Icon($$payload, spread_props([
    { name: "eye-off" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Spinner($$payload) {
  $$payload.out += `<div class="circle-wrapper svelte-q88duy"><div class="circle svelte-q88duy"></div></div>`;
}
function Check($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$payload, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value,
    label,
    children: childrenProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    {
      let children = function($$payload3, { selected, highlighted }) {
        $$payload3.out += `<span class="absolute right-2 flex size-3.5 items-center justify-center">`;
        if (selected) {
          $$payload3.out += "<!--[-->";
          Check($$payload3, { class: "size-4" });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--></span> `;
        if (childrenProp) {
          $$payload3.out += "<!--[-->";
          childrenProp($$payload3, { selected, highlighted });
          $$payload3.out += `<!---->`;
        } else {
          $$payload3.out += "<!--[!-->";
          $$payload3.out += `${escape_html(label || value)}`;
        }
        $$payload3.out += `<!--]-->`;
      };
      Select_item$1($$payload2, spread_props([
        {
          value,
          class: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_up($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-up" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_scroll_up_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_up_button$1($$payload2, spread_props([
      {
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_up($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_down($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-down" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_scroll_down_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_down_button$1($$payload2, spread_props([
      {
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_down($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Select_content$1($$payload3, spread_props([
          {
            sideOffset,
            class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-popover text-popover-foreground relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            children: ($$payload4) => {
              Select_scroll_up_button($$payload4, {});
              $$payload4.out += `<!----> <!---->`;
              Select_viewport($$payload4, {
                class: cn("h-[var(--bits-select-anchor-height)] w-full min-w-[var(--bits-select-anchor-width)] p-1"),
                children: ($$payload5) => {
                  children?.($$payload5);
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              Select_scroll_down_button($$payload4, {});
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          }
        ]));
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_trigger$1($$payload2, spread_props([
      {
        class: cn("border-input bg-background ring-offset-background data-[placeholder]:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> `;
          Chevron_down($$payload3, { class: "size-4 opacity-50" });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$1 = Select;
function MultipleSelect($$payload, $$props) {
  push();
  let { items, value = [], onValueChange } = $$props;
  let selectedLabel = value.length ? items.filter((item) => value.includes(item.value)).map((item) => item.label) : "Закрыта";
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Root$1($$payload2, {
      type: "multiple",
      allowDeselect: false,
      onValueChange,
      get value() {
        return value;
      },
      set value($$value) {
        value = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        Select_trigger($$payload3, {
          children: ($$payload4) => {
            if (Array.isArray(selectedLabel)) {
              $$payload4.out += "<!--[-->";
              const each_array = ensure_array_like(selectedLabel);
              $$payload4.out += `<div class="flex gap-1"><!--[-->`;
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let label = each_array[$$index];
                Badge($$payload4, {
                  variant: "outline",
                  class: `hover:bg-muted ${stringify(label === "Twitch" ? "bg-purple-500/50" : "bg-orange-500/50")}`,
                  children: ($$payload5) => {
                    $$payload5.out += `<!---->${escape_html(label)}`;
                  },
                  $$slots: { default: true }
                });
              }
              $$payload4.out += `<!--]--></div>`;
            } else {
              $$payload4.out += "<!--[!-->";
              $$payload4.out += `${escape_html(selectedLabel)}`;
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        Select_content($$payload3, {
          children: ($$payload4) => {
            const each_array_1 = ensure_array_like(items);
            $$payload4.out += `<!--[-->`;
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let item = each_array_1[$$index_1];
              Select_item($$payload4, spread_props([item]));
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Tabs_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Tabs_content$1($$payload2, spread_props([
      {
        class: cn("ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Tabs_list($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Tabs_list$1($$payload2, spread_props([
      {
        class: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Tabs_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Tabs_trigger$1($$payload2, spread_props([
      {
        class: cn("ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root = Tabs;
function Settings$1($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      }
    ],
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "3" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "settings" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function SettingWrapper($$payload, $$props) {
  push();
  let {
    title,
    description = "",
    isHeader = false,
    isDisabled = false,
    children
  } = $$props;
  $$payload.out += `<div class="grid grid-cols-[auto_14rem] gap-6 data-[disabled='true']:pointer-events-none data-[header='true']:flex data-[header='true']:w-full data-[header='true']:gap-4 data-[disabled='true']:opacity-50"${attr("data-header", isHeader)}${attr("data-disabled", isDisabled)}><div class="flex w-full flex-col justify-center space-y-1"><span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">${escape_html(title)}</span> `;
  if (description) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span class="whitespace-break-spaces text-xs font-normal leading-snug text-muted-foreground">${escape_html(description)}</span>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> `;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  pop();
}
function Integration($$payload, $$props) {
  push();
  const { title, username, icon: icon2, onAuth, onLogout } = $$props;
  $$payload.out += `<div class="flex w-full items-center justify-center">`;
  if (!username) {
    $$payload.out += "<!--[-->";
    Button($$payload, {
      variant: "outline",
      size: "lg",
      onclick: onAuth,
      children: ($$payload2) => {
        icon2($$payload2);
        $$payload2.out += `<!----> Авторизоваться`;
      },
      $$slots: { default: true }
    });
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="flex w-full items-center justify-between gap-2"><div class="flex items-center gap-2"><div><h2 class="text-lg font-medium leading-none">${escape_html(title)}</h2> <span class="text-xs text-muted-foreground">Пользователь: ${escape_html(username)}</span></div></div> `;
    Button($$payload, {
      variant: "outline",
      onclick: onLogout,
      children: ($$payload2) => {
        $$payload2.out += `<!---->Выйти`;
      },
      $$slots: { default: true }
    });
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function TwitchIcon($$payload, $$props) {
  const { size = "1.5rem", color = "currentColor" } = $$props;
  $$payload.out += `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"${attr("width", size)}${attr("height", size)}${attr("fill", color)} viewBox="0 0 2400 2800" style="enable-background:new 0 0 2400 2800;" xml:space="preserve"><g id="Layer_1-2"><path class="st0" d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600
			V1300z"></path><rect x="1700" y="550" class="st0" width="200" height="600"></rect><rect x="1150" y="550" class="st0" width="200" height="600"></rect></g></svg>`;
}
function Card($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes({
    class: cn("bg-card text-card-foreground rounded-lg border shadow-sm", className),
    ...restProps
  })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Card_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes({ class: cn("p-6", className), ...restProps })}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function SettingCard($$payload, $$props) {
  push();
  const { isExtended, header, content } = $$props;
  Card($$payload, {
    children: ($$payload2) => {
      Card_content($$payload2, {
        class: "flex flex-col overflow-hidden p-0",
        children: ($$payload3) => {
          $$payload3.out += `<div class="p-4">`;
          header($$payload3);
          $$payload3.out += `<!----></div> `;
          if (content) {
            $$payload3.out += "<!--[-->";
            if (isExtended || isExtended === void 0) {
              $$payload3.out += "<!--[-->";
              Separator($$payload3, {});
              $$payload3.out += `<!----> <div class="flex flex-col gap-4 p-4">`;
              content($$payload3);
              $$payload3.out += `<!----></div>`;
            } else {
              $$payload3.out += "<!--[!-->";
            }
            $$payload3.out += `<!--]-->`;
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]-->`;
        },
        $$slots: { default: true }
      });
    },
    $$slots: { default: true }
  });
  pop();
}
function SettingSection($$payload, $$props) {
  push();
  const { isExtended, header, content } = $$props;
  $$payload.out += `<div class="flex flex-col gap-4"><div class="text-lg font-medium leading-none">`;
  header($$payload);
  $$payload.out += `<!----></div> `;
  if (isExtended || isExtended === void 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex flex-col gap-4">`;
    content($$payload);
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function Switch($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    checked = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Switch$1($$payload2, spread_props([
      {
        class: cn("peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get checked() {
          return checked;
        },
        set checked($$value) {
          checked = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Switch_thumb($$payload3, {
            class: cn("pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, checked });
  pop();
}
function icon$1($$payload) {
  TwitchIcon($$payload, { color: "#9147ff" });
}
function TwitchSettings($$payload, $$props) {
  push();
  var $$store_subs;
  let twitchChannel = store_get($$store_subs ??= {}, "$page", page).data.twitchUserData;
  function onLogout() {
    fetch("/api/twitch/logout");
    twitchChannel = void 0;
  }
  function onAuth() {
    goto();
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let header = function($$payload3) {
        Integration($$payload3, {
          title: "Twitch",
          username: twitchChannel?.display_name,
          icon: icon$1,
          onAuth,
          onLogout
        });
      }, content = function($$payload3) {
        if (twitchChannel) {
          $$payload3.out += "<!--[-->";
          {
            let header2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Голосование",
                description: "Возможность голосовать за продолжение или пропуск текущего видео",
                isHeader: true,
                children: ($$payload5) => {
                  Switch($$payload5, {
                    disabled: false,
                    get checked() {
                      return appManager.poll.isEnabled;
                    },
                    set checked($$value) {
                      appManager.poll.isEnabled = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
            }, content2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Оставить",
                description: `Ключевое слово за продолжение просмотра.
Не используйте специальные символы!`,
                children: ($$payload5) => {
                  Input_1($$payload5, {
                    id: "keep-keyword",
                    type: "text",
                    get value() {
                      return appManager.poll.keepKeyword;
                    },
                    set value($$value) {
                      appManager.poll.keepKeyword = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              SettingWrapper($$payload4, {
                title: "Пропустить",
                description: `Ключевое слово за пропуск текущего видео.
Не используйте специальные символы!`,
                children: ($$payload5) => {
                  Input_1($$payload5, {
                    id: "skip-keyword",
                    type: "text",
                    get value() {
                      return appManager.poll.skipKeyword;
                    },
                    set value($$value) {
                      appManager.poll.skipKeyword = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              SettingWrapper($$payload4, {
                title: "Количество голосов для пропуска",
                children: ($$payload5) => {
                  Input_1($$payload5, {
                    id: "twitch-votes",
                    type: "number",
                    value: appManager.poll.neededVotes,
                    confirmAction: "enter/blur",
                    onConfirmation: (val) => {
                      if (typeof val === "number") appManager.poll.neededVotes = val;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              SettingWrapper($$payload4, {
                title: "Пропуск видео",
                description: "Пропускать текущее видео по достижению нужного количества голосов",
                children: ($$payload5) => {
                  Switch($$payload5, {
                    get checked() {
                      return appManager.poll.shouldAutoSkip;
                    },
                    set checked($$value) {
                      appManager.poll.shouldAutoSkip = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            };
            SettingCard($$payload3, {
              isExtended: appManager.poll.isEnabled,
              header: header2,
              content: content2,
              $$slots: { header: true, content: true }
            });
          }
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]-->`;
      };
      SettingSection($$payload2, {
        isExtended: !!twitchChannel,
        header,
        content,
        $$slots: { header: true, content: true }
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function DonationAlertsIcon($$payload, $$props) {
  const { size = "1.5rem", color = "currentColor" } = $$props;
  $$payload.out += `<svg${attr("width", size)}${attr("height", size)} viewBox="0 0 69 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Dashboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Brand" transform="translate(-536.000000, -275.000000)"${attr("fill", color)} fill-rule="nonzero"><g id="Logos" transform="translate(390.000000, 120.000000)"><g id="1" transform="translate(0.000000, 120.000000)"><g id="DA_Alert" transform="translate(146.000000, 35.000000)"><path d="M34.8586103,46.5882227 L29.4383109,46.5882227 C29.1227896,46.5896404 28.8214241,46.4709816 28.6091788,46.2617625 C28.3969336,46.0525435 28.2937566,45.7724279 28.325313,45.4910942 L28.8039021,40.6038855 C28.8504221,40.0844231 29.3353656,39.684617 29.9168999,39.6862871 L35.3371993,39.6862871 C35.6527206,39.6848694 35.9540862,39.8035282 36.1663314,40.0127473 C36.3785767,40.2219663 36.4817536,40.5020819 36.4501972,40.7834156 L35.9716081,45.6706244 C35.9250881,46.1900867 35.4401446,46.5898928 34.8586103,46.5882227 Z M35.7273704,37.0196078 L30.2062624,37.0196078 C29.5964177,37.0196078 29.1020408,36.5436108 29.1020408,35.9564386 L30.6037822,19.445421 C30.6711655,18.9085577 31.1463683,18.5059261 31.7080038,18.5098321 L37.2291117,18.5098321 C37.8389565,18.5098321 38.3333333,18.9858292 38.3333333,19.5730013 L36.7874231,36.0946506 C36.71732,36.6114677 36.2684318,37.0031485 35.7273704,37.0196078 Z M68.1907868,17.7655375 C68.7783609,18.4477209 69.0654113,19.3359027 68.9874243,20.2304671 L66.8294442,44.7595227 C66.7602449,45.5618649 66.4022166,46.3125114 65.8210422,46.8737509 L48.1740082,63.9078173 C47.5440361,64.5136721 46.7011436,64.8515656 45.8244317,64.849701 L27.0379034,64.849701 L10.5001116,80 L11.780782,64.8396809 L3.37070981,64.8396809 C2.42614186,64.8404154 1.52467299,64.4469919 0.886144518,63.7553546 C0.247616048,63.0637173 -0.0692823639,62.1374374 0.0127313353,61.2024067 L5.14549723,3.00601995 C5.32162283,1.29571214 6.77326374,-0.00377492304 8.50347571,8.23911697e-06 L51.3303063,8.23911697e-06 C52.3155567,-0.000274507348 53.2515294,0.428127083 53.8916472,1.17235281 L68.1907868,17.7655375 Z M55.1118136,40.0801644 L56.4832402,24.9398854 C56.5364472,24.0422509 56.2238954,23.1611024 55.6160145,22.4949959 L47.548799,13.2364798 C46.9095165,12.5050105 45.982605,12.084699 45.0076261,12.0841753 L19.5958971,12.0841753 C17.8656851,12.0803922 16.4140442,13.3798792 16.2379186,15.090187 L13.2127128,49.1583198 C13.1430685,50.0904539 13.4642119,51.0097453 14.1001037,51.6985265 C14.7359954,52.3873077 15.6300918,52.7843324 16.5706913,52.795594 L41.5588914,52.795594 C42.4258216,52.7976549 43.2601656,52.4674704 43.8882999,51.8737504 L54.1034116,42.2044127 C54.6867718,41.6406314 55.0449815,40.8860452 55.1118136,40.0801644 Z" id="DA_Logo"></path></g></g></g></g></g></svg>`;
}
function icon($$payload) {
  DonationAlertsIcon($$payload, { color: "#f57507" });
}
function DonationAlertsSettings($$payload, $$props) {
  push();
  var $$store_subs;
  let donationAlertsUser = store_get($$store_subs ??= {}, "$page", page).data.donationAlertsUserData;
  function onLogout() {
    fetch("/api/donationalerts/logout");
    donationAlertsUser = void 0;
  }
  function onAuth() {
    goto();
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let header = function($$payload3) {
        Integration($$payload3, {
          title: "DonationAlerts",
          username: donationAlertsUser?.name,
          icon,
          onAuth,
          onLogout
        });
      }, content = function($$payload3) {
        if (donationAlertsUser?.id) {
          $$payload3.out += "<!--[-->";
          {
            let header2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Заказ видео",
                description: "Заказаные видео будут находиться в начале очереди",
                isHeader: true
              });
            }, content2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Минимальная стоимость",
                children: ($$payload5) => {
                  Input_1($$payload5, {
                    id: "donation-request-price",
                    type: "number",
                    suffix: "руб",
                    placeholder: "Значение",
                    get value() {
                      return appManager.donationSettings.requestPrice;
                    },
                    set value($$value) {
                      appManager.donationSettings.requestPrice = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
            };
            SettingCard($$payload3, {
              header: header2,
              content: content2,
              $$slots: { header: true, content: true }
            });
          }
          $$payload3.out += `<!----> `;
          {
            let header2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Пропуск видео",
                description: "Пропускать текущее видео, если сумма доната равна указанному значению",
                isHeader: true,
                children: ($$payload5) => {
                  Switch($$payload5, {
                    id: "donation-skip-enable",
                    get checked() {
                      return appManager.donationSettings.isSkipEnabled;
                    },
                    set checked($$value) {
                      appManager.donationSettings.isSkipEnabled = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
            }, content2 = function($$payload4) {
              SettingWrapper($$payload4, {
                title: "Динамическая стоимость",
                description: "Стоимостью пропуска будет являться указанный процент от стоимости текущего видео",
                children: ($$payload5) => {
                  Switch($$payload5, {
                    get checked() {
                      return appManager.donationSettings.isSkipDynamic;
                    },
                    set checked($$value) {
                      appManager.donationSettings.isSkipDynamic = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              SettingWrapper($$payload4, {
                title: appManager.donationSettings.isSkipDynamic ? "Процент (%)" : "Стоимость (RUB)",
                children: ($$payload5) => {
                  Input_1($$payload5, {
                    id: "donation-skip-price",
                    type: "number",
                    placeholder: "Значение",
                    get value() {
                      return appManager.donationSettings.skipPrice;
                    },
                    set value($$value) {
                      appManager.donationSettings.skipPrice = $$value;
                      $$settled = false;
                    }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            };
            SettingCard($$payload3, {
              isExtended: appManager.donationSettings.isSkipEnabled,
              header: header2,
              content: content2,
              $$slots: { header: true, content: true }
            });
          }
          $$payload3.out += `<!---->`;
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]-->`;
      };
      SettingSection($$payload2, {
        isExtended: !!donationAlertsUser?.id,
        header,
        content,
        $$slots: { header: true, content: true }
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function External_link($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M15 3h6v6" }],
    ["path", { "d": "M10 14 21 3" }],
    [
      "path",
      {
        "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "external-link" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Contacts($$payload, $$props) {
  const { class: className } = $$props;
  const contacts = [
    {
      href: "https://github.com/Esouqu/Stream-Video-Queue",
      title: "GitHub"
    },
    {
      href: "https://t.me/esouqu",
      title: "Telegram"
    },
    {
      href: "https://boosty.to/esouqu/donate",
      title: "Поддержать"
    }
  ];
  const each_array = ensure_array_like(contacts);
  $$payload.out += `<div${attr("class", `flex ${stringify(className)}`)}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let { href, title } = each_array[$$index];
    Button($$payload, {
      href,
      variant: "link",
      class: "h-auto justify-between px-3 py-1.5",
      target: "_blank",
      children: ($$payload2) => {
        $$payload2.out += `<!---->${escape_html(title)} `;
        External_link($$payload2, {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    });
  }
  $$payload.out += `<!--]--></div>`;
}
function PlayerSettings($$payload, $$props) {
  push();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let header = function($$payload3) {
        $$payload3.out += `<h2>Плеер</h2>`;
      }, content = function($$payload3) {
        {
          let header2 = function($$payload4) {
            SettingWrapper($$payload4, {
              title: "Автовоспроизведение",
              description: "Автоматически воспроизводить видео",
              isHeader: true,
              children: ($$payload5) => {
                Switch($$payload5, {
                  get checked() {
                    return appManager.playerSettings.shouldAutoplay;
                  },
                  set checked($$value) {
                    appManager.playerSettings.shouldAutoplay = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
          };
          SettingCard($$payload3, { header: header2, $$slots: { header: true } });
        }
        $$payload3.out += `<!----> `;
        {
          let header2 = function($$payload4) {
            SettingWrapper($$payload4, {
              title: "Автопереход",
              description: "Автоматически переходить на следующее видео по окончанию текущего",
              isHeader: true,
              children: ($$payload5) => {
                Switch($$payload5, {
                  get checked() {
                    return appManager.playerSettings.shouldPlayNextVideo;
                  },
                  set checked($$value) {
                    appManager.playerSettings.shouldPlayNextVideo = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
          };
          SettingCard($$payload3, { header: header2, $$slots: { header: true } });
        }
        $$payload3.out += `<!---->`;
      };
      SettingSection($$payload2, {
        header,
        content,
        $$slots: { header: true, content: true }
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Select_1($$payload, $$props) {
  push();
  let {
    items,
    value = items[0].value,
    class: className
  } = $$props;
  const selectedLabel = value ? items.find((theme) => theme.value === value)?.label : "Выберите опцию";
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Root$1($$payload2, {
      type: "single",
      allowDeselect: false,
      get value() {
        return value;
      },
      set value($$value) {
        value = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        Select_trigger($$payload3, {
          class: className,
          children: ($$payload4) => {
            $$payload4.out += `<!---->${escape_html(selectedLabel)}`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        Select_content($$payload3, {
          children: ($$payload4) => {
            const each_array = ensure_array_like(items);
            $$payload4.out += `<!--[-->`;
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let item = each_array[$$index];
              Select_item($$payload4, spread_props([item]));
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function TimerSettings($$payload, $$props) {
  push();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let header = function($$payload3) {
        $$payload3.out += `<!---->Таймер`;
      }, content = function($$payload3) {
        {
          let header2 = function($$payload4) {
            SettingWrapper($$payload4, {
              title: "Отсчитывать время",
              isHeader: true,
              children: ($$payload5) => {
                Switch($$payload5, {
                  get checked() {
                    return appManager.timer.isEnabled;
                  },
                  set checked($$value) {
                    appManager.timer.isEnabled = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
          }, content2 = function($$payload4) {
            SettingWrapper($$payload4, {
              title: "Стоимость за секунду",
              children: ($$payload5) => {
                Input_1($$payload5, {
                  id: "timer-value",
                  get value() {
                    return appManager.timer.pricePerSecond;
                  },
                  set value($$value) {
                    appManager.timer.pricePerSecond = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            SettingWrapper($$payload4, {
              title: "По окончанию таймера",
              children: ($$payload5) => {
                Select_1($$payload5, {
                  items: [
                    { label: "Ничего", value: "none" },
                    { label: "Пауза", value: "pause" },
                    { label: "Следующее видео", value: "next" }
                  ],
                  get value() {
                    return appManager.timer.onStateFinishedAction;
                  },
                  set value($$value) {
                    appManager.timer.onStateFinishedAction = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          };
          SettingCard($$payload3, {
            isExtended: appManager.timer.isEnabled,
            header: header2,
            content: content2,
            $$slots: { header: true, content: true }
          });
        }
      };
      SettingSection($$payload2, {
        header,
        content,
        $$slots: { header: true, content: true }
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Settings($$payload, $$props) {
  push();
  const tabsStyle = "w-full justify-start data-[state=active]:bg-muted gap-4";
  Root$3($$payload, {
    children: ($$payload2) => {
      Trigger$1($$payload2, {
        class: buttonVariants({ variant: "outline", size: "icon" }),
        children: ($$payload3) => {
          Settings$1($$payload3, {});
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      Dialog_content($$payload2, {
        class: "flex aspect-3/2 h-[35rem] w-auto max-w-none flex-col gap-0 p-0",
        children: ($$payload3) => {
          Dialog_header($$payload3, {
            class: "p-4",
            children: ($$payload4) => {
              Dialog_title($$payload4, {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->Настройки`;
                },
                $$slots: { default: true }
              });
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----> `;
          Separator($$payload3, { orientation: "horizontal" });
          $$payload3.out += `<!----> `;
          Root($$payload3, {
            class: "flex h-full overflow-hidden",
            children: ($$payload4) => {
              Tabs_list($$payload4, {
                class: "flex h-auto w-1/3 flex-col justify-between bg-transparent p-4",
                children: ($$payload5) => {
                  $$payload5.out += `<div class="flex flex-col gap-2"><div>`;
                  Tabs_trigger($$payload5, {
                    class: tabsStyle,
                    value: "player",
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Плеер`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> `;
                  Tabs_trigger($$payload5, {
                    class: tabsStyle,
                    value: "timer",
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Таймер`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----></div> `;
                  Separator($$payload5, {});
                  $$payload5.out += `<!----> <div>`;
                  Tabs_trigger($$payload5, {
                    class: tabsStyle,
                    value: "twitch",
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Twitch`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> `;
                  Tabs_trigger($$payload5, {
                    class: tabsStyle,
                    value: "donationalerts",
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->DonationAlerts`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----></div></div> `;
                  Contacts($$payload5, { class: "w-full flex-col" });
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              Separator($$payload4, { orientation: "vertical" });
              $$payload4.out += `<!----> `;
              Scroll_area($$payload4, {
                class: "h-full w-full gap-0 p-6",
                children: ($$payload5) => {
                  Tabs_content($$payload5, {
                    value: "player",
                    class: "m-0",
                    children: ($$payload6) => {
                      PlayerSettings($$payload6);
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> `;
                  Tabs_content($$payload5, {
                    value: "timer",
                    class: "m-0",
                    children: ($$payload6) => {
                      TimerSettings($$payload6);
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> `;
                  Tabs_content($$payload5, {
                    value: "twitch",
                    class: "m-0 h-full",
                    children: ($$payload6) => {
                      TwitchSettings($$payload6);
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> `;
                  Tabs_content($$payload5, {
                    value: "donationalerts",
                    class: "m-0 h-full",
                    children: ($$payload6) => {
                      DonationAlertsSettings($$payload6);
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  pop();
}
function _page($$payload, $$props) {
  push();
  let scrollElement = null;
  let queueItems = appManager.queue.items;
  let unseenQueueItems = appManager.queue.unseen;
  let currentItems = appManager.queue.shouldHideWatched ? unseenQueueItems : queueItems;
  let currentItemIndex = appManager.queue.currentIndex;
  let selectItems = [
    {
      label: "DonationAlerts",
      value: INTEGRATION.DONATIONALERTS,
      disabled: appManager.centrifugoSocket.state !== SOCKET_STATE.OPEN
    },
    {
      label: "Twitch",
      value: INTEGRATION.TWITCH,
      disabled: appManager.twitchChatSocket.state !== SOCKET_STATE.OPEN
    }
  ];
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>${escape_html(appManager.queue.current?.title ? `${appManager.queue.current.title} - QueueTube` : "QueueTube")}</title>`;
    });
    $$payload2.out += `<div class="relative flex flex-col overflow-hidden border-l"><div class="flex flex-col items-center p-4"><div class="flex w-full flex-col gap-1"><span class="text-sm font-medium">Очередь `;
    if (queueItems && unseenQueueItems) {
      $$payload2.out += "<!--[-->";
      Badge($$payload2, {
        variant: "outline",
        children: ($$payload3) => {
          $$payload3.out += `<!---->${escape_html(unseenQueueItems.length)} / ${escape_html(queueItems.length)}`;
        },
        $$slots: { default: true }
      });
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></span> `;
    MultipleSelect($$payload2, {
      items: selectItems,
      get value() {
        return appManager.enabledIntegrations;
      },
      set value($$value) {
        appManager.enabledIntegrations = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div> `;
    if (appManager.enabledIntegrations.includes(INTEGRATION.DONATIONALERTS)) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div class="mt-4 flex w-full items-center gap-2">`;
      Badge($$payload2, {
        class: "w-full justify-between rounded-full border bg-zinc-800 text-sm hover:bg-muted",
        children: ($$payload3) => {
          $$payload3.out += `<span>Заказать</span> <span>${escape_html(appManager.donationSettings.requestPrice)} RUB</span>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      if (appManager.donationSettings.isSkipEnabled) {
        $$payload2.out += "<!--[-->";
        Badge($$payload2, {
          class: "w-full justify-between rounded-full border bg-zinc-800 text-sm hover:bg-muted",
          children: ($$payload3) => {
            $$payload3.out += `<span>Пропустить</span> <span>${escape_html(appManager.videoSkipPrice)} RUB</span>`;
          },
          $$slots: { default: true }
        });
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div> `;
    Separator($$payload2, {});
    $$payload2.out += `<!----> `;
    if (!currentItems || currentItemIndex === void 0) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div class="flex h-full items-center justify-center">`;
      css_props($$payload2, true, { "--spinner-size": "2rem" }, () => {
        Spinner($$payload2);
      });
      $$payload2.out += `</div>`;
    } else {
      $$payload2.out += "<!--[!-->";
      {
        let children = function($$payload3, item) {
          const isCurrentVideo = appManager.queue.current?.id === item.id;
          Draggable($$payload3, {
            isSelected: isCurrentVideo,
            isWatched: item.isWatched,
            onSwipe: () => appManager.queue.remove(item),
            children: ($$payload4) => {
              QueueItem($$payload4, spread_props([
                item,
                {
                  isSelected: isCurrentVideo,
                  onclick: () => !isCurrentVideo && appManager.queue.setCurrent(item)
                }
              ]));
            },
            $$slots: { default: true }
          });
        };
        Queue($$payload2, {
          items: currentItems,
          currentItemIndex,
          get scrollElement() {
            return scrollElement;
          },
          set scrollElement($$value) {
            scrollElement = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        });
      }
    }
    $$payload2.out += `<!--]--> `;
    Separator($$payload2, {});
    $$payload2.out += `<!----> <div class="flex justify-between p-4"><div class="flex items-center gap-1">`;
    Button($$payload2, {
      class: "relative col-start-3 justify-self-end",
      variant: "outline",
      disabled: queueItems && queueItems.length < 2,
      onclick: () => appManager.queue.next(),
      children: ($$payload3) => {
        if (appManager.poll.shouldAutoSkip && appManager.poll.isEnabled) {
          $$payload3.out += "<!--[-->";
          AutoIndicator($$payload3);
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--> `;
        Skip_forward($$payload3, {});
        $$payload3.out += `<!----> <span>Следующее</span>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> <div class="flex">`;
    Toggle($$payload2, {
      get pressed() {
        return appManager.queue.shouldPlayRandomly;
      },
      set pressed($$value) {
        appManager.queue.shouldPlayRandomly = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        Shuffle($$payload3, {});
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> `;
    Toggle($$payload2, {
      class: "relative",
      get pressed() {
        return appManager.queue.shouldHideWatched;
      },
      set pressed($$value) {
        appManager.queue.shouldHideWatched = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        Eye_off($$payload3, {});
        $$payload3.out += `<!----> `;
        if (currentItems && queueItems && appManager.queue.shouldHideWatched) {
          $$payload3.out += "<!--[-->";
          $$payload3.out += `<span class="absolute right-[-0.25rem] top-[-0.25rem] flex min-w-6 justify-center p-0.5 text-xs">${escape_html(queueItems.length - currentItems.length)}</span>`;
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]-->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></div></div> <div>`;
    DeleteQueue($$payload2, {
      disabled: (appManager.queue.items?.length || 0) < 1
    });
    $$payload2.out += `<!----> `;
    Settings($$payload2);
    $$payload2.out += `<!----></div></div></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
export {
  _page as default
};
