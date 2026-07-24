"use client";

import { useEffect, useState } from "react";

const scenes = [
  {
    netWorth: "$48,200",
    action: "Contribute $340 to your TFSA",
    left: { label: "Emergency Fund", value: "$8,000 / $8,000 ✓" },
    right: { label: "TFSA Room", value: "$3,100 left" },
  },
  {
    netWorth: "$48,540",
    action: "You're on track — check FHSA room",
    left: { label: "Emergency Fund", value: "$8,000 / $8,000 ✓" },
    right: { label: "FHSA Room", value: "$4,200 left" },
  },
  {
    netWorth: "$48,890",
    action: "Dividend reinvested: +$62 to XEQT",
    left: { label: "TFSA", value: "$21,400 total" },
    right: { label: "RRSP Room", value: "$9,800 left" },
  },
];

const SCENE_MS = 3800;

export function HeroMockup() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % scenes.length);
    }, SCENE_MS);
    return () => clearInterval(id);
  }, []);

  const scene = scenes[index];

  return (
    <div className="relative">
      <div className="hd-decoration-tack" />
      <div
        className="hd-card p-6 rotate-1 space-y-3"
        style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="hd-pulse-dot inline-block w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-xs uppercase tracking-wider" style={{ opacity: 0.55 }}>
            Live preview
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ opacity: 0.75 }}>
            Net Worth
          </span>
          <span key={scene.netWorth} className="hd-swap text-2xl" style={{ animationDuration: `${SCENE_MS}ms` }}>
            {scene.netWorth}
          </span>
        </div>
        <div className="hd-divider-dashed" />

        <div key={scene.action} className="hd-swap" style={{ animationDuration: `${SCENE_MS}ms` }}>
          <div className="hd-card hd-card--postit p-4 rotate-[-1deg]">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ opacity: 0.75 }}>
              Next Best Action
            </span>
            <p className="text-lg mt-1">{scene.action}</p>
          </div>
        </div>

        <div key={index} className="hd-swap grid grid-cols-2 gap-3" style={{ animationDuration: `${SCENE_MS}ms` }}>
          <div className="hd-card p-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ opacity: 0.75 }}>
              {scene.left.label}
            </span>
            <p className="text-lg">{scene.left.value}</p>
          </div>
          <div className="hd-card p-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ opacity: 0.75 }}>
              {scene.right.label}
            </span>
            <p className="text-lg">{scene.right.value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
