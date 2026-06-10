import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import logoOficialIcon from "./assets/logo-oficial-icon.png";
import { supabase } from "./lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const C = {
  shell: "var(--shell-bg)",
  bg: "var(--bg)",
  bgCard: "var(--bg-card)",
  bgCardHov: "var(--bg-card-hover)",
  bgLight: "var(--bg-light)",
  border: "var(--border)",
  borderLight: "var(--border-light)",
  green: "var(--green)",
  greenLime: "var(--green-lime)",
  greenGlow: "var(--green-glow)",
  text: "var(--text)",
  textSub: "var(--text-sub)",
  textDim: "var(--text-dim)",
  danger: "var(--danger)",
  warn: "var(--warn)",
  orange: "var(--orange)",
  shadow: "var(--shadow)",
  mapControl: "var(--map-control)",
  accentText: "var(--accent-text)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
  :root {
    --shell-bg: #050d06;
    --bg: #071407;
    --bg-card: #0b2410;
    --bg-card-hover: #113118;
    --bg-light: #143d20;
    --border: #1d5527;
    --border-light: #2d7b33;
    --green: #20d326;
    --green-lime: #cfff1a;
    --green-glow: rgba(32,211,38,.2);
    --farm-label-text: #cfff1a;
    --text: #eaffea;
    --text-sub: #b8d8b5;
    --text-dim: #71986f;
    --danger: #ff3b3b;
    --warn: #ffb800;
    --orange: #ff7a00;
    --accent-text: #063d3b;
    --shadow: rgba(0,0,0,.45);
    --map-control: rgba(5,13,6,.88);
    --sidebar-bg: linear-gradient(180deg, #0b2410 0%, #071407 100%);
    --hero-bg: radial-gradient(ellipse at center, #0a2a10 0%, #050d06 72%);
    --login-bg: radial-gradient(circle at 12% 18%, rgba(32,211,38,.12) 0%, rgba(32,211,38,0) 42%), linear-gradient(160deg, #0b2410 0%, #071407 100%);
  }
  .app-shell[data-theme="light"] {
    --shell-bg: #f7faf4;
    --bg: #ffffff;
    --bg-card: #f2fbea;
    --bg-card-hover: #e7f8d8;
    --bg-light: #dcf8c2;
    --border: #8ed35e;
    --border-light: #128d23;
    --green: #128d23;
    --green-lime: #cfff1a;
    --green-glow: rgba(32,201,37,.22);
    --farm-label-text: #063d3b;
    --text: #063d3b;
    --text-sub: #164c48;
    --text-dim: #486964;
    --danger: #e83434;
    --warn: #d99a00;
    --orange: #e46f00;
    --accent-text: #063d3b;
    --shadow: rgba(6,61,59,.14);
    --map-control: rgba(255,255,255,.92);
    --sidebar-bg: linear-gradient(180deg, #ffffff 0%, #effbe6 100%);
    --hero-bg: radial-gradient(ellipse at center, #dcf8c2 0%, #f7faf4 72%);
    --login-bg: radial-gradient(circle at 12% 18%, rgba(32,201,37,.15) 0%, rgba(32,201,37,0) 42%), linear-gradient(160deg, #ffffff 0%, #effbe6 100%);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: ${C.shell};
    font-family: 'Manrope', sans-serif;
    color: ${C.text};
    height: 100%;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  #root { height: 100%; }
  button { font-family: inherit; cursor: pointer; border: none; background: none; color: ${C.text}; }
  input  { font-family: inherit; outline: none; border: none; background: none; }
  input::placeholder { color: ${C.textDim}; }
  ::-webkit-scrollbar { width: 0; height: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes spinRev { to { transform:rotate(-360deg); } }
  @keyframes scanLine { 0% { top:12%; } 100% { top:85%; } }
  @keyframes barGrow { from { width:8%; } to { width:88%; } }

  .screen-enter { animation: fadeUp .28s cubic-bezier(.22,.68,0,1.1) both; }

  .visiagro-map .leaflet-control-zoom a {
    background: ${C.mapControl};
    border-bottom: 1px solid ${C.border};
    color: ${C.text};
  }
  .visiagro-map .leaflet-control-zoom {
    border: 1px solid ${C.border};
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.28);
  }
  .visiagro-map .leaflet-control-attribution {
    background: ${C.mapControl};
    color: ${C.textSub};
    border-radius: 8px 0 0 0;
    font-size: 10px;
  }
  .visiagro-map .leaflet-control-attribution a { color: ${C.greenLime}; }
  .map-farm-pin {
    width: 42px;
    height: 42px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: ${C.green};
    box-shadow: 0 0 0 8px rgba(61,220,61,.18), 0 0 28px rgba(61,220,61,.55);
    border: 3px solid ${C.greenLime};
  }
  .map-farm-pin::after {
    content: "";
    position: absolute;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: ${C.bg};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .map-alert-pin {
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid currentColor;
    background: ${C.mapControl};
    box-shadow: 0 0 18px currentColor;
  }
  .map-alert-pin::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .map-alert-label {
    background: ${C.mapControl};
    border: 1px solid var(--alert-color);
    border-radius: 10px;
    box-shadow: 0 12px 30px rgba(0,0,0,.35);
    color: ${C.text};
    min-width: 132px;
    padding: 8px 10px;
    transform: translate(22px, -42px);
    font-family: 'Manrope', sans-serif;
  }
  .map-alert-label strong { display: block; font-size: 12px; line-height: 1.25; }
  .map-alert-label span { color: ${C.textSub}; display: block; font-size: 11px; margin-top: 2px; }
  .map-area-label {
    background: ${C.mapControl};
    border: 1px solid ${C.warn};
    border-radius: 10px;
    box-shadow: 0 12px 30px rgba(0,0,0,.3);
    color: ${C.text};
    min-width: 156px;
    max-width: 220px;
    padding: 8px 10px;
    text-align: left;
    font-family: 'Manrope', sans-serif;
  }
  .map-area-label strong { display: block; font-size: 12px; line-height: 1.25; }
  .map-area-label span { color: ${C.textSub}; display: block; font-size: 11px; margin-top: 2px; }
  .map-area-label .area-alert-line {
    display: block;
    padding: 5px 0;
    border-bottom: 1px solid ${C.border};
  }
  .map-area-label .area-alert-line:last-child { border-bottom: 0; }
  .area-labels-hidden .map-area-label { display: none; }
  .map-farm-label {
    background: ${C.mapControl};
    border: 1px solid ${C.borderLight};
    border-radius: 9px;
    box-shadow: 0 10px 24px rgba(0,0,0,.32);
    color: var(--farm-label-text);
    font-family: 'Manrope', sans-serif;
    font-size: 12px;
    font-weight: 800;
    padding: 7px 10px;
  }
  .map-farm-label::before { display: none; }
  .map-layer-toggle {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 500;
    display: flex;
    gap: 6px;
    padding: 6px;
    border: 1px solid ${C.border};
    border-radius: 12px;
    background: ${C.mapControl};
    box-shadow: 0 12px 28px rgba(0,0,0,.32);
  }
  .map-layer-toggle button {
    padding: 8px 10px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 800;
  }

  .app-shell {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    background: ${C.shell};
    color: ${C.text};
  }
  .phone-frame {
    width: min(100%, 430px);
    max-width: 430px;
    min-height: 100vh;
    background: ${C.bg};
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 520px) {
    .app-shell {
      align-items: center;
      padding: clamp(10px, 1.2vw, 18px);
      background: var(--hero-bg);
    }
    .phone-frame {
      min-height: 840px;
      max-height: 900px;
      border-radius: 38px;
      box-shadow: 0 0 0 1px ${C.border}, 0 48px 100px ${C.shadow}, 0 0 80px ${C.greenGlow};
    }
  }

  .web-shell {
    width: min(1700px, calc(100% - 24px));
    min-height: calc(100vh - 24px);
    display: grid;
    grid-template-columns: clamp(250px, 18vw, 320px) minmax(0, 1fr);
    gap: 20px;
  }

  .web-sidebar {
    background: var(--sidebar-bg);
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: 22px 16px;
    box-shadow: 0 24px 60px ${C.shadow};
  }

  .web-content {
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 26px;
    min-height: calc(100vh - 24px);
    overflow: hidden;
    box-shadow: 0 24px 60px ${C.shadow};
  }

  .login-shell {
    width: min(1440px, calc(100% - 24px));
    min-height: calc(100vh - 24px);
    display: grid;
    grid-template-columns: 1.25fr minmax(380px, 520px);
    align-items: center;
    gap: 34px;
    padding: 30px;
    border-radius: 28px;
    border: 1px solid ${C.border};
    background:
      var(--login-bg);
    box-shadow: 0 24px 60px ${C.shadow};
  }

  .login-hero {
    max-width: 520px;
    padding: 12px 18px 12px 8px;
  }

  .login-panel {
    width: 100%;
    background: color-mix(in srgb, ${C.bg} 86%, transparent);
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: 30px 26px;
    box-shadow: 0 20px 42px ${C.shadow};
    backdrop-filter: blur(6px);
  }

  @media (max-width: 1120px) {
    .login-shell {
      width: min(980px, calc(100% - 28px));
      grid-template-columns: 1fr minmax(340px, 430px);
      gap: 22px;
      padding: 20px;
    }
  }
`;

const Svg = ({ children, size = 24, vb = "0 0 24 24", style, col }) => (
  <svg
    width={size}
    height={size}
    viewBox={vb}
    fill="none"
    stroke={col || "currentColor"}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

const IcoHome = () => (
  <Svg>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </Svg>
);
const IcoHistory = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Svg>
);
const IcoBug = () => (
  <Svg size={22}>
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2m17-4c1.97-.21 3.27-1.91 3.5-3.5M18 13h4" />
  </Svg>
);
const IcoFlask = () => (
  <Svg>
    <path d="M9 3h6M9 3v8l-4.5 9A1 1 0 0 0 5.4 22h13.2a1 1 0 0 0 .9-1.4L15 11V3" />
    <line x1="6.3" y1="15" x2="17.7" y2="15" />
  </Svg>
);

const IcoScan = ({ bg = false }) => (
  <Svg size={26} col={bg ? C.accentText : C.green}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

const IcoLogo = ({ size = 36 }) => (
  <img
    src={logoOficialIcon}
    alt="Logo Visiagro"
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "inline-block",
    }}
  />
);

const IcoArrow = () => (
  <Svg>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </Svg>
);
const IcoChevR = () => (
  <Svg size={17}>
    <polyline points="9,18 15,12 9,6" />
  </Svg>
);
const IcoChevD = ({ open }) => (
  <Svg
    size={18}
    style={{ transition: ".2s", transform: open ? "rotate(180deg)" : "none" }}
  >
    <polyline points="6,9 12,15 18,9" />
  </Svg>
);
const IcoCheck = () => (
  <Svg size={18} col={C.green}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </Svg>
);
const IcoCamera = () => (
  <Svg size={20}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Svg>
);
const IcoImage = () => (
  <Svg size={20}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </Svg>
);
const IcoEye = () => (
  <Svg size={28} col={C.green}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
const IcoEyeOff = () => (
  <Svg size={20}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);
const IcoCog = () => (
  <Svg size={20}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);
const IcoBell = () => (
  <Svg size={20}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);
const IcoSun = () => (
  <Svg size={20}>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
  </Svg>
);
const IcoMoon = () => (
  <Svg size={20}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);
const IcoHelp = () => (
  <Svg size={20}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);
const IcoLogout = () => (
  <Svg size={20} col={C.danger}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);
const IcoUser = () => (
  <Svg size={34} col={C.green}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);
const IcoRisk = () => (
  <Svg size={16}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);
const IcoPin = () => (
  <Svg size={14}>
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 14 8 14s8-8.5 8-14a8 8 0 0 0-8-8z" />
  </Svg>
);
const IcoMapPin = ({ size = 24, col }) => (
  <Svg size={size} col={col}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);
const IcoMap = () => (
  <Svg size={22}>
    <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </Svg>
);
const IcoTarget = () => (
  <Svg size={22}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
  </Svg>
);
const IcoMail = () => (
  <Svg size={22}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3,7 12,13 21,7" />
  </Svg>
);
const IcoCalendar = () => (
  <Svg size={18}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);
const IcoClock = () => (
  <Svg size={18}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Svg>
);
const IcoShield = () => (
  <Svg size={22}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-5" />
  </Svg>
);
const IcoSave = () => (
  <Svg size={20}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </Svg>
);
const IcoArr = () => (
  <Svg size={16}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </Svg>
);

const NoImagePlaceholder = ({ height = 120, label = "Sem imagem" }) => (
  <div
    style={{
      width: "100%",
      height,
      borderRadius: 14,
      border: `1px dashed ${C.borderLight}`,
      background: C.bgLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: C.textSub,
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: 0.2,
    }}
  >
    {label}
  </div>
);

const Badge = ({ color, children }) => (
  <span
    style={{
      background: color,
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 20,
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

const InfoCard = ({ title, children, style }) => (
  <div
    style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 14,
      ...style,
    }}
  >
    {title && (
      <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
        {title}
      </h4>
    )}
    {children}
  </div>
);

const LoadingState = ({ label = "Carregando dados..." }) => (
  <div
    style={{ padding: 18, color: C.textSub, textAlign: "center", fontSize: 14 }}
  >
    {label}
  </div>
);

const EmptyState = ({ label }) => (
  <div
    style={{
      padding: 18,
      color: C.textSub,
      textAlign: "center",
      fontSize: 14,
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
    }}
  >
    {label}
  </div>
);

const getDisplayName = (profile, user) =>
  profile?.nome || user?.email?.split("@")[0] || "Usuario";
const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const withTimeout = (promise, label = "Operacao", timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} demorou demais para responder.`)),
        timeoutMs,
      );
    }),
  ]);

const BackHeader = ({ title, onBack }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "20px 20px 0",
      flexShrink: 0,
    }}
  >
    <button onClick={onBack} style={{ color: C.text, lineHeight: 0 }}>
      <IcoArrow />
    </button>
    <h2
      style={{
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        fontSize: 20,
      }}
    >
      {title}
    </h2>
  </div>
);

