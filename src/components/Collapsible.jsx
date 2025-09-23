import React, { useEffect, useRef } from "react";

/**
 * Collapsible with smooth open/close animations and presets.
 * Exports PRESETS so Sidebar (or others) can sync caret rotation.
 */
export const PRESETS = {
  fast:   { duration: 280, easing: "cubic-bezier(.25,.8,.25,1)" },
  default:{ duration: 480, easing: "cubic-bezier(.25,.8,.25,1)" },
  luxury: { duration: 720, easing: "cubic-bezier(.2,.9,.2,1)" },
  deluxe: { duration:1080, easing: "cubic-bezier(.2,.9,.2,1)" },
  vyapar: {
    duration: 1080,
    easingOpen: "cubic-bezier(.2,.9,.2,1)",  // floaty, smooth open
    easingClose: "cubic-bezier(.4,0,.2,1)",  // gentle snap close
    caretLag: 50, // ms delay for caret rotation
  },
};

export default function Collapsible({
  isOpen,
  children,
  preset = "default", // choose preset: 'fast'|'default'|'luxury'|'deluxe'|'vyapar'
}) {
  const elRef = useRef(null);
  const animRef = useRef(null);

  const presetObj = PRESETS[preset] || PRESETS.default;
  const duration = presetObj.duration;
  const easingOpen = presetObj.easingOpen || presetObj.easing;
  const easingClose = presetObj.easingClose || presetObj.easing;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const cancelAnim = () => {
      if (animRef.current) {
        try { animRef.current.cancel(); } catch {}
        animRef.current = null;
      }
    };

    cancelAnim();

    if (isOpen) {
      el.style.display = "";
      const target = el.scrollHeight;
      el.style.height = "0px";

      if (el.animate) {
        animRef.current = el.animate(
          [{ height: "0px" }, { height: `${target}px` }],
          { duration, easing: easingOpen }
        );
        animRef.current.onfinish = () => {
          el.style.height = "auto";
          animRef.current = null;
        };
      } else {
        el.style.transition = `height ${duration}ms ${easingOpen}`;
        requestAnimationFrame(() => { el.style.height = `${target}px`; });
        const onEnd = () => {
          el.style.height = "auto";
          el.style.transition = "";
          el.removeEventListener("transitionend", onEnd);
        };
        el.addEventListener("transitionend", onEnd);
      }
    } else {
      const start = el.scrollHeight;
      el.style.height = `${start}px`;
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;

      if (el.animate) {
        animRef.current = el.animate(
          [{ height: `${start}px` }, { height: "0px" }],
          { duration, easing: easingClose }
        );
        animRef.current.onfinish = () => {
          el.style.height = "0px";
          el.style.display = "none";
          animRef.current = null;
        };
      } else {
        el.style.transition = `height ${duration}ms ${easingClose}`;
        requestAnimationFrame(() => { el.style.height = "0px"; });
        const onEnd = () => {
          el.style.display = "none";
          el.style.transition = "";
          el.removeEventListener("transitionend", onEnd);
        };
        el.addEventListener("transitionend", onEnd);
      }
    }

    return () => cancelAnim();
  }, [isOpen, duration, easingOpen, easingClose, preset]);

  return (
    <div
      ref={elRef}
      style={{
        height: isOpen ? "auto" : "0px",
        display: isOpen ? "" : "none",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
