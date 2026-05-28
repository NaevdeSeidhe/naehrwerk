// Globaler UI-State (Evidenz-Linse, Theme) + Event-Bus.
import { LENS_MINRANK } from "./meta.js";

export const state = { lensValue:0, get lensMinRank(){ return LENS_MINRANK[this.lensValue]; }, theme:"light" };

const bus = new EventTarget();
export const on = (ev, fn)=> bus.addEventListener(ev, fn);
export const emit = (ev, detail)=> bus.dispatchEvent(new CustomEvent(ev,{detail}));