function ThemeToggle({ theme, toggleTheme, compact = false }) {
  const isLight = theme === "light";
  return (
    <button
      onClick={toggleTheme}
      title={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
      style={{
        minWidth: compact ? 42 : "100%",
        height: 42,
        padding: compact ? 0 : "0 12px",
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background: C.bgCard,
        color: C.green,
        display: "flex",
        alignItems: "center",
        justifyContent: compact ? "center" : "space-between",
        gap: 10,
        fontWeight: 800,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isLight ? <IcoMoon /> : <IcoSun />}
        {!compact && (isLight ? "Modo escuro" : "Modo claro")}
      </span>
      {!compact && (
        <span style={{ color: C.textSub, fontSize: 12 }}>
          {isLight ? "Claro" : "Escuro"}
        </span>
      )}
    </button>
  );
}

function BottomNav({ active, setScreen }) {
  const tabs = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "historico", label: "Historico", Icon: IcoHistory },
    { id: "identificar", label: "Identificar", Icon: null },
    { id: "pragas", label: "Pragas", Icon: IcoBug },
    { id: "localizacao", label: "Localizacao", Icon: IcoMapPin },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: C.bgCard,
        borderTop: `1px solid ${C.border}`,
        padding: "6px 0 18px",
        flexShrink: 0,
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isCenter = id === "identificar";
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => setScreen(id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "2px 0",
              color: isActive ? C.green : C.textDim,
            }}
          >
            {isCenter ? (
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.green}, ${C.greenLime})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -26,
                  boxShadow: `0 4px 24px ${C.greenGlow}`,
                  border: `3px solid ${C.bg}`,
                }}
              >
                <IcoScan bg />
              </div>
            ) : (
              <div
                style={{ lineHeight: 0, color: isActive ? C.green : C.textDim }}
              >
                <Icon />
              </div>
            )}
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isDesktop;
}

function DesktopSidebar({ active, setScreen, onLogout, theme, toggleTheme }) {
  const tabs = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "identificar", label: "Identificar", Icon: IcoScan },
    { id: "historico", label: "Historico", Icon: IcoHistory },
    { id: "pragas", label: "Pragas", Icon: IcoBug },
    { id: "pesticidas", label: "Pesticidas", Icon: IcoFlask },
    { id: "localizacao", label: "Localizacao", Icon: IcoMapPin },
    { id: "perfil", label: "Perfil", Icon: IcoUser },
  ];

  return (
    <aside className="web-sidebar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 10px 16px",
        }}
      >
        <IcoLogo size={30} />
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: C.green,
          }}
        >
          Visiagro
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 8,
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 12px",
                borderRadius: 12,
                color: isActive ? C.green : C.textSub,
                background: isActive ? C.bgLight : "transparent",
                border: isActive
                  ? `1px solid ${C.borderLight}`
                  : "1px solid transparent",
                transition: "all .2s",
              }}
            >
              <span style={{ lineHeight: 0 }}>
                <Icon />
              </span>
              <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 600 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          borderTop: `1px solid ${C.border}`,
          paddingTop: 14,
        }}
      >
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            marginTop: 10,
            border: "1px solid rgba(255,59,59,.3)",
            color: C.danger,
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IcoLogout /> Sair
        </button>
      </div>
    </aside>
  );
}

function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--hero-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          backgroundImage: `linear-gradient(${C.green} 1px,transparent 1px),linear-gradient(90deg,${C.green} 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          zIndex: 1,
          textAlign: "center",
          animation: "fadeUp .7s .1s both",
        }}
      >
        <IcoLogo size={74} />
      </div>
      <div
        style={{
          zIndex: 1,
          textAlign: "center",
          animation: "fadeUp .7s .3s both",
          marginTop: 22,
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: C.green,
            letterSpacing: -0.4,
          }}
        >
          Visiagro
        </h1>
        <p style={{ color: C.textSub, fontSize: 14, marginTop: 8 }}>
          Transformando tecnologia em produtividade
        </p>
      </div>
      <div
        style={{
          zIndex: 1,
          display: "flex",
          gap: 8,
          marginTop: 62,
          animation: "fadeIn .6s .7s both",
        }}
      >
        <div
          style={{ width: 26, height: 7, borderRadius: 4, background: C.green }}
        />
        <div
          style={{ width: 7, height: 7, borderRadius: 4, background: C.border }}
        />
        <div
          style={{ width: 7, height: 7, borderRadius: 4, background: C.border }}
        />
      </div>
    </div>
  );
}

function LoginScreen({
  onLogin,
  isDesktop = false,
  theme = "dark",
  toggleTheme,
}) {
  const [mode, setMode] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async () => {
    setError("");
    setNotice("");
    if (!email || !pass || (mode === "signup" && !nome.trim())) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin({
        mode,
        nome: nome.trim(),
        email,
        password: pass,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.notice) {
        setNotice(result.notice);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 13,
    padding: "15px 18px",
    color: C.text,
    fontSize: 15,
    width: "100%",
    transition: "border-color .2s",
  };

  const loginForm = (
    <>
      <div
        style={{
          textAlign: "center",
          marginBottom: isDesktop ? 30 : 36,
          animation: "fadeUp .6s both",
        }}
      >
        <IcoLogo size={isDesktop ? 56 : 62} />
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: isDesktop ? 34 : 38,
            fontWeight: 800,
            color: C.green,
            margin: "14px 0 6px",
          }}
        >
          Visiagro
        </h1>
        <p style={{ color: C.textSub, fontSize: 13 }}>
          Visao computacional para a agricultura
        </p>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          animation: "fadeUp .6s .1s both",
        }}
      >
        {mode === "signup" && (
          <input
            style={inp}
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = C.green)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
        )}
        <input
          style={inp}
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = C.green)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <div style={{ position: "relative", width: "100%" }}>
          <input
            style={{ ...inp, paddingRight: 54 }}
            type={showPass ? "text" : "password"}
            placeholder="Senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = C.green)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
          <button
            type="button"
            onClick={() => setShowPass((value) => !value)}
            aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
            title={showPass ? "Ocultar senha" : "Mostrar senha"}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: showPass ? C.green : C.textSub,
              background: showPass ? C.bgLight : "transparent",
            }}
          >
            {showPass ? <IcoEye /> : <IcoEyeOff />}
          </button>
        </div>
      </div>
      {error && (
        <div
          style={{
            marginTop: 14,
            color: C.danger,
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          style={{
            marginTop: 14,
            color: C.green,
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {notice}
        </div>
      )}
      <div
        style={{
          width: "100%",
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          animation: "fadeUp .6s .2s both",
        }}
      >
        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenLime})`,
            color: C.accentText,
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 6px 24px ${C.greenGlow}`,
            opacity: loading ? 0.72 : 1,
          }}
        >
          <IcoArr />{" "}
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setNotice("");
          }}
          style={{
            color: C.textSub,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {mode === "login" ? "Criar nova conta" : "Ja tenho conta"} <IcoArr />
        </button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <div
        className="screen-enter"
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "22px 0",
          background: "var(--hero-bg)",
          position: "relative",
        }}
      >
        {toggleTheme && (
          <div style={{ position: "absolute", top: 22, right: 22 }}>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} compact />
          </div>
        )}
        <div className="login-shell">
          <div className="login-hero" style={{ animation: "fadeUp .6s both" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <IcoLogo size={52} />
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  color: C.green,
                }}
              >
                Visiagro
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 44,
                lineHeight: 1.08,
                letterSpacing: -0.4,
                color: C.text,
              }}
            >
              Plataforma inteligente para diagnostico agricola
            </h2>
            <p
              style={{
                marginTop: 16,
                color: C.textSub,
                fontSize: 16,
                maxWidth: 460,
              }}
            >
              Analise imagens da sua lavoura, identifique pragas e acompanhe o
              historico em um painel unico.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              {[
                "Deteccao rapida",
                "Historico de analises",
                "Acesso em qualquer tela",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.border}`,
                    background: C.bgLight,
                    color: C.textSub,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="login-panel">{loginForm}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        background: "var(--hero-bg)",
        position: "relative",
      }}
    >
      {toggleTheme && (
        <div style={{ position: "absolute", top: 18, right: 18 }}>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} compact />
        </div>
      )}
      <div style={{ width: "100%", maxWidth: 430 }}>{loginForm}</div>
    </div>
  );
}

