import { Q as push, S as pop, T as once, V as spread_attributes, W as bind_props, X as ensure_array_like, Y as attr, Z as escape_html, _ as stringify, $ as spread_props, a0 as slot, a1 as sanitize_props, a2 as copy_payload, a3 as assign_payload, a4 as store_get, a5 as unsubscribe_stores } from "../../chunks/index2.js";
import { u as useRefById, b as box, m as mergeProps, a as useId, I as Icon, c as cn, d as appManager, P as Provider } from "../../chunks/button.js";
import { p as page } from "../../chunks/stores.js";
import "youtube-player";
import "style-to-object";
import "clsx";
function VideoPlayer($$payload, $$props) {
  push();
  $$payload.out += `<div class="youtube-player-container border svelte-v6a6h2"><div class="youtube-player svelte-v6a6h2"></div></div>`;
  pop();
}
const ROOT_ATTR = "data-progress-root";
class ProgressRootState {
  #id;
  #ref;
  #value;
  #max;
  constructor(props) {
    this.#value = props.value;
    this.#max = props.max;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({ id: this.#id, ref: this.#ref });
  }
  #props = once(() => ({
    role: "meter",
    value: this.#value.current,
    max: this.#max.current,
    "aria-valuemin": 0,
    "aria-valuemax": this.#max.current,
    "aria-valuenow": this.#value.current,
    "data-value": this.#value.current,
    "data-state": getProgressDataState(this.#value.current, this.#max.current),
    "data-max": this.#max.current,
    [ROOT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
function getProgressDataState(value, max) {
  if (value === null) return "indeterminate";
  return value === max ? "loaded" : "loading";
}
function useProgressRootState(props) {
  return new ProgressRootState(props);
}
function Progress$1($$payload, $$props) {
  push();
  let {
    child,
    children,
    value = 0,
    max = 100,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useProgressRootState({
    value: box.with(() => value),
    max: box.with(() => max),
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
function AnimatedCounter($$payload, $$props) {
  push();
  let { value } = $$props;
  let slicedValue = value.toString().split("");
  const each_array = ensure_array_like(slicedValue);
  $$payload.out += `<div class="relative grid overflow-hidden"><!--[-->`;
  for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
    let digit = each_array[idx];
    $$payload.out += `<div${attr("style", `grid-column: ${stringify(idx + 1)}; grid-row: 1;`)}>${escape_html(digit)}</div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function Thumbs_up($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M7 10v12" }],
    [
      "path",
      {
        "d": "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "thumbs-up" },
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
function Thumbs_down($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M17 14V2" }],
    [
      "path",
      {
        "d": "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "thumbs-down" },
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
function Progress($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    max = 100,
    value,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Progress$1($$payload2, spread_props([
      {
        class: cn("relative h-6 w-full overflow-hidden rounded-full bg-muted", className),
        value,
        max
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
          $$payload3.out += `<div class="h-full w-full flex-1 bg-foreground transition-all"${attr("style", `transform: translateX(-${100 - 100 * (value ?? 0) / (max ?? 1)}%)`)}></div>`;
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
function Votes($$payload, $$props) {
  push();
  $$payload.out += `<div class="relative flex w-[27rem] flex-col items-center justify-center gap-1"><div class="flex w-full justify-between gap-4 text-sm font-medium"><div class="flex items-center gap-2">`;
  Thumbs_up($$payload, { size: "1.25rem" });
  $$payload.out += `<!----> `;
  AnimatedCounter($$payload, { value: appManager.poll.keep });
  $$payload.out += `<!----> <span>${escape_html(appManager.poll.keepKeyword)}</span></div> <div class="absolute left-[50%] flex translate-x-[-50%] gap-2 font-medium"><div class="flex items-center gap-1">`;
  AnimatedCounter($$payload, { value: appManager.poll.difference });
  $$payload.out += `<!----> <span>/</span> <span>${escape_html(appManager.poll.neededVotes)}</span></div></div> <div class="flex items-center gap-2">`;
  Thumbs_down($$payload, { size: "1.25rem" });
  $$payload.out += `<!----> `;
  AnimatedCounter($$payload, { value: appManager.poll.skip });
  $$payload.out += `<!----> <span>${escape_html(appManager.poll.skipKeyword)}</span></div></div> <div class="relative w-full after:absolute after:left-[50%] after:top-0 after:h-full after:w-[0.125rem] after:translate-x-[-50%] after:bg-primary">`;
  Progress($$payload, {
    max: 100,
    value: appManager.poll.currentPercent,
    class: "h-1 w-full"
  });
  $$payload.out += `<!----></div></div>`;
  pop();
}
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  let { children } = $$props;
  store_get($$store_subs ??= {}, "$page", page).data.twitchUserData;
  store_get($$store_subs ??= {}, "$page", page).data.donationAlertsUserData;
  Provider($$payload, {
    delayDuration: 0,
    children: ($$payload2) => {
      $$payload2.out += `<div class="relative grid h-full w-full grid-cols-[auto_25.6rem]"><div class="m-4 flex flex-col justify-center gap-4">`;
      VideoPlayer($$payload2);
      $$payload2.out += `<!----> `;
      if (appManager.poll.isEnabled) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="relative flex w-full flex-1 items-center justify-center">`;
        Votes($$payload2);
        $$payload2.out += `<!----> `;
        {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]--></div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--></div> `;
      children($$payload2);
      $$payload2.out += `<!----></div>`;
    },
    $$slots: { default: true }
  });
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
