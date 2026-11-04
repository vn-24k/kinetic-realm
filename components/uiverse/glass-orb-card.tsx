import React from "react";

interface GlassOrbCardProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  badge?: string;
}

export function GlassOrbCard({
  title = "KINETIC LABS",
  subtitle = "Uiverse Community Component Integration",
  badge = "UIVERSE • MIT",
}: GlassOrbCardProps) {
  return (
    <>
      <style>{`
        .uiverse-glass-card {
          width: 260px;
          min-height: 180px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          cursor: pointer;
        }

        .uiverse-glass-inner {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 2;
          position: relative;
        }

        .uiverse-glass-card:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .uiverse-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          position: absolute;
          filter: blur(16px);
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }

        .uiverse-orb-1 {
          background: radial-gradient(#c77dff, #7b2cbf);
          top: -15px;
          left: -15px;
          animation: orb-float-1 3s ease-in-out infinite alternate;
        }

        .uiverse-orb-2 {
          background: radial-gradient(#38bdf8, #0284c7);
          bottom: -15px;
          right: -15px;
          animation: orb-float-2 3.5s ease-in-out infinite alternate;
        }

        @keyframes orb-float-1 {
          to {
            transform: translateY(-12px) translateX(8px);
          }
        }

        @keyframes orb-float-2 {
          to {
            transform: translateY(12px) translateX(-8px);
          }
        }
      `}</style>
      <div className="uiverse-glass-card">
        <div className="uiverse-orb uiverse-orb-1" />
        <div className="uiverse-orb uiverse-orb-2" />
        <div className="uiverse-glass-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
              {badge}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="my-3">
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">{title}</h4>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">{subtitle}</p>
          </div>
          <div className="text-[10px] font-mono text-purple-300 flex items-center gap-1.5">
            <span>● 100% RAW CSS/HTML</span>
          </div>
        </div>
      </div>
    </>
  );
}