function HomeScreen({ setScreen, profile, user, theme, toggleTheme }) {
  const displayName = getDisplayName(profile, user);
  const quickItems = [
    {
      id: "localizacao",
      Icon: IcoMapPin,
      label: "Localizacao",
      sub: "Demarque sua lavoura",
    },
    {
      id: "notificacoes",
      Icon: IcoBell,
      label: "Notificacoes",
      sub: "Alertas proximos",
    },
    {
      id: "historico",
      Icon: IcoHistory,
      label: "Historico",
      sub: "Analises anteriores",
    },
    { id: "pragas", Icon: IcoBug, label: "Pragas", sub: "Catalogo de pragas" },
    {
      id: "pesticidas",
      Icon: IcoFlask,
      label: "Pesticidas",
      sub: "Catalogo e fornecedores",
    },
  ];

  return (
    <div
      className="screen-enter"
      style={{ flex: 1, overflow: "auto", padding: "22px 20px 0" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <IcoLogo size={30} />
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: C.green,
            }}
          >
            Visiagro
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} compact />
          <button
            onClick={() => setScreen("perfil")}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: C.bgLight,
              border: `1px solid ${C.border}`,
              color: C.green,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {getInitials(displayName)}
          </button>
        </div>
      </div>

      <h2
        style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: 26,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Ola, {displayName}!
      </h2>
      <p style={{ color: C.textSub, fontSize: 14, marginBottom: 22 }}>
        Pronto para identificar pragas na sua lavoura?
      </p>

      <button
        onClick={() => setScreen("identificar")}
        style={{
          width: "100%",
          padding: "18px 20px",
          borderRadius: 16,
          background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
          color: C.accentText,
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: `0 8px 28px ${C.greenGlow}`,
        }}
      >
        <IcoScan bg /> Identificar praga
      </button>

      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.textDim,
          letterSpacing: 1.2,
          marginBottom: 12,
        }}
      >
        ACESSO RAPIDO
      </p>

      {quickItems.map(({ id, Icon, label, sub }) => (
        <button
          key={id}
          onClick={() => setScreen(id)}
          style={{
            width: "100%",
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "15px 16px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 14,
            transition: "border-color .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = C.borderLight)
          }
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: C.bgLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.green,
            }}
          >
            <Icon />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
            <div style={{ color: C.textSub, fontSize: 12 }}>{sub}</div>
          </div>
          <div style={{ color: C.textSub }}>
            <IcoChevR />
          </div>
        </button>
      ))}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        {[
          ["3", "Analises feitas"],
          ["5", "Pragas catalogadas"],
        ].map(([n, l]) => (
          <div
            key={l}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 34,
                fontWeight: 800,
                color: C.green,
              }}
            >
              {n}
            </div>
            <div style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentificarScreen({ setScreen }) {
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function loadFarmsForPrediction() {
      try {
        const { farms: loadedFarms } = await loadRealFarms();
        if (!active) return;
        setFarms(loadedFarms);
        setSelectedFarmId((current) => current || loadedFarms[0]?.id || "");
      } catch {
        if (active) setFarms([]);
      }
    }
    loadFarmsForPrediction();
    return () => {
      active = false;
    };
  }, []);

  const analyzeFile = async (file) => {
    if (!file) return;
    setError("");
    setPhase("processing");

    const previewUrl = URL.createObjectURL(file);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      URL.revokeObjectURL(previewUrl);
      setError("Faca login novamente para analisar imagens.");
      setPhase("idle");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const selectedFarm = farms.find((farm) => farm.id === selectedFarmId);
    if (selectedFarm && hasFarmCenter(selectedFarm)) {
      formData.append("latitude", String(selectedFarm.lat));
      formData.append("longitude", String(selectedFarm.lng));
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Falha ao analisar imagem.",
        );
      }

      setResult({ ...data, previewUrl });
      setPhase("result");
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setError(
        err.name === "AbortError"
          ? "A analise demorou demais. Verifique se a API esta rodando."
          : err.message,
      );
      setPhase("idle");
    }
  };

  if (phase === "result") {
    return (
      <ResultadoScreen
        result={result}
        onBack={() => {
          if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
          setResult(null);
          setPhase("idle");
        }}
        onRec={() => setPhase("rec")}
        setScreen={setScreen}
      />
    );
  }
  if (phase === "rec") {
    return (
      <RecomendacaoScreen
        onBack={() => setPhase("result")}
        setScreen={setScreen}
      />
    );
  }
  if (phase === "processing") {
    return <ProcessandoScreen />;
  }

  return (
    <div
      className="screen-enter"
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <BackHeader title="Identificar Praga" onBack={() => setScreen("home")} />
      <div
        style={{
          flex: 1,
          padding: "20px 20px 0",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {farms.length > 0 && (
          <label style={{ color: C.textSub, fontSize: 13 }}>
            Lavoura da análise
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              style={{
                width: "100%",
                marginTop: 7,
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "13px 15px",
                color: C.text,
                fontSize: 14,
              }}
            >
              {farms.map((farm) => (
                <option
                  key={farm.id}
                  value={farm.id}
                  style={{ background: C.bgCard }}
                >
                  {farm.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div
          style={{
            flex: 1,
            background: C.bgCard,
            borderRadius: 22,
            border: `1px dashed ${C.border}`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            minHeight: 260,
          }}
        >
          {[
            {
              top: 14,
              left: 14,
              borderRight: "none",
              borderBottom: "none",
              borderRadius: "8px 0 0 0",
            },
            {
              top: 14,
              right: 14,
              borderLeft: "none",
              borderBottom: "none",
              borderRadius: "0 8px 0 0",
            },
            {
              bottom: 14,
              left: 14,
              borderRight: "none",
              borderTop: "none",
              borderRadius: "0 0 0 8px",
            },
            {
              bottom: 14,
              right: 14,
              borderLeft: "none",
              borderTop: "none",
              borderRadius: "0 0 8px 0",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 30,
                height: 30,
                ...s,
                border: `2px solid ${C.green}`,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.green},transparent)`,
              animation: "scanLine 2.2s ease-in-out infinite alternate",
            }}
          />
          <div style={{ textAlign: "center", padding: "0 28px" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: `1.5px solid ${C.border}`,
                background: C.bgLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                color: C.green,
              }}
            >
              <IcoCamera />
            </div>
            <p style={{ fontWeight: 600, marginBottom: 7 }}>
              Capture a praga com boa iluminacao
            </p>
            <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.5 }}>
              Posicione a camera proxima a praga para melhor identificacao
            </p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            paddingBottom: 20,
          }}
        >
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => analyzeFile(e.target.files?.[0])}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => analyzeFile(e.target.files?.[0])}
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            style={{
              padding: "16px",
              borderRadius: 14,
              background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
              color: C.accentText,
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IcoCamera /> Tirar foto
          </button>
          <button
            onClick={() => galleryInputRef.current?.click()}
            style={{
              padding: "16px",
              borderRadius: 14,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IcoImage /> Galeria
          </button>
        </div>
        {error && (
          <div
            style={{
              color: C.danger,
              fontSize: 13,
              textAlign: "center",
              paddingBottom: 16,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessandoScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 32,
        background: "var(--hero-bg)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 110,
          height: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2.5px solid ${C.border}`,
            borderTop: `2.5px solid ${C.green}`,
            animation: "spin .9s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTop: `2px solid ${C.greenLime}`,
            animation: "spinRev .6s linear infinite",
          }}
        />
        <IcoEye />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          Analisando imagem...
        </h2>
        <p style={{ color: C.textSub, lineHeight: 1.6, maxWidth: 260 }}>
          Nosso modelo de visao computacional esta processando sua foto
        </p>
      </div>
      <div style={{ width: 220 }}>
        <div
          style={{
            height: 4,
            background: C.bgCard,
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              height: "100%",
              background: `linear-gradient(90deg,${C.green},${C.greenLime})`,
              borderRadius: 3,
              animation: "barGrow 2.6s cubic-bezier(.4,0,.2,1) forwards",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: C.green,
        }}
      >
        <IcoLogo size={22} />
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Visiagro
        </span>
      </div>
    </div>
  );
}

function ResultadoScreen({ result, onBack, onRec }) {
  const peste = result?.peste;
  const label = peste?.nome_comum || result?.label || "Nenhuma deteccao";
  const confidence =
    typeof result?.confianca === "number"
      ? Math.round(result.confianca * 100)
      : null;
  const risk = peste?.nivel_risco;

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Resultado" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div
          style={{
            width: "100%",
            height: 190,
            borderRadius: 18,
            overflow: "hidden",
            background: C.bgLight,
            border: `1px solid ${C.border}`,
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {result?.previewUrl ? (
            <img
              src={result.previewUrl}
              alt="Imagem analisada"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <NoImagePlaceholder height={156} />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 26,
                fontWeight: 800,
                marginBottom: 3,
              }}
            >
              {label}
            </h2>
            <p style={{ color: C.textSub, fontSize: 13 }}>
              {peste ? "Praga identificada" : "Resultado da analise"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 30,
                fontWeight: 800,
                color: C.green,
              }}
            >
              {confidence !== null ? `${confidence}%` : "--"}
            </div>
            <div style={{ color: C.textSub, fontSize: 12 }}>Confianca</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 14px",
            background: C.bgCard,
            borderRadius: 11,
            border: `1px solid ${C.border}`,
            marginBottom: 18,
            color: C.textSub,
            fontSize: 13,
          }}
        >
          <div style={{ color: C.warn }}>
            <IcoRisk />
          </div>
          Nivel de risco:{" "}
          <Badge color={riskColor(risk)}>
            {risk ? riskLabel(risk).replace("Risco ", "") : "Nao informado"}
          </Badge>
        </div>
        <InfoCard title="Descricao">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
            {peste?.descricao_simples ||
              "A analise foi registrada, mas nao encontramos uma praga correspondente na tabela pestes."}
          </p>
        </InfoCard>
        <InfoCard title="Danos causados">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
            {peste?.danos_causados || "Sem informacao cadastrada."}
          </p>
        </InfoCard>
        <InfoCard title="Acoes recomendadas">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
            {peste?.acoes_recomendadas || "Sem recomendacoes cadastradas."}
          </p>
        </InfoCard>
        <button
          onClick={onRec}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
            color: C.accentText,
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 6px 20px ${C.greenGlow}`,
          }}
        >
          Ver Recomendacoes <IcoArr />
        </button>
      </div>
    </div>
  );
}

function RecomendacaoScreen({ onBack }) {
  const actions = [
    "Realizar monitoramento com pano de batida semanalmente",
    "Aplicar Bacillus thuringiensis (Bt) nas fases iniciais",
    "Utilizar armadilhas de feromonio para monitoramento",
    "Considerar controle quimico seletivo se atingir nivel de acao",
    "Preservar inimigos naturais como Trichogramma",
  ];

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Recomendacao" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            padding: "14px 16px",
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: C.bgLight,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}>
              Sem imagem
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Lagarta</div>
            <div style={{ color: C.textSub, fontSize: 13 }}>
              Manejo recomendado
            </div>
          </div>
        </div>
        <InfoCard title="Manejo sugerido">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
            Controle integrado com monitoramento constante e aplicacao de
            defensivos biologicos.
          </p>
        </InfoCard>
        <div style={{ marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Acoes recomendadas
          </h4>
          {actions.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginBottom: 11,
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                <IcoCheck />
              </div>
              <span
                style={{ color: C.textSub, fontSize: 13, lineHeight: 1.55 }}
              >
                {a}
              </span>
            </div>
          ))}
        </div>
        <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          Pesticidas indicados
        </h4>
        {[
          { n: "Dipel WP", t: "Biologico" },
          { n: "Nim-I-Go EC", t: "Natural / Organico" },
        ].map((p) => (
          <div
            key={p.n}
            style={{
              padding: "14px 16px",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ color: C.green }}>
              <IcoFlask />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.n}</div>
              <div style={{ color: C.textSub, fontSize: 12 }}>{p.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const normalizeRisk = (risk = "") => {
  const value = risk.toLowerCase();
  if (value.includes("alto") || value === "red") return "red";
  if (value.includes("medio") || value.includes("médio") || value === "yellow")
    return "yellow";
  return "orange";
};
const riskColor = (r) => {
  const risk = normalizeRisk(r);
  return risk === "red" ? C.danger : risk === "yellow" ? C.warn : C.orange;
};
const riskLabel = (r) => {
  const risk = normalizeRisk(r);
  return risk === "red"
    ? "Risco Alto"
    : risk === "yellow"
      ? "Risco Medio"
      : "Risco Moderado";
};
const normalizePestKey = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
const PEST_NAME_ALIASES = {
  "bemisia tabaci": "Mosca-branca",
  "mosca branca": "Mosca-branca",
};
const displayPestName = (value) =>
  PEST_NAME_ALIASES[normalizePestKey(value)] || value || "Praga detectada";
const escapeMapHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const NOTIFICATION_READ_STORAGE_KEY = "visiagro.notifications.read";
const DEFAULT_MAP_CENTER = { lat: -14.235, lng: -51.9253 };
const LEGACY_DEFAULT_FARM_CENTER = { lat: -13.8314, lng: -56.0742 };

const toValidCoordinate = (value, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max
    ? number
    : null;
};

const hasFarmCenter = (farm) =>
  toValidCoordinate(farm?.lat, -90, 90) !== null &&
  toValidCoordinate(farm?.lng, -180, 180) !== null;

const offsetCoordinate = ({ lat, lng }, northKm, eastKm) => {
  const nextLat = lat + northKm / 110.574;
  const nextLng = lng + eastKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { lat: Number(nextLat.toFixed(6)), lng: Number(nextLng.toFixed(6)) };
};

const generateFarmBoundary = (center) => [
  offsetCoordinate(center, 1.1, -1.5),
  offsetCoordinate(center, 1.8, 0.2),
  offsetCoordinate(center, 0.9, 1.8),
  offsetCoordinate(center, -0.8, 1.5),
  offsetCoordinate(center, -1.4, -0.4),
  offsetCoordinate(center, -0.5, -1.7),
];

const getBoundaryCenter = (boundary) => {
  const validPoints = (boundary || []).filter((point) => hasFarmCenter(point));
  if (!validPoints.length) return null;
  const total = validPoints.reduce(
    (acc, point) => ({
      lat: acc.lat + Number(point.lat),
      lng: acc.lng + Number(point.lng),
    }),
    { lat: 0, lng: 0 },
  );
  return {
    lat: Number((total.lat / validPoints.length).toFixed(6)),
    lng: Number((total.lng / validPoints.length).toFixed(6)),
  };
};

const getAlertCoordinate = (
  distanceKm,
  bearingDeg,
  center = DEFAULT_MAP_CENTER,
) => {
  const radians = (bearingDeg * Math.PI) / 180;
  return offsetCoordinate(
    center,
    Math.cos(radians) * distanceKm,
    Math.sin(radians) * distanceKm,
  );
};

const DEFAULT_FARM = {
  name: "Fazenda Boa Vista",
  crop: "Soja",
  place: "",
  area: 120,
  radius: 10,
  emailAlerts: true,
  lat: null,
  lng: null,
  boundary: [],
  updatedAt: null,
};

const mapFarmRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.nome || row.name || "",
  crop: row.cultura || row.crop || "",
  place: row.localizacao || row.place || "",
  area: row.area_hectares ?? row.area ?? "",
  radius: row.raio_alerta_km ?? row.radius ?? 5,
  emailAlerts: row.receber_email ?? row.email_alerts ?? true,
  lat: toValidCoordinate(row.latitude ?? row.lat, -90, 90),
  lng: toValidCoordinate(row.longitude ?? row.lng, -180, 180),
  boundary: Array.isArray(row.boundary)
    ? row.boundary.filter((point) => hasFarmCenter(point))
    : Array.isArray(row.poligono)
      ? row.poligono.filter((point) => hasFarmCenter(point))
      : [],
  updatedAt: row.updated_at || row.created_at || null,
});

const getFarmPayload = (farm, userId) => ({
  user_id: userId,
  nome: farm.name || "Lavoura sem nome",
  cultura: farm.crop || null,
  localizacao: farm.place || null,
  area_hectares: Number(farm.area) || null,
  raio_alerta_km: Number(farm.radius) || 5,
  receber_email: Boolean(farm.emailAlerts),
  latitude: hasFarmCenter(farm) ? Number(farm.lat) : null,
  longitude: hasFarmCenter(farm) ? Number(farm.lng) : null,
  boundary: Array.isArray(farm.boundary) ? farm.boundary : [],
});

const calculateDistanceKm = (from, to) => {
  if (!hasFarmCenter(from) || !hasFarmCenter(to)) return null;
  const earthRadiusKm = 6371;
  const lat1 = (Number(from.lat) * Math.PI) / 180;
  const lat2 = (Number(to.lat) * Math.PI) / 180;
  const deltaLat = ((Number(to.lat) - Number(from.lat)) * Math.PI) / 180;
  const deltaLng = ((Number(to.lng) - Number(from.lng)) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const predictionToAlert = (prediction, farm) => {
  if (prediction.isPublicAreaAlert) {
    if (
      prediction.target_farm_id &&
      farm.id &&
      prediction.target_farm_id !== farm.id
    )
      return null;
    const lat = toValidCoordinate(prediction.latitude, -90, 90);
    const lng = toValidCoordinate(prediction.longitude, -180, 180);
    if (lat === null || lng === null || !hasFarmCenter(farm)) return null;

    const createdAt = prediction.created_at
      ? new Date(prediction.created_at)
      : null;
    const name = displayPestName(
      prediction.pestes?.nome_comum || prediction.label,
    );
    const risk = prediction.pestes?.nivel_risco || "medio";
    return {
      id: prediction.id,
      name,
      distance: Number(prediction.distance_km || 0),
      risk,
      color: riskColor(risk),
      lat,
      lng,
      areaRadiusKm: Number(prediction.area_radius_km || 1.5),
      date: createdAt ? createdAt.toLocaleDateString("pt-BR") : "Sem data",
      time: createdAt
        ? createdAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      description: `${name} detectada em uma região dentro da área de alerta da sua lavoura.`,
      recommendation:
        prediction.pestes?.acoes_recomendadas ||
        "Abra o catálogo de pragas para ver recomendações cadastradas.",
      approximate: true,
      areaLabel: farm.name || "sua lavoura",
      prediction,
    };
  }

  const lat = toValidCoordinate(
    prediction.latitude ??
      prediction.lat ??
      prediction.localizacao?.lat ??
      prediction.location?.lat,
    -90,
    90,
  );
  const lng = toValidCoordinate(
    prediction.longitude ??
      prediction.lng ??
      prediction.localizacao?.lng ??
      prediction.location?.lng,
    -180,
    180,
  );
  if (lat === null || lng === null || !hasFarmCenter(farm)) return null;

  const distance = calculateDistanceKm(farm, { lat, lng });
  if (distance === null || distance > Number(farm.radius || 0)) return null;

  const createdAt = prediction.created_at
    ? new Date(prediction.created_at)
    : null;
  const name = displayPestName(
    prediction.pestes?.nome_comum || prediction.label,
  );
  const risk = prediction.pestes?.nivel_risco || "medio";
  return {
    id: prediction.id,
    name,
    distance,
    risk,
    color: riskColor(risk),
    lat,
    lng,
    date: createdAt ? createdAt.toLocaleDateString("pt-BR") : "Sem data",
    time: createdAt
      ? createdAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    description: `${name} detectada a ${distance.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km da lavoura.`,
    recommendation:
      prediction.pestes?.acoes_recomendadas ||
      "Abra o catálogo de pragas para ver recomendações cadastradas.",
    approximate: false,
    prediction,
  };
};

const loadReadNotifications = () => {
  try {
    return JSON.parse(
      window.localStorage.getItem(NOTIFICATION_READ_STORAGE_KEY) || "[]",
    );
  } catch {
    return [];
  }
};

const saveReadNotifications = (ids) => {
  window.localStorage.setItem(
    NOTIFICATION_READ_STORAGE_KEY,
    JSON.stringify(ids),
  );
};

const getAlertsForFarm = (farm, predictions) =>
  (predictions || [])
    .map((prediction) => predictionToAlert(prediction, farm))
    .filter(Boolean);

const formatSupabaseDataError = (error) => {
  const message = error?.message || String(error || "");
  if (error?.code === "PGRST205" || message.includes("public.lavouras")) {
    return "A tabela real de lavouras ainda não existe no Supabase. Execute o arquivo supabase-lavouras.sql no SQL Editor do Supabase e recarregue a página.";
  }
  if (message.includes("latitude") || message.includes("longitude")) {
    return "As colunas latitude/longitude ainda não existem em predictions. Execute o arquivo supabase-lavouras.sql no Supabase.";
  }
  if (message.includes("ativa")) {
    return "A coluna ativa ainda não existe em predictions. Execute o arquivo supabase-predictions-ativa.sql no SQL Editor do Supabase.";
  }
  if (
    message.includes("public.alertas_publicos") ||
    message.includes("alertas_publicos")
  ) {
    return "A tabela real de alertas públicos ainda não existe no Supabase. Execute o arquivo supabase-lavouras.sql no SQL Editor do Supabase e recarregue a página.";
  }
  return message;
};

async function getCurrentUserOrThrow() {
  const { data, error } = await withTimeout(supabase.auth.getUser(), "Sessao");
  if (error || !data.user) {
    throw new Error("Faça login para acessar os dados de localização.");
  }
  return data.user;
}

async function loadRealFarms() {
  const user = await getCurrentUserOrThrow();
  const { data, error } = await withTimeout(
    supabase
      .from("lavouras")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    "Consulta de lavouras",
  );
  if (error) throw new Error(formatSupabaseDataError(error));
  return { user, farms: (data || []).map(mapFarmRow) };
}

async function loadRealPredictions() {
  const user = await getCurrentUserOrThrow();
  const [ownResult, publicResult] = await Promise.all([
    withTimeout(
      supabase
        .from("predictions")
        .select(
          `
          *,
          pestes (
            id,
            nome_comum,
            nivel_risco,
            acoes_recomendadas
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500),
      "Consulta das suas análises",
    ),
    withTimeout(
      supabase
        .from("alertas_publicos")
        .select(
          "id,label,confianca,latitude,longitude,nivel_risco,recomendacao,distance_km,area_radius_km,created_at,prediction_id,target_farm_id",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      "Consulta de alertas publicos",
    ),
  ]);

  if (ownResult.error)
    throw new Error(formatSupabaseDataError(ownResult.error));
  if (publicResult.error)
    throw new Error(formatSupabaseDataError(publicResult.error));

  const publicAlerts = (publicResult.data || []).map((row) => ({
    id: `alerta-${row.id}`,
    prediction_id: row.prediction_id,
    target_farm_id: row.target_farm_id,
    label: row.label,
    confianca: row.confianca,
    latitude: row.latitude,
    longitude: row.longitude,
    distance_km: row.distance_km,
    area_radius_km: row.area_radius_km,
    created_at: row.created_at,
    isPublicAreaAlert: true,
    pestes: {
      nome_comum: row.label,
      nivel_risco: row.nivel_risco || "medio",
      acoes_recomendadas: row.recomendacao,
    },
  }));

  const activeOwnPredictions = (ownResult.data || []).filter(
    (prediction) => prediction.ativa !== false,
  );
  return [...activeOwnPredictions, ...publicAlerts];
}

async function updatePredictionActive(predictionId, ativa) {
  if (!predictionId) throw new Error("Analise invalida.");
  const { data, error } = await withTimeout(
    supabase.auth.getSession(),
    "Sessao",
  );
  if (error || !data.session?.access_token) {
    throw new Error("Sessão inválida para atualizar análise.");
  }

  const response = await withTimeout(
    fetch(`${API_BASE_URL}/predictions/${predictionId}/active`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ativa }),
    }),
    "Atualização da análise",
    20000,
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || "Não foi possível atualizar a análise.");
  }
  return body.prediction;
}

