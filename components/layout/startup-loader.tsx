"use client";

import { useEffect, useRef, useState } from "react";

export function StartupLoader() {
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      frame = window.requestAnimationFrame(() => {
        overlay.current?.classList.add("startup-loader-ready");
        exitTimer = setTimeout(() => setVisible(false), 200);
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", finish, { once: true });
    } else {
      finish();
    }
    return () => {
      document.removeEventListener("DOMContentLoaded", finish);
      window.cancelAnimationFrame(frame);
      clearTimeout(exitTimer);
    };
  }, []);

  if (!visible) return null;

  return <>
    <div ref={overlay} className="startup-loader" role="status" aria-label="Loading DineRate">
      <div className="startup-loader-content">
        <div className="startup-loader-mark">
          <span className="startup-loader-ring" aria-hidden="true" />
          {/* A local brand asset with fixed dimensions avoids layout shifts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dinerate-logo.png" alt="" width="64" height="64" />
        </div>
        <p className="startup-loader-name">Dine<span>Rate</span></p>
        <p className="startup-loader-caption">Your next favourite awaits</p>
        <div className="startup-loader-dots" aria-hidden="true"><span /><span /><span /></div>
      </div>
    </div>
    <noscript><style>{".startup-loader { display: none; }"}</style></noscript>
  </>;
}
