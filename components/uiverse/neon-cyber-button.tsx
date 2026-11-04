import React from "react";

interface NeonCyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function NeonCyberButton({ children = "ENTER REALM", className = "", ...props }: NeonCyberButtonProps) {
  return (
    <>
      <style>{`
        .uiverse-neon-btn {
          position: relative;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 800;
          color: #c77dff;
          padding: 0.8em 2em;
          border: none;
          background: rgba(199, 125, 255, 0.05);
          clip-path: polygon(0 0, 85% 0, 100% 100%, 15% 100%);
          display: inline-flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          transition: 0.3s 0.3s;
          cursor: pointer;
        }

        .uiverse-neon-btn:hover {
          text-shadow: 1px 1px 16px #e0aaff, 1px 1px 40px #e0aaff;
          background: rgba(199, 125, 255, 0.15);
        }

        .uiverse-neon-btn:active {
          transform: scale(0.95);
        }

        .uiverse-neon-btn::before,
        .uiverse-neon-btn::after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          background: #c77dff;
          transition: width 0.3s 0.3s;
        }

        .uiverse-neon-btn::before {
          top: 0;
          left: 0;
          transform-origin: top;
        }

        .uiverse-neon-btn::after {
          bottom: 0;
          right: 0;
          transform-origin: bottom;
        }

        .uiverse-neon-btn:hover::before,
        .uiverse-neon-btn:hover::after {
          width: 75%;
        }

        .uiverse-neon-btn span {
          position: absolute;
          width: 0;
          height: 2px;
          background: #c77dff;
          transition: width 0.3s, transform 0.3s 0.3s;
          transform: rotate(22.3deg);
        }

        .uiverse-neon-btn span:nth-child(1) {
          top: 0;
          left: 0;
          transform-origin: left;
        }

        .uiverse-neon-btn span:nth-child(2) {
          bottom: 0;
          right: 0;
          transform-origin: right;
        }

        .uiverse-neon-btn:hover span {
          width: 60%;
          transform: rotate(45deg);
        }
      `}</style>
      <button className={`uiverse-neon-btn ${className}`} {...props}>
        {children}
        <span />
        <span />
      </button>
    </>
  );
}