async function loadPublicAreaAlerts() {
  await getCurrentUserOrThrow();
  const { data, error } = await withTimeout(
    supabase
      .from("alertas_publicos")
      .select(
        "id,label,confianca,latitude,longitude,nivel_risco,recomendacao,distance_km,area_radius_km,created_at,prediction_id,target_farm_id,notified_email_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    "Consulta de alertas da área",
  );
  if (error) throw new Error(formatSupabaseDataError(error));
  return data || [];
}

async function syncFarmHistoricalAlerts(farmId) {
  if (!farmId) return null;
  const { data, error } = await withTimeout(
    supabase.auth.getSession(),
    "Sessao",
  );
  if (error || !data.session?.access_token) {
    throw new Error("Sessão inválida para sincronizar alertas.");
  }

  const response = await withTimeout(
    fetch(`${API_BASE_URL}/farms/${farmId}/sync-alerts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    }),
    "Sincronização de alertas",
    30000,
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body.detail || "Não foi possível sincronizar alertas antigos.",
    );
  }
  return body;
}

async function syncFarmsHistoricalAlerts(farms = []) {
  for (const farm of farms) {
    if (!farm?.id || !hasFarmCenter(farm)) continue;
    try {
      await syncFarmHistoricalAlerts(farm.id);
    } catch (error) {
      console.warn(
        "Falha ao sincronizar alertas antigos da lavoura:",
        farm.id,
        error,
      );
    }
  }
}

function RealMap({
  farm,
  alerts = [],
  interactive = false,
  onAddPoint,
  height = 320,
}) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const overlayRef = useRef(null);
  const areaLabelZoomHandlerRef = useRef(null);
  const onAddPointRef = useRef(onAddPoint);
  const [layer, setLayer] = useState("street");
  const farmHasCenter = hasFarmCenter(farm);
  const mapCenter = farmHasCenter
    ? [Number(farm.lat), Number(farm.lng)]
    : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
  const boundary = Array.isArray(farm.boundary)
    ? farm.boundary.filter((point) => hasFarmCenter(point))
    : [];

  useEffect(() => {
    onAddPointRef.current = onAddPoint;
  }, [onAddPoint]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(mapCenter, farmHasCenter ? 13 : 4);

    overlayRef.current = L.layerGroup().addTo(map);
    map.on("click", (event) => {
      if (onAddPointRef.current) {
        onAddPointRef.current({
          lat: Number(event.latlng.lat.toFixed(6)),
          lng: Number(event.latlng.lng.toFixed(6)),
        });
      }
    });
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileRef.current) {
      map.removeLayer(tileRef.current);
    }

    const satellite = layer === "satellite";
    tileRef.current = L.tileLayer(
      satellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: satellite
          ? "Tiles &copy; Esri"
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(map);
  }, [layer]);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();
    if (areaLabelZoomHandlerRef.current) {
      map.off("zoomend", areaLabelZoomHandlerRef.current);
      areaLabelZoomHandlerRef.current = null;
    }

    const farmCenter = farmHasCenter
      ? L.latLng(mapCenter[0], mapCenter[1])
      : null;
    const boundaryLatLngs = boundary.map((point) => [point.lat, point.lng]);

    if (farmCenter) {
      L.circle(farmCenter, {
        radius: Number(farm.radius || 10) * 1000,
        color: C.green,
        weight: 2,
        dashArray: "8 8",
        fillColor: C.green,
        fillOpacity: 0.15,
        opacity: 0.9,
      }).addTo(overlay);
    }

    if (boundaryLatLngs.length >= 3) {
      L.polygon(boundaryLatLngs, {
        color: C.greenLime,
        weight: 3,
        fillColor: C.green,
        fillOpacity: 0.26,
      }).addTo(overlay);
      boundaryLatLngs.forEach((point) => {
        L.circleMarker(point, {
          radius: 5,
          color: C.greenLime,
          fillColor: C.bg,
          fillOpacity: 1,
          weight: 2,
        }).addTo(overlay);
      });
    } else {
      boundaryLatLngs.forEach((point) => {
        L.circleMarker(point, {
          radius: 5,
          color: C.greenLime,
          fillColor: C.bg,
          fillOpacity: 1,
          weight: 2,
        }).addTo(overlay);
      });
      if (boundaryLatLngs.length === 2) {
        L.polyline(boundaryLatLngs, {
          color: C.greenLime,
          weight: 3,
        }).addTo(overlay);
      }
    }

    if (farmCenter) {
      const farmIcon = L.divIcon({
        className: "",
        html: '<div class="map-farm-pin"></div>',
        iconSize: [42, 42],
        iconAnchor: [21, 42],
      });
      L.marker(farmCenter, { icon: farmIcon, interactive: false }).addTo(
        overlay,
      );
      L.tooltip({
        permanent: true,
        direction: "bottom",
        offset: [0, 10],
        className: "map-farm-label",
      })
        .setLatLng(farmCenter)
        .setContent("Sua lavoura")
        .addTo(overlay);

      const approximateGroups = new Map();
      alerts
        .filter((alert) => alert.approximate)
        .forEach((alert) => {
          const key = `${Number(alert.lat).toFixed(5)}:${Number(alert.lng).toFixed(5)}:${Number(alert.areaRadiusKm || 1.5).toFixed(2)}`;
          const current = approximateGroups.get(key) || {
            lat: alert.lat,
            lng: alert.lng,
            areaRadiusKm: Number(alert.areaRadiusKm || 1.5),
            color: alert.color,
            alerts: [],
          };
          current.alerts.push(alert);
          approximateGroups.set(key, current);
        });

      approximateGroups.forEach((group) => {
        const center = L.latLng(group.lat, group.lng);
        const uniqueAlerts = Array.from(
          group.alerts
            .reduce((items, alert) => {
              const key = normalizePestKey(alert.name);
              const current = items.get(key);
              if (current) {
                current.count += 1;
              } else {
                items.set(key, { ...alert, count: 1 });
              }
              return items;
            }, new Map())
            .values(),
        );
        const labelHtml = uniqueAlerts
          .map((alert) => {
            const subtitle =
              alert.count > 1
                ? `${alert.count} análises na região`
                : "Região provável";
            return `<span class="area-alert-line"><strong>${escapeMapHtml(alert.name)}</strong><span>${escapeMapHtml(subtitle)}</span></span>`;
          })
          .join("");
        L.circle(center, {
          radius: Number(group.areaRadiusKm || 1.5) * 1000,
          color: group.color,
          weight: 2,
          dashArray: "7 7",
          fillColor: group.color,
          fillOpacity: 0.18,
          opacity: 0.95,
        }).addTo(overlay);
        const tooltip = L.tooltip({
          permanent: true,
          direction: "center",
          className: "map-area-label",
        })
          .setLatLng(center)
          .setContent(labelHtml)
          .addTo(overlay);
      });

      alerts.forEach((alert) => {
        if (alert.approximate) {
          return;
        }

        const alertIcon = L.divIcon({
          className: "",
          html: `<div style="color:${alert.color};--alert-color:${alert.color}"><div class="map-alert-pin"></div><div class="map-alert-label"><strong>${alert.name}</strong><span>${alert.distance.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km</span></div></div>`,
          iconSize: [170, 68],
          iconAnchor: [14, 42],
        });
        L.marker([alert.lat, alert.lng], {
          icon: alertIcon,
          interactive: false,
        }).addTo(overlay);
      });
    }

    const visiblePoints = [
      ...(farmCenter ? [farmCenter] : []),
      ...boundaryLatLngs.map((point) => L.latLng(point[0], point[1])),
      ...(farmCenter
        ? alerts.flatMap((alert) => {
            const point = L.latLng(alert.lat, alert.lng);
            if (!alert.approximate) return [point];
            const radius = Number(alert.areaRadiusKm || 1.5);
            return [
              point,
              L.latLng(offsetCoordinate(alert, radius, 0)),
              L.latLng(offsetCoordinate(alert, -radius, 0)),
              L.latLng(offsetCoordinate(alert, 0, radius)),
              L.latLng(offsetCoordinate(alert, 0, -radius)),
            ];
          })
        : []),
    ];

    if (visiblePoints.length) {
      map.fitBounds(L.latLngBounds(visiblePoints), {
        padding: [26, 26],
        maxZoom: 13,
      });
    } else {
      map.setView(mapCenter, 4);
    }

    const syncAreaLabels = () => {
      mapElementRef.current?.classList.toggle(
        "area-labels-hidden",
        map.getZoom() < 10,
      );
    };
    syncAreaLabels();
    map.on("zoomend", syncAreaLabels);
    areaLabelZoomHandlerRef.current = syncAreaLabels;

    setTimeout(() => map.invalidateSize(), 80);
  }, [farm.lat, farm.lng, farm.radius, farm.boundary, alerts]);

  return (
    <div
      style={{
        position: "relative",
        height,
        minHeight: 260,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.bgCard,
      }}
    >
      <div
        ref={mapElementRef}
        className="visiagro-map"
        style={{
          height: "100%",
          width: "100%",
          cursor: interactive ? "crosshair" : "grab",
        }}
      />
      <div className="map-layer-toggle">
        {[
          ["satellite", "Satélite"],
          ["street", "Ruas"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setLayer(id)}
            style={{
              background:
                layer === id
                  ? `linear-gradient(135deg,${C.green},${C.greenLime})`
                  : "transparent",
              color: layer === id ? C.accentText : C.textSub,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 14,
          zIndex: 500,
          padding: "9px 12px",
          borderRadius: 12,
          background: C.mapControl,
          border: `1px solid ${C.border}`,
          color: C.textSub,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <IcoTarget />{" "}
        {farmHasCenter ? "Posição da lavoura" : "Clique no mapa para marcar"}
      </div>
    </div>
  );
}

function StatCard({ Icon, value, label, accent = C.green }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ color: accent, lineHeight: 0 }}>
        <Icon />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: C.text,
          }}
        >
          {value}
        </div>
        <div style={{ color: C.textSub, fontSize: 13, fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function CadastroLavouraScreen({ setScreen, farmToEdit }) {
  const isDesktop = useIsDesktop();
  const [farm, setFarm] = useState(() => farmToEdit || DEFAULT_FARM);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [manualCoords, setManualCoords] = useState(() => ({
    lat: String((farmToEdit || DEFAULT_FARM).lat ?? ""),
    lng: String((farmToEdit || DEFAULT_FARM).lng ?? ""),
  }));
  const nearbyAlerts = [];

  const updateFarm = (patch) =>
    setFarm((current) => ({ ...current, ...patch }));

  useEffect(() => {
    setManualCoords({
      lat: String(farm.lat ?? ""),
      lng: String(farm.lng ?? ""),
    });
  }, [farm.lat, farm.lng]);

  const applyFarmCenter = (center, place, successMessage) => {
    updateFarm({
      ...center,
      boundary: generateFarmBoundary(center),
      place: place || farm.place || "Localização definida",
    });
    setStatus(successMessage);
  };

  const addBoundaryPoint = (point) => {
    setFarm((current) => {
      const currentBoundary =
        current.boundary?.length >= 6 ? [] : current.boundary || [];
      const nextBoundary = [...currentBoundary, point];
      const nextCenter = getBoundaryCenter(nextBoundary) || point;
      return {
        ...current,
        ...nextCenter,
        place: current.place || "Localização demarcada no mapa",
        boundary: nextBoundary,
      };
    });
    setStatus("Ponto adicionado na demarcação. Clique em salvar para manter.");
  };

  const getGeolocationErrorMessage = (error) => {
    if (
      !window.isSecureContext &&
      !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    ) {
      return "Geolocalização só funciona em HTTPS ou localhost. Abra pelo localhost/HTTPS ou marque a lavoura no mapa.";
    }

    if (error?.code === 1) {
      return "Permissão negada. Libere a localização no navegador e tente novamente.";
    }
    if (error?.code === 2) {
      return "O navegador não encontrou sua posição. Busque pelo endereço ou marque a lavoura no mapa.";
    }
    if (error?.code === 3) {
      return "A localização atual demorou demais. Busque pelo endereço ou marque a lavoura no mapa.";
    }
    return "Não foi possível acessar sua localização. Você pode informar manualmente.";
  };

  const requestBrowserPosition = (options) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setStatus(
        "Seu navegador não oferece geolocalização. Busque pelo endereço, clique no mapa ou informe latitude e longitude.",
      );
      return;
    }

    setGeoLoading("precise");
    setStatus("Buscando localização do navegador...");

    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permission.state === "denied") {
          setGeoLoading(false);
          setStatus(
            "Permissão de localização bloqueada. No navegador, libere a localização deste site e tente novamente.",
          );
          return;
        }
      } catch {
        // Alguns navegadores não permitem consultar essa permissão antes do prompt.
      }
    }

    try {
      let position;
      try {
        position = await requestBrowserPosition({
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: Infinity,
        });
      } catch {
        position = await requestBrowserPosition({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
      }

      const nextCenter = {
        lat: Number(position.coords.latitude.toFixed(5)),
        lng: Number(position.coords.longitude.toFixed(5)),
      };
      applyFarmCenter(
        nextCenter,
        "Localização atual detectada",
        "Localização atual aplicada. Salve para manter.",
      );
    } catch (error) {
      setStatus(getGeolocationErrorMessage(error));
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSearchAddress = async () => {
    const query = farm.place.trim();
    if (!query) {
      setStatus("Digite uma cidade, fazenda ou endereço para buscar no mapa.");
      return;
    }

    setGeoLoading("address");
    setStatus("Buscando localização pelo endereço informado...");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`,
      );
      const results = await response.json();
      const result = results?.[0];

      if (!result) {
        setStatus(
          "Não encontrei esse endereço. Tente cidade/UF, fazenda + município ou informe latitude e longitude.",
        );
        return;
      }

      const nextCenter = {
        lat: Number(Number(result.lat).toFixed(5)),
        lng: Number(Number(result.lon).toFixed(5)),
      };
      applyFarmCenter(
        nextCenter,
        result.display_name || query,
        "Endereço encontrado no mapa. Ajuste a demarcação e salve.",
      );
    } catch (error) {
      setStatus(`Não foi possível buscar o endereço: ${error.message}`);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleApplyManualCoords = () => {
    const lat = Number(String(manualCoords.lat).replace(",", "."));
    const lng = Number(String(manualCoords.lng).replace(",", "."));

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setStatus(
        "Informe coordenadas válidas. Latitude entre -90 e 90, longitude entre -180 e 180.",
      );
      return;
    }

    const nextCenter = {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    };
    applyFarmCenter(
      nextCenter,
      farm.place || "Localização manual",
      "Coordenadas aplicadas. Salve para manter.",
    );
  };

  const handleSave = () => {
    async function save() {
      if (!farm.name?.trim()) {
        setStatus("Informe o nome da lavoura.");
        return;
      }
      if (!hasFarmCenter(farm)) {
        setStatus(
          "Marque a lavoura no mapa, busque pelo endereço ou informe latitude e longitude.",
        );
        return;
      }

      setSaving(true);
      setStatus("");
      try {
        const user = await getCurrentUserOrThrow();
        const payload = getFarmPayload(farm, user.id);
        const request = farm.id
          ? supabase
              .from("lavouras")
              .update(payload)
              .eq("id", farm.id)
              .eq("user_id", user.id)
              .select("*")
              .single()
          : supabase.from("lavouras").insert(payload).select("*").single();
        const { data, error } = await withTimeout(request, "Salvar lavoura");
        if (error) throw error;
        const savedFarm = mapFarmRow(data);
        setFarm(savedFarm);
        setStatus("Lavoura salva. Buscando alertas antigos dentro do raio...");
        try {
          const syncResult = await syncFarmHistoricalAlerts(savedFarm.id);
          const created = Number(syncResult?.created || 0);
          const matched = Number(syncResult?.matched || 0);
          setStatus(
            matched > 0
              ? `Lavoura salva. ${created} alerta${created === 1 ? "" : "s"} antigo${created === 1 ? "" : "s"} sincronizado${created === 1 ? "" : "s"} dentro do raio.`
              : "Lavoura salva. Nenhum alerta antigo encontrado dentro do raio.",
          );
        } catch (syncError) {
          setStatus(
            `Lavoura salva, mas não foi possível buscar alertas antigos: ${syncError.message}`,
          );
        }
        setTimeout(() => setScreen("lavouras"), 600);
      } catch (error) {
        setStatus(`Erro ao salvar lavoura: ${formatSupabaseDataError(error)}`);
      } finally {
        setSaving(false);
      }
    }

    save();
  };

  const formInput = {
    width: "100%",
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "13px 15px",
    color: C.text,
    fontSize: 14,
  };

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader
        title="Cadastro de lavoura"
        onBack={() => setScreen("lavouras")}
      />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "minmax(0, 1.08fr) minmax(320px, .92fr)"
              : "1fr",
            gap: 22,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <InfoCard>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    background: C.bgLight,
                    color: C.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IcoMapPin size={26} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    Dados da propriedade
                  </h3>
                  <p style={{ color: C.textSub, fontSize: 13 }}>
                    Essas informações ativam alertas de pragas próximas da sua
                    lavoura.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gap: 13 }}>
                <label style={{ color: C.textSub, fontSize: 13 }}>
                  Nome da propriedade
                  <input
                    value={farm.name}
                    onChange={(e) => updateFarm({ name: e.target.value })}
                    style={{ ...formInput, marginTop: 7 }}
                  />
                </label>
                <label style={{ color: C.textSub, fontSize: 13 }}>
                  Cultura principal
                  <select
                    value={farm.crop}
                    onChange={(e) => updateFarm({ crop: e.target.value })}
                    style={{ ...formInput, marginTop: 7 }}
                  >
                    {[
                      "Soja",
                      "Milho",
                      "Algodão",
                      "Feijão",
                      "Café",
                      "Trigo",
                    ].map((crop) => (
                      <option
                        key={crop}
                        value={crop}
                        style={{ background: C.bgCard }}
                      >
                        {crop}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ color: C.textSub, fontSize: 13 }}>
                  Localização da lavoura
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isDesktop
                        ? "minmax(0, 1fr) auto auto"
                        : "1fr",
                      gap: 10,
                      marginTop: 7,
                    }}
                  >
                    <input
                      value={farm.place}
                      onChange={(e) => updateFarm({ place: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchAddress();
                        }
                      }}
                      placeholder="Digite cidade, UF, fazenda ou endereço"
                      style={formInput}
                    />
                    <button
                      onClick={handleSearchAddress}
                      disabled={geoLoading}
                      style={{
                        minHeight: 48,
                        padding: "0 16px",
                        borderRadius: 12,
                        background: C.bgCard,
                        border: `1px solid ${C.borderLight}`,
                        color: C.green,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: geoLoading ? 0.75 : 1,
                      }}
                    >
                      <IcoMap />{" "}
                      {geoLoading === "address"
                        ? "Buscando..."
                        : "Buscar no mapa"}
                    </button>
                    <button
                      onClick={handleUseLocation}
                      disabled={geoLoading}
                      style={{
                        minHeight: 48,
                        padding: "0 16px",
                        borderRadius: 12,
                        background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
                        color: C.accentText,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: geoLoading ? 0.75 : 1,
                      }}
                    >
                      <IcoTarget />{" "}
                      {geoLoading === "precise"
                        ? "Buscando..."
                        : "Usar minha localização"}
                    </button>
                  </div>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "1fr 1fr auto" : "1fr",
                    gap: 10,
                  }}
                >
                  <label style={{ color: C.textSub, fontSize: 13 }}>
                    Latitude
                    <input
                      value={manualCoords.lat}
                      onChange={(e) =>
                        setManualCoords((current) => ({
                          ...current,
                          lat: e.target.value,
                        }))
                      }
                      placeholder="-13.83140"
                      inputMode="decimal"
                      style={{ ...formInput, marginTop: 7 }}
                    />
                  </label>
                  <label style={{ color: C.textSub, fontSize: 13 }}>
                    Longitude
                    <input
                      value={manualCoords.lng}
                      onChange={(e) =>
                        setManualCoords((current) => ({
                          ...current,
                          lng: e.target.value,
                        }))
                      }
                      placeholder="-56.07420"
                      inputMode="decimal"
                      style={{ ...formInput, marginTop: 7 }}
                    />
                  </label>
                  <button
                    onClick={handleApplyManualCoords}
                    style={{
                      alignSelf: "end",
                      minHeight: 48,
                      padding: "0 16px",
                      borderRadius: 12,
                      border: `1px solid ${C.borderLight}`,
                      color: C.green,
                      fontWeight: 800,
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                    gap: 14,
                  }}
                >
                  <label style={{ color: C.textSub, fontSize: 13 }}>
                    Área plantada
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        marginTop: 7,
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        value={farm.area}
                        onChange={(e) => updateFarm({ area: e.target.value })}
                        style={{ ...formInput, borderRadius: "12px 0 0 12px" }}
                      />
                      <div
                        style={{
                          padding: "13px 14px",
                          background: C.bgLight,
                          border: `1px solid ${C.border}`,
                          borderLeft: 0,
                          borderRadius: "0 12px 12px 0",
                          color: C.textSub,
                          fontWeight: 700,
                        }}
                      >
                        hectares
                      </div>
                    </div>
                  </label>
                  <div>
                    <div
                      style={{
                        color: C.textSub,
                        fontSize: 13,
                        marginBottom: 7,
                      }}
                    >
                      Raio de alerta
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                      }}
                    >
                      {[5, 10, 20].map((radius) => {
                        const selected = Number(farm.radius) === radius;
                        return (
                          <button
                            key={radius}
                            onClick={() => updateFarm({ radius })}
                            style={{
                              padding: "13px 10px",
                              borderRadius: 12,
                              background: selected
                                ? `linear-gradient(135deg,${C.green},${C.greenLime})`
                                : C.bgCard,
                              color: selected ? C.accentText : C.textSub,
                              border: `1px solid ${selected ? "transparent" : C.border}`,
                              fontWeight: 800,
                            }}
                          >
                            {radius} km
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => updateFarm({ emailAlerts: !farm.emailAlerts })}
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>
                      Receber alertas por e-mail
                    </div>
                    <div
                      style={{ color: C.textSub, fontSize: 12, marginTop: 3 }}
                    >
                      Receba notificações sobre pragas dentro do raio
                      selecionado.
                    </div>
                  </div>
                  <div
                    style={{
                      width: 58,
                      height: 32,
                      padding: 3,
                      borderRadius: 20,
                      background: farm.emailAlerts
                        ? `linear-gradient(135deg,${C.green},${C.greenLime})`
                        : C.bgLight,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: C.text,
                        transform: farm.emailAlerts
                          ? "translateX(25px)"
                          : "translateX(0)",
                        transition: "transform .2s",
                      }}
                    />
                  </div>
                </button>

                <div
                  style={{
                    background: C.bgLight,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 12,
                    color: C.textSub,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: C.green, lineHeight: 0 }}>
                    <IcoShield />
                  </div>
                  <div>
                    Sua localização é opcional. Se o navegador não conseguir
                    detectar, clique no mapa ou informe latitude e longitude
                    antes de salvar.
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>

          <div style={{ minWidth: 0 }}>
            <RealMap
              farm={farm}
              alerts={nearbyAlerts}
              interactive
              onAddPoint={addBoundaryPoint}
              height={430}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 12,
              }}
            >
              <button
                onClick={() =>
                  updateFarm({ boundary: [], lat: null, lng: null, place: "" })
                }
                style={{
                  padding: "14px",
                  borderRadius: 13,
                  border: `1px solid ${C.border}`,
                  color: C.textSub,
                  fontWeight: 800,
                }}
              >
                Limpar demarcação
              </button>
              <button
                onClick={() => setScreen("localizacao")}
                style={{
                  padding: "14px",
                  borderRadius: 13,
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  color: C.green,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <IcoMap /> Ver mapa
              </button>
            </div>
          </div>
        </div>

        <button
          disabled={saving}
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 15,
            background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
            color: C.accentText,
            fontWeight: 900,
            fontSize: 16,
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: saving ? 0.75 : 1,
          }}
        >
          <IcoSave /> {saving ? "Salvando..." : "Salvar lavoura"}
        </button>
        {status && (
          <div
            style={{
              marginTop: 12,
              color:
                status.includes("Erro") ||
                status.includes("Informe") ||
                status.includes("Marque") ||
                status.includes("Não")
                  ? C.warn
                  : C.green,
              fontSize: 13,
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

function LavourasScreen({ setScreen, onEdit, onNew }) {
  const isDesktop = useIsDesktop();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { farms: loadedFarms } = await loadRealFarms();
        if (active) setFarms(loadedFarms);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader
        title="Lavouras cadastradas"
        onBack={() => setScreen("localizacao")}
      />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <button
          onClick={onNew}
          style={{
            width: "100%",
            padding: "15px 16px",
            borderRadius: 14,
            background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
            color: C.accentText,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <IcoMapPin /> Cadastrar nova lavoura
        </button>
        {loading && <LoadingState label="Carregando lavouras..." />}
        {error && <EmptyState label={`Erro ao carregar lavouras: ${error}`} />}
        {!loading && !error && farms.length === 0 && (
          <EmptyState label="Nenhuma lavoura cadastrada." />
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "repeat(2, minmax(0, 1fr))"
              : "1fr",
            gap: 12,
          }}
        >
          {farms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => onEdit(farm)}
              style={{
                textAlign: "left",
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "16px 18px",
                display: "grid",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <strong style={{ fontSize: 16 }}>{farm.name}</strong>
                <Badge color={C.green}>{farm.radius} km</Badge>
              </div>
              <div style={{ color: C.textSub, fontSize: 13 }}>
                {farm.crop || "Cultura não informada"} • {farm.area || "--"} ha
              </div>
              <div style={{ color: C.textSub, fontSize: 12 }}>
                {farm.place || "Localização sem descrição"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapaAlertasScreen({ setScreen, onOpenPest }) {
  const isDesktop = useIsDesktop();
  const [farms, setFarms] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { farms: loadedFarms } = await loadRealFarms();
        await syncFarmsHistoricalAlerts(loadedFarms);
        const loadedPredictions = await loadRealPredictions();
        if (!active) return;
        setFarms(loadedFarms);
        setPredictions(loadedPredictions);
        setSelectedFarmId((current) => current || loadedFarms[0]?.id || "");
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedFarm =
    farms.find((farm) => farm.id === selectedFarmId) ||
    farms[0] ||
    DEFAULT_FARM;
  const alerts = hasFarmCenter(selectedFarm)
    ? getAlertsForFarm(selectedFarm, predictions)
    : [];
  const selectedAlert =
    alerts.find((alert) => alert.id === selectedAlertId) || alerts[0] || null;

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "20px 20px 0",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          Mapa de alertas
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setScreen("lavouras")}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.borderLight}`,
              color: C.accentText,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IcoMapPin /> Lavouras cadastradas
          </button>
          <button
            onClick={() => setScreen("notificacoes")}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              color: C.accentText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IcoBell />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        {loading && <LoadingState label="Carregando mapa de alertas..." />}
        {error && (
          <EmptyState label={`Erro ao carregar dados reais: ${error}`} />
        )}
        {!loading && !error && (
          <>
            {farms.length > 1 && (
              <div style={{ marginBottom: 14 }}>
                <select
                  value={selectedFarm.id || ""}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  style={{
                    width: "100%",
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "13px 15px",
                    color: C.text,
                    fontSize: 14,
                  }}
                >
                  {farms.map((farm) => (
                    <option
                      key={farm.id}
                      value={farm.id}
                      style={{ background: C.bgCard }}
                    >
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <StatCard
                Icon={IcoMapPin}
                value={farms.length}
                label={
                  farms.length === 1
                    ? "lavoura cadastrada"
                    : "lavouras cadastradas"
                }
              />
              <StatCard
                Icon={IcoBell}
                value={alerts.length}
                label="alertas próximos"
                accent={C.warn}
              />
              <StatCard
                Icon={IcoTarget}
                value={
                  hasFarmCenter(selectedFarm) ? `${selectedFarm.radius}` : "--"
                }
                label="km raio de alerta"
              />
            </div>

            {farms.length === 0 ? (
              <EmptyState label="Cadastre uma lavoura para visualizar alertas no mapa." />
            ) : (
              <RealMap farm={selectedFarm} alerts={alerts} height={390} />
            )}

            {farms.length > 0 && alerts.length === 0 && (
              <div style={{ marginTop: 16 }}>
                <EmptyState label="Nenhum alerta real com coordenadas encontrado dentro do raio desta lavoura." />
              </div>
            )}

            {selectedAlert && (
              <div
                style={{
                  marginTop: 16,
                  background: C.bgCard,
                  border: `1px solid ${selectedAlert.color}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                  display: "grid",
                  gridTemplateColumns: isDesktop
                    ? "auto minmax(0, 1fr) auto"
                    : "1fr",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: "50%",
                    background: C.bgLight,
                    border: `1px solid ${C.border}`,
                    color: selectedAlert.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IcoBug />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: 20,
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    {selectedAlert.name} detectada
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                      color: C.textSub,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <IcoPin />{" "}
                      {selectedAlert.approximate
                        ? `Região provável: raio de ${selectedAlert.areaRadiusKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`
                        : `Distância: ${selectedAlert.distance.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <IcoRisk /> Nível de risco:{" "}
                      <Badge color={riskColor(selectedAlert.risk)}>
                        {riskLabel(selectedAlert.risk).replace("Risco ", "")}
                      </Badge>
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <IcoCalendar /> {selectedAlert.date} às{" "}
                      {selectedAlert.time}
                    </span>
                  </div>
                  <p style={{ color: C.textSub, fontSize: 13, marginTop: 10 }}>
                    {selectedAlert.recommendation}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onOpenPest?.({
                      name: selectedAlert.name,
                      label: selectedAlert.prediction?.label,
                    })
                  }
                  style={{
                    padding: "13px 16px",
                    borderRadius: 12,
                    background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
                    color: C.accentText,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Recomendações <IcoChevR />
                </button>
              </div>
            )}

            <button
              onClick={() => setScreen("historico")}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "16px",
                borderRadius: 14,
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                color: C.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 800,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IcoHistory /> Ver histórico de análises
              </span>
              <IcoChevR />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NotificacoesScreen({ setScreen, onOpenPest }) {
  const isDesktop = useIsDesktop();
  const [readIds, setReadIds] = useState(loadReadNotifications);
  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { farms } = await loadRealFarms();
        await syncFarmsHistoricalAlerts(farms);
        const [predictions, publicAreaAlerts] = await Promise.all([
          loadRealPredictions(),
          loadPublicAreaAlerts(),
        ]);
        const farmById = new Map(farms.map((farm) => [farm.id, farm]));
        const publicNotifications = publicAreaAlerts.map((alert) => {
          const createdAt = alert.created_at
            ? new Date(alert.created_at)
            : null;
          const name = displayPestName(alert.label);
          const risk = alert.nivel_risco || "medio";
          const farm = farmById.get(alert.target_farm_id);
          const id = `public-${alert.id}`;
          return {
            id,
            title: "Alerta na área da lavoura",
            text: `${name} foi detectada dentro da área de alerta${farm?.name ? ` da lavoura ${farm.name}` : " da sua lavoura"}. A localização exata da detecção não é compartilhada.`,
            date: createdAt
              ? createdAt.toLocaleDateString("pt-BR")
              : "Sem data",
            time: createdAt
              ? createdAt.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--",
            timestamp: createdAt ? createdAt.getTime() : 0,
            tag: readIds.includes(id) ? "Lido" : "Novo",
            color: riskColor(risk),
            Icon: IcoBug,
            primary: "Abrir mapa",
            action: () => setScreen("localizacao"),
            secondary: "Recomendações",
            secondaryAction: () => onOpenPest?.({ name, label: alert.label }),
          };
        });

        const ownPredictions = predictions.filter(
          (prediction) => !prediction.isPublicAreaAlert,
        );
        const ownNotifications = farms.flatMap((farm) =>
          getAlertsForFarm(farm, ownPredictions).map((alert) => ({
            id: `alert-${farm.id}-${alert.id}`,
            title: "Praga registrada no mapa",
            text: `${alert.description} Esta detecção veio de uma análise feita na sua conta.`,
            date: alert.date,
            time: alert.time,
            timestamp: alert.prediction?.created_at
              ? new Date(alert.prediction.created_at).getTime()
              : 0,
            tag: readIds.includes(`alert-${farm.id}-${alert.id}`)
              ? "Lido"
              : "Novo",
            color: alert.color,
            Icon: IcoBug,
            primary: "Abrir mapa",
            action: () => setScreen("localizacao"),
            secondary: "Recomendações",
            secondaryAction: () =>
              onOpenPest?.({
                name: alert.name,
                label: alert.prediction?.label,
              }),
          })),
        );
        const realNotifications = [
          ...publicNotifications,
          ...ownNotifications,
        ].sort((a, b) => b.timestamp - a.timestamp);
        if (active) setNotifications(realNotifications);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [readIds, setScreen, onOpenPest]);

  const toggleRead = (notificationId) => {
    setReadIds((ids) => {
      const next = ids.includes(notificationId)
        ? ids.filter((id) => id !== notificationId)
        : [...ids, notificationId];
      saveReadNotifications(next);
      return next;
    });
  };

  const requestBrowserNotification = async () => {
    if (!("Notification" in window)) {
      setNotice("Este navegador não suporta notificações do sistema.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Visiagro", {
        body: "Alertas de pragas próximas estão ativos.",
      });
      setNotice("Notificações do navegador ativadas.");
    } else {
      setNotice("Permissão de notificação não concedida.");
    }
  };

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader
        title="Central de notificações"
        onBack={() => setScreen("localizacao")}
      />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ color: C.warn }}>
            <IcoBell />
          </div>
          <div>
            <div style={{ fontWeight: 800 }}>Alertas reais</div>
            <div style={{ color: C.textSub, fontSize: 13 }}>
              Gerados a partir de análises com coordenadas dentro do raio de uma
              lavoura cadastrada.
            </div>
          </div>
        </div>

        {loading && <LoadingState label="Carregando notificações..." />}
        {error && (
          <EmptyState label={`Erro ao carregar notificações: ${error}`} />
        )}
        {!loading && !error && notifications.length === 0 && (
          <EmptyState label="Nenhuma notificação real encontrada." />
        )}

        {notifications.map((item) => {
          const isRead = readIds.includes(item.id);
          return (
            <div
              key={item.id}
              style={{
                background: C.bgCard,
                border: `1px solid ${isRead ? C.border : item.color}`,
                borderLeft: `4px solid ${item.color}`,
                borderRadius: 16,
                padding: "18px 18px",
                marginBottom: 14,
                display: "grid",
                gridTemplateColumns: isDesktop
                  ? "auto minmax(0, 1fr) auto"
                  : "1fr",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: C.bgLight,
                  border: `1px solid ${item.color}`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <item.Icon />
              </div>
              <div style={{ minWidth: 0 }}>
                <Badge color={isRead ? C.borderLight : item.color}>
                  {item.tag}
                </Badge>
                <h3
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: 19,
                    fontWeight: 800,
                    margin: "10px 0 5px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: C.textSub,
                    fontSize: 14,
                    lineHeight: 1.55,
                    maxWidth: 720,
                  }}
                >
                  {item.text}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    color: C.textSub,
                    fontSize: 12,
                    marginTop: 12,
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IcoCalendar /> {item.date}
                  </span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IcoClock /> {item.time}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => toggleRead(item.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    color: C.textSub,
                    fontWeight: 800,
                  }}
                >
                  {isRead ? "Reabrir" : "Marcar lida"}
                </button>
                {item.secondaryAction && (
                  <button
                    onClick={item.secondaryAction}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${C.borderLight}`,
                      color: C.green,
                      fontWeight: 800,
                    }}
                  >
                    {item.secondary}
                  </button>
                )}
                <button
                  onClick={item.action}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
                    color: C.accentText,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {item.primary} <IcoChevR />
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={requestBrowserNotification}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            color: C.green,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <IcoBell /> Ativar notificações do navegador
        </button>
        {notice && (
          <div
            style={{
              marginTop: 12,
              color: C.textSub,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {notice}
          </div>
        )}
      </div>
    </div>
  );
}

function PragasScreen({ setScreen, initialPest, onInitialPestConsumed }) {
  const [sel, setSel] = useState(null);
  const [pragas, setPragas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPragas() {
      setLoading(true);
      setError("");
      try {
        const { data, error: loadError } = await withTimeout(
          supabase
            .from("pestes")
            .select(
              `
  id,
  nome_cientifico,
  nome_comum,
  imagem_url,
  descricao_simples,
  nivel_risco,
  periodo_mais_comum,
  acoes_recomendadas,
  danos_causados,
  peste_agrotoxico (
    agrotoxicos (
      id,
      nome_produto,
      ingrediente_ativo
    )
  )
  `,
            )
            .order("nome_comum"),
          "Consulta de pragas",
        );

        if (!active) return;
        if (loadError) {
          setError(loadError.message);
        } else {
          setPragas(data || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPragas();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialPest || loading || !pragas.length) return;

    const requestedId = initialPest.id;
    const requestedName = normalizePestKey(
      initialPest.name || initialPest.nome_comum || initialPest.label,
    );
    const requestedAltName = normalizePestKey(initialPest.nome_cientifico);
    const index = pragas.findIndex((p) => {
      if (requestedId && p.id === requestedId) return true;
      const commonName = normalizePestKey(p.nome_comum);
      const scientificName = normalizePestKey(p.nome_cientifico);
      return (
        (requestedName &&
          (commonName === requestedName || scientificName === requestedName)) ||
        (requestedAltName &&
          (commonName === requestedAltName ||
            scientificName === requestedAltName))
      );
    });

    if (index >= 0) {
      setSel(index);
    }
    onInitialPestConsumed?.();
  }, [initialPest, loading, pragas, onInitialPestConsumed]);

  if (sel !== null) {
    const p = pragas[sel];
    const produtos =
      p?.peste_agrotoxico?.map((rel) => rel.agrotoxicos).filter(Boolean) || [];
    return (
      <div
        className="screen-enter"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <BackHeader title={p.nome_comum} onBack={() => setSel(null)} />
        <div style={{ flex: 1, overflow: "auto", padding: "18px 20px 20px" }}>
          <div
            style={{
              width: "100%",
              height: 140,
              borderRadius: 18,
              background: C.bgLight,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              overflow: "hidden",
            }}
          >
            {p.imagem_url ? (
              <img
                src={p.imagem_url}
                alt={p.nome_comum}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <NoImagePlaceholder height={140} />
            )}
          </div>

          <Badge color={riskColor(p.nivel_risco)}>
            {riskLabel(p.nivel_risco)}
          </Badge>
          {p.nome_cientifico && (
            <p
              style={{
                color: C.textSub,
                fontSize: 13,
                marginTop: 10,
                fontStyle: "italic",
              }}
            >
              {p.nome_cientifico}
            </p>
          )}
          <InfoCard style={{ marginTop: 14 }} title="Descricao">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
              {p.descricao_simples || "Sem descricao cadastrada."}
            </p>
          </InfoCard>
          <InfoCard title="Danos causados">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
              {p.danos_causados || "Sem danos cadastrados."}
            </p>
          </InfoCard>
          <InfoCard title="Acoes recomendadas">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
              {p.acoes_recomendadas || "Sem recomendacoes cadastradas."}
            </p>
          </InfoCard>
          <InfoCard title="Periodo mais comum">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>
              {p.periodo_mais_comum || "Nao informado."}
            </p>
          </InfoCard>
          <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Agrotoxicos relacionados
          </h4>
          {produtos.length ? (
            produtos.map((produto) => (
              <div
                key={produto.id}
                style={{
                  padding: "14px 16px",
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ color: C.green }}>
                  <IcoFlask />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {produto.nome_produto}
                  </div>
                  <div style={{ color: C.textSub, fontSize: 12 }}>
                    {produto.ingrediente_ativo}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="Nenhum agrotoxico relacionado a esta praga." />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Pragas" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {loading && <LoadingState />}
        {error && <EmptyState label={`Erro ao carregar pragas: ${error}`} />}
        {!loading && !error && pragas.length === 0 && (
          <EmptyState label="Nenhuma praga cadastrada." />
        )}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {pragas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSel(i)}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 15,
                overflow: "hidden",
                textAlign: "left",
                padding: 0,
                position: "relative",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.borderLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.border)
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: riskColor(p.nivel_risco),
                  boxShadow: `0 0 6px ${riskColor(p.nivel_risco)}88`,
                }}
              />
              <div
                style={{
                  width: "100%",
                  height: 108,
                  background: C.bgLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome_comum}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span
                    style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}
                  >
                    Sem imagem
                  </span>
                )}
              </div>
              <div style={{ padding: "10px 12px 14px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                  {p.nome_comum}
                </div>
                <div
                  style={{ color: C.textSub, fontSize: 12, lineHeight: 1.45 }}
                >
                  {p.descricao_simples || p.nome_cientifico}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const PESTICIDAS = [
  {
    name: "Dipel WP",
    type: "Biologico",
    detail:
      "Inseticida biologico a base de Bacillus thuringiensis. Eficaz contra lagartas em fase inicial. Seletivo para inimigos naturais.",
  },
  {
    name: "Evidence 700 WG",
    type: "Quimico sistemico",
    detail:
      "Inseticida sistemico de amplo espectro. Controla pulgoes, mosca-branca e outros insetos sugadores. Acao prolongada.",
  },
  {
    name: "Nim-I-Go EC",
    type: "Natural / Organico",
    detail:
      "Derivado do nim (Azadirachta indica). Repelente e inibidor de crescimento de insetos. Indicado para agricultura organica.",
  },
  {
    name: "Assist Oleo Mineral",
    type: "Adjuvante / Inseticida",
    detail:
      "Oleo mineral que age sobre ovos e ninfas de acaros e cochonilhas por acao fisica. Nao deixa residuos prejudiciais.",
  },
  {
    name: "Gastoxin B57",
    type: "Fumigante",
    detail:
      "Fumigante a base de fosfeto de aluminio. Uso em armazenamento de graos. Controle eficaz de pragas de estocagem.",
  },
];

function PesticidasScreen({ setScreen }) {
  const [open, setOpen] = useState(null);
  const [pesticidas, setPesticidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPesticidas() {
      setLoading(true);
      setError("");
      try {
        const { data, error: loadError } = await withTimeout(
          supabase
            .from("agrotoxicos")
            .select(
              `
              id,
              nome_produto,
              ingrediente_ativo,
              agrotoxico_fornecedor (
                fornecedores (
                  id,
                  nome,
                  contato
                )
              )
            `,
            )
            .order("nome_produto"),
          "Consulta de pesticidas",
        );

        if (!active) return;
        if (loadError) {
          setError(loadError.message);
        } else {
          setPesticidas(data || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPesticidas();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Pesticidas" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {loading && <LoadingState />}
        {error && (
          <EmptyState label={`Erro ao carregar pesticidas: ${error}`} />
        )}
        {!loading && !error && pesticidas.length === 0 && (
          <EmptyState label="Nenhum pesticida cadastrado." />
        )}
        {pesticidas.map((p, i) => {
          const fornecedores =
            p.agrotoxico_fornecedor
              ?.map((rel) => rel.fornecedores)
              .filter(Boolean) || [];
          return (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  background: C.bgCard,
                  border: `1px solid ${open === i ? C.green : C.border}`,
                  borderRadius: open === i ? "14px 14px 0 0" : 14,
                  padding: "15px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "border-color .2s",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: C.bgLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.green,
                    flexShrink: 0,
                  }}
                >
                  <IcoFlask />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>
                    {p.nome_produto}
                  </div>
                  <div style={{ color: C.textSub, fontSize: 12 }}>
                    {p.ingrediente_ativo}
                  </div>
                </div>
                <IcoChevD open={open === i} />
              </button>
              {open === i && (
                <div
                  style={{
                    background: C.bgLight,
                    borderRadius: "0 0 14px 14px",
                    border: `1px solid ${C.green}`,
                    borderTop: "none",
                    padding: "14px 18px",
                    animation: "fadeIn .2s both",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      margin: "14px 0 8px",
                    }}
                  >
                    Fornecedores
                  </h4>
                  {fornecedores.length ? (
                    fornecedores.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          padding: "10px 0",
                          borderTop: `1px solid ${C.border}`,
                          color: C.textSub,
                          fontSize: 13,
                        }}
                      >
                        <div style={{ color: C.text, fontWeight: 700 }}>
                          {f.nome}
                        </div>
                        <div>{f.contato || "Contato nao informado"}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: C.textSub, fontSize: 13 }}>
                      Nenhum fornecedor relacionado.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HIST = [
  { name: "Lagarta", date: "24/03/2026", conf: 94 },
  { name: "Pulgão", date: "22/03/2026", conf: 87 },
  { name: "Mosca-branca", date: "20/03/2026", conf: 91 },
];

function HistoricoScreen({ setScreen }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistorico() {
      setLoading(true);
      setError("");
      try {
        const { data: userData, error: userError } = await withTimeout(
          supabase.auth.getUser(),
          "Sessao",
        );
        if (userError || !userData.user) {
          if (active) {
            setError("Faca login para ver seu historico.");
          }
          return;
        }

        const { data, error: loadError } = await withTimeout(
          supabase
            .from("predictions")
            .select(
              `
              id,
              filename,
              label,
              created_at,
              confianca,
              imagem_url,
              ativa,
              pestes (
                id,
                nome_comum,
                nivel_risco
              )
            `,
            )
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: false }),
          "Consulta de historico",
        );

        if (!active) return;
        if (loadError) {
          setError(formatSupabaseDataError(loadError));
        } else {
          setHistorico(data || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistorico();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleActive = async (item) => {
    const nextActive = item.ativa === false;
    setUpdatingId(item.id);
    setError("");
    try {
      await updatePredictionActive(item.id, nextActive);
      setHistorico((items) =>
        items.map((current) =>
          current.id === item.id ? { ...current, ativa: nextActive } : current,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Historico" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {loading && <LoadingState />}
        {error && <EmptyState label={`Erro ao carregar historico: ${error}`} />}
        {!loading && !error && historico.length === 0 && (
          <EmptyState label="Nenhuma analise encontrada." />
        )}
        {historico.map((h) => {
          const confidence =
            typeof h.confianca === "number"
              ? Math.round(h.confianca * 100)
              : null;
          const date = h.created_at
            ? new Date(h.created_at).toLocaleDateString("pt-BR")
            : "Sem data";
          const name = h.pestes?.nome_comum || h.label || "Sem deteccao";
          const isActive = h.ativa !== false;
          return (
            <div
              key={h.id}
              style={{
                background: C.bgCard,
                border: `1px solid ${isActive ? C.border : C.textDim}`,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: isActive ? 1 : 0.72,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  background: C.bgLight,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {h.imagem_url ? (
                  <img
                    src={h.imagem_url}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <span
                    style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}
                  >
                    Sem imagem
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 3,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                  <Badge color={isActive ? C.green : C.textDim}>
                    {isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div style={{ color: C.textSub, fontSize: 12 }}>
                  {date} • {h.filename}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    color: C.green,
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {confidence !== null ? `${confidence}%` : "--"}
                </span>
                <button
                  onClick={() => handleToggleActive(h)}
                  disabled={updatingId === h.id}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 11,
                    border: `1px solid ${isActive ? C.warn : C.borderLight}`,
                    color: isActive ? C.warn : C.green,
                    fontWeight: 800,
                    fontSize: 12,
                    opacity: updatingId === h.id ? 0.65 : 1,
                  }}
                >
                  {updatingId === h.id
                    ? "Salvando..."
                    : isActive
                      ? "Inativar"
                      : "Ativar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerfilScreen({ setScreen, onLogout, profile, user }) {
  const displayName = getDisplayName(profile, user);
  const menuItems = [
    { Icon: IcoCog, label: "Configuracoes", screen: null },
    { Icon: IcoBell, label: "Notificacoes", screen: "notificacoes" },
    { Icon: IcoHelp, label: "Ajuda e suporte", screen: null },
  ];

  return (
    <div
      className="screen-enter"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <BackHeader title="Perfil" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              background: C.bgLight,
              border: `2px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <IcoUser />
          </div>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 6,
            }}
          >
            {displayName}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              color: C.textSub,
              fontSize: 13,
            }}
          >
            <IcoPin /> {user?.email || "Conta Visiagro"}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            ["3", "Analises"],
            ["2", "Pragas"],
            ["15", "Dias"],
          ].map(([n, l]) => (
            <div
              key={l}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "16px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.green,
                }}
              >
                {n}
              </div>
              <div style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>
                {l}
              </div>
            </div>
          ))}
        </div>
        {menuItems.map(({ Icon, label, screen }) => (
          <button
            key={label}
            onClick={() => screen && setScreen(screen)}
            style={{
              width: "100%",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "15px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: C.text,
              transition: "border-color .2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.borderLight)
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ color: C.green, lineHeight: 0 }}>
              <Icon />
            </div>
            <span style={{ flex: 1, textAlign: "left", fontWeight: 500 }}>
              {label}
            </span>
            <div style={{ color: C.textSub }}>
              <IcoChevR />
            </div>
          </button>
        ))}
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            marginTop: 6,
            background: "none",
            border: "1px solid rgba(255,59,59,.3)",
            color: C.danger,
            fontWeight: 600,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "background .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,59,59,.07)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <IcoLogout /> Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState("splash");
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);
  const [requestedPest, setRequestedPest] = useState(null);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("visiagro.theme") || "dark",
  );
  const isDesktop = useIsDesktop();

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem("visiagro.theme", next);
      return next;
    });
  };

  const loadProfile = async (currentUser, nomeFallback) => {
    if (!currentUser) return null;

    let data;
    let error;
    try {
      ({ data, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("id, nome, created_at")
          .eq("id", currentUser.id)
          .maybeSingle(),
        "Consulta de perfil",
      ));
    } catch (err) {
      console.error("Falha ao carregar perfil:", err);
      return null;
    }

    if (error) {
      console.error("Falha ao carregar perfil:", error);
      return null;
    }

    if (data) return data;

    const nome =
      nomeFallback ||
      currentUser.user_metadata?.nome ||
      currentUser.email?.split("@")[0] ||
      "Usuario";
    let createdProfile;
    let createError;
    try {
      ({ data: createdProfile, error: createError } = await withTimeout(
        supabase
          .from("profiles")
          .upsert({ id: currentUser.id, nome }, { onConflict: "id" })
          .select("id, nome, created_at")
          .single(),
        "Criacao de perfil",
      ));
    } catch (err) {
      console.error("Falha ao criar perfil:", err);
      return null;
    }

    if (createError) {
      console.error("Falha ao criar perfil:", createError);
      return null;
    }

    return createdProfile;
  };

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          "Sessao",
        );
        if (!active) return;

        const currentUser = data.session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          const loadedProfile = await loadProfile(currentUser);
          if (active) setProfile(loadedProfile);
        }
      } catch (err) {
        console.error("Falha ao restaurar sessao:", err);
        if (active) {
          setUser(null);
          setProfile(null);
          setAppState("login");
        }
      }
    }

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (!currentUser) {
          setProfile(null);
          setAppState("login");
          setScreen("home");
          return;
        }

        setTimeout(async () => {
          if (!active) return;
          const loadedProfile = await loadProfile(currentUser);
          if (active) setProfile(loadedProfile);
        }, 0);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async ({ mode, nome, email, password }) => {
    if (mode === "signup") {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome },
          },
        }),
        "Cadastro",
      );

      if (error) return { error: error.message };

      if (!data.session) {
        return {
          notice:
            "Cadastro criado. Confirme seu e-mail no Supabase Auth e depois faca login.",
        };
      }

      const loadedProfile = await loadProfile(data.user, nome);
      setUser(data.user);
      setProfile(loadedProfile);
      setAppState("main");
      setScreen("home");
      return {};
    }

    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      "Login",
    );
    if (error) return { error: error.message };

    const loadedProfile = await loadProfile(data.user);
    setUser(data.user);
    setProfile(loadedProfile);
    setAppState("main");
    setScreen("home");
    return {};
  };

  const handleLogout = async () => {
    setUser(null);
    setProfile(null);
    setEditingFarm(null);
    setAppState("login");
    setScreen("home");
    try {
      await withTimeout(supabase.auth.signOut(), "Logout", 8000);
    } catch (err) {
      console.error("Falha ao sair:", err);
    }
  };

  const handleSplashDone = () => {
    setAppState(user ? "main" : "login");
  };

  const openPestRecommendations = (pest) => {
    setRequestedPest(pest || null);
    setScreen("pragas");
  };

  const navActive = [
    "historico",
    "pragas",
    "pesticidas",
    "identificar",
    "perfil",
    "localizacao",
    "mapa-alertas",
    "notificacoes",
    "lavouras",
    "cadastro-lavoura",
  ].includes(screen)
    ? screen === "mapa-alertas" ||
      screen === "notificacoes" ||
      screen === "lavouras" ||
      screen === "cadastro-lavoura"
      ? "localizacao"
      : screen
    : "home";
  const showNav = appState === "main" && screen !== "identificar" && !isDesktop;

  const mainScreens = (
    <>
      {screen === "home" && (
        <HomeScreen
          setScreen={setScreen}
          profile={profile}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {screen === "identificar" && <IdentificarScreen setScreen={setScreen} />}
      {screen === "pragas" && (
        <PragasScreen
          setScreen={setScreen}
          initialPest={requestedPest}
          onInitialPestConsumed={() => setRequestedPest(null)}
        />
      )}
      {screen === "pesticidas" && <PesticidasScreen setScreen={setScreen} />}
      {screen === "historico" && <HistoricoScreen setScreen={setScreen} />}
      {screen === "localizacao" && (
        <MapaAlertasScreen
          setScreen={setScreen}
          onOpenPest={openPestRecommendations}
        />
      )}
      {screen === "mapa-alertas" && (
        <MapaAlertasScreen
          setScreen={setScreen}
          onOpenPest={openPestRecommendations}
        />
      )}
      {screen === "lavouras" && (
        <LavourasScreen
          setScreen={setScreen}
          onNew={() => {
            setEditingFarm(null);
            setScreen("cadastro-lavoura");
          }}
          onEdit={(farm) => {
            setEditingFarm(farm);
            setScreen("cadastro-lavoura");
          }}
        />
      )}
      {screen === "cadastro-lavoura" && (
        <CadastroLavouraScreen setScreen={setScreen} farmToEdit={editingFarm} />
      )}
      {screen === "notificacoes" && (
        <NotificacoesScreen
          setScreen={setScreen}
          onOpenPest={openPestRecommendations}
        />
      )}
      {screen === "perfil" && (
        <PerfilScreen
          setScreen={setScreen}
          onLogout={handleLogout}
          profile={profile}
          user={user}
        />
      )}

      {showNav && <BottomNav active={navActive} setScreen={setScreen} />}
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app-shell" data-theme={theme}>
        {appState === "main" && isDesktop ? (
          <div className="web-shell screen-enter">
            <DesktopSidebar
              active={navActive}
              setScreen={setScreen}
              onLogout={handleLogout}
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <div className="web-content">{mainScreens}</div>
          </div>
        ) : appState === "login" && isDesktop ? (
          <LoginScreen
            onLogin={handleLogin}
            isDesktop
            theme={theme}
            toggleTheme={toggleTheme}
          />
        ) : (
          <div className="phone-frame">
            {appState === "splash" && (
              <SplashScreen onDone={handleSplashDone} />
            )}
            {appState === "login" && !isDesktop && (
              <LoginScreen
                onLogin={handleLogin}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            )}
            {appState === "main" && mainScreens}
          </div>
        )}
      </div>
    </>
  );
}
