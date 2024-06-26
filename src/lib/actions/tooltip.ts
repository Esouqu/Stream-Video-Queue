import type { Action } from "svelte/action";
import tippy, { type Props } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

const tooltip: Action<HTMLElement, Partial<Props>> = (node: HTMLElement, options: Partial<Props>) => {
  const initialOptions: Partial<Props> = {
    theme: 'general',
    arrow: false,
    offset: [0, 50],
    delay: [300, 0],
    interactive: true,
    allowHTML: false,
    appendTo: () => document.body,
    // hideOnClick: false,
    // trigger: 'click',
  }
  const tool = tippy(node, {
    ...options,
    ...initialOptions
  });

  function update() {
    tool.setProps({
      ...options,
      ...initialOptions
    })
  }

  function destroy() {
    tool.destroy()
  }

  return {
    update,
    destroy,
  }
}

export default tooltip;