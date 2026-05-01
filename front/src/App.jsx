import React, { useState, useEffect } from "react";
import logoOficialIcon from "./assets/logo-oficial-icon.png";
import { supabase } from "./lib/supabase";

const C = {
  bg: "#0a1a0a",
  bgCard: "#0d2410",
  bgCardHov: "#112a14",
  bgLight: "#163320",
  border: "#1e4d22",
  borderLight: "#265c2a",
  green: "#3ddc3d",
  greenLime: "#a8ff3e",
  greenGlow: "rgba(61,220,61,0.18)",
  text: "#e4ffe4",
  textSub: "#a8d6a8",
  textDim: "#6f9d6f",
  danger: "#ff3b3b",
  warn: "#ffb800",
  orange: "#ff7a00",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #050d06;
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

  .app-shell {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    background: #050d06;
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
      background: radial-gradient(ellipse at center, #0a1f0a 0%, #050d06 70%);
    }
    .phone-frame {
      min-height: 840px;
      max-height: 900px;
      border-radius: 38px;
      box-shadow: 0 0 0 1px ${C.border}, 0 48px 100px rgba(0,0,0,.9), 0 0 80px rgba(61,220,61,.05);
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
    background: linear-gradient(180deg, #0c1f0f 0%, #09180c 100%);
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: 22px 16px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  }

  .web-content {
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 26px;
    min-height: calc(100vh - 24px);
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
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
      radial-gradient(circle at 12% 18%, rgba(61,220,61,.12) 0%, rgba(61,220,61,0) 42%),
      linear-gradient(160deg, #0b1e0f 0%, #08140a 100%);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  }

  .login-hero {
    max-width: 520px;
    padding: 12px 18px 12px 8px;
  }

  .login-panel {
    width: 100%;
    background: rgba(7, 20, 10, 0.82);
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: 30px 26px;
    box-shadow: 0 20px 42px rgba(0, 0, 0, 0.4);
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
  <Svg size={26} col={bg ? C.bg : C.green}>
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
  <Svg size={18} style={{ transition: ".2s", transform: open ? "rotate(180deg)" : "none" }}>
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
      background: "rgba(22,51,32,.45)",
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
    {title && <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{title}</h4>}
    {children}
  </div>
);

const LoadingState = ({ label = "Carregando dados..." }) => (
  <div style={{ padding: 18, color: C.textSub, textAlign: "center", fontSize: 14 }}>{label}</div>
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

const getDisplayName = (profile, user) => profile?.nome || user?.email?.split("@")[0] || "Usuario";
const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

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
    <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20 }}>{title}</h2>
  </div>
);

function BottomNav({ active, setScreen }) {
  const tabs = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "historico", label: "Historico", Icon: IcoHistory },
    { id: "identificar", label: "Identificar", Icon: null },
    { id: "pragas", label: "Pragas", Icon: IcoBug },
    { id: "pesticidas", label: "Pesticidas", Icon: IcoFlask },
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
              <div style={{ lineHeight: 0, color: isActive ? C.green : C.textDim }}>
                <Icon />
              </div>
            )}
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{label}</span>
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

function DesktopSidebar({ active, setScreen, onLogout }) {
  const tabs = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "identificar", label: "Identificar", Icon: IcoScan },
    { id: "historico", label: "Historico", Icon: IcoHistory },
    { id: "pragas", label: "Pragas", Icon: IcoBug },
    { id: "pesticidas", label: "Pesticidas", Icon: IcoFlask },
    { id: "perfil", label: "Perfil", Icon: IcoUser },
  ];

  return (
    <aside className="web-sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 16px" }}>
        <IcoLogo size={30} />
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 22, color: C.green }}>Visiagro</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
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
                background: isActive ? "rgba(61,220,61,.1)" : "transparent",
                border: isActive ? `1px solid ${C.borderLight}` : "1px solid transparent",
                transition: "all .2s",
              }}
            >
              <span style={{ lineHeight: 0 }}>
                <Icon />
              </span>
              <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 600 }}>{label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
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
        background: `radial-gradient(ellipse at 50% 35%, #0d3a12 0%, ${C.bg} 68%)`,
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
      <div style={{ zIndex: 1, textAlign: "center", animation: "fadeUp .7s .1s both" }}>
        <IcoLogo size={74} />
      </div>
      <div style={{ zIndex: 1, textAlign: "center", animation: "fadeUp .7s .3s both", marginTop: 22 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 42, fontWeight: 800, color: C.green, letterSpacing: -0.4 }}>
          Visiagro
        </h1>
        <p style={{ color: C.textSub, fontSize: 14, marginTop: 8 }}>Transformando tecnologia em produtividade</p>
      </div>
      <div style={{ zIndex: 1, display: "flex", gap: 8, marginTop: 62, animation: "fadeIn .6s .7s both" }}>
        <div style={{ width: 26, height: 7, borderRadius: 4, background: C.green }} />
        <div style={{ width: 7, height: 7, borderRadius: 4, background: C.border }} />
        <div style={{ width: 7, height: 7, borderRadius: 4, background: C.border }} />
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, isDesktop = false }) {
  const [mode, setMode] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
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
    const result = await onLogin({ mode, nome: nome.trim(), email, password: pass });
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.notice) {
      setNotice(result.notice);
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
      <div style={{ textAlign: "center", marginBottom: isDesktop ? 30 : 36, animation: "fadeUp .6s both" }}>
        <IcoLogo size={isDesktop ? 56 : 62} />
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: isDesktop ? 34 : 38, fontWeight: 800, color: C.green, margin: "14px 0 6px" }}>
          Visiagro
        </h1>
        <p style={{ color: C.textSub, fontSize: 13 }}>Visao computacional para a agricultura</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp .6s .1s both" }}>
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
        <input
          style={inp}
          type="password"
          placeholder="Senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = C.green)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>
      {error && (
        <div style={{ marginTop: 14, color: C.danger, fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>{error}</div>
      )}
      {notice && (
        <div style={{ marginTop: 14, color: C.green, fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>{notice}</div>
      )}
      <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .6s .2s both" }}>
        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenLime})`,
            color: C.bg,
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
          <IcoArr /> {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
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
          background: `radial-gradient(ellipse at 24% 14%, #113516 0%, ${C.bg} 72%)`,
        }}
      >
        <div className="login-shell">
          <div className="login-hero" style={{ animation: "fadeUp .6s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <IcoLogo size={52} />
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 32, fontWeight: 800, color: C.green }}>Visiagro</span>
            </div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 44, lineHeight: 1.08, letterSpacing: -0.4, color: C.text }}>
              Plataforma inteligente para diagnostico agricola
            </h2>
            <p style={{ marginTop: 16, color: C.textSub, fontSize: 16, maxWidth: 460 }}>
              Analise imagens da sua lavoura, identifique pragas e acompanhe o historico em um painel unico.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              {["Deteccao rapida", "Historico de analises", "Acesso em qualquer tela"].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.border}`,
                    background: "rgba(61,220,61,.08)",
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
        background: `radial-gradient(ellipse at 50% 20%, #0d3a12 0%, ${C.bg} 68%)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 430 }}>{loginForm}</div>
    </div>
  );
}

function HomeScreen({ setScreen, profile, user }) {
  const displayName = getDisplayName(profile, user);
  const quickItems = [
    { id: "historico", Icon: IcoHistory, label: "Historico", sub: "Analises anteriores" },
    { id: "pragas", Icon: IcoBug, label: "Pragas", sub: "Catalogo de pragas" },
    { id: "pesticidas", Icon: IcoFlask, label: "Pesticidas", sub: "Catalogo e fornecedores" },
  ];

  return (
    <div className="screen-enter" style={{ flex: 1, overflow: "auto", padding: "22px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <IcoLogo size={30} />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: C.green }}>Visiagro</span>
        </div>
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

      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Ola, {displayName}!</h2>
      <p style={{ color: C.textSub, fontSize: 14, marginBottom: 22 }}>Pronto para identificar pragas na sua lavoura?</p>

      <button
        onClick={() => setScreen("identificar")}
        style={{
          width: "100%",
          padding: "18px 20px",
          borderRadius: 16,
          background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
          color: C.bg,
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

      <p style={{ fontSize: 12, fontWeight: 700, color: C.textDim, letterSpacing: 1.2, marginBottom: 12 }}>ACESSO RAPIDO</p>

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
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.borderLight)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
        >
          <div style={{ width: 42, height: 42, borderRadius: 12, background: C.bgLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.green }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4, marginBottom: 20 }}>
        {[
          ["3", "Analises feitas"],
          ["5", "Pragas catalogadas"],
        ].map(([n, l]) => (
          <div key={l} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 34, fontWeight: 800, color: C.green }}>{n}</div>
            <div style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentificarScreen({ setScreen }) {
  const [phase, setPhase] = useState("idle");

  const shoot = () => {
    setPhase("processing");
    setTimeout(() => setPhase("result"), 2700);
  };

  if (phase === "result") {
    return <ResultadoScreen onBack={() => setPhase("idle")} onRec={() => setPhase("rec")} setScreen={setScreen} />;
  }
  if (phase === "rec") {
    return <RecomendacaoScreen onBack={() => setPhase("result")} setScreen={setScreen} />;
  }
  if (phase === "processing") {
    return <ProcessandoScreen />;
  }

  return (
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <BackHeader title="Identificar Praga" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 18 }}>
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
            { top: 14, left: 14, borderRight: "none", borderBottom: "none", borderRadius: "8px 0 0 0" },
            { top: 14, right: 14, borderLeft: "none", borderBottom: "none", borderRadius: "0 8px 0 0" },
            { bottom: 14, left: 14, borderRight: "none", borderTop: "none", borderRadius: "0 0 0 8px" },
            { bottom: 14, right: 14, borderLeft: "none", borderTop: "none", borderRadius: "0 0 8px 0" },
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
            <p style={{ fontWeight: 600, marginBottom: 7 }}>Capture a praga com boa iluminacao</p>
            <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.5 }}>Posicione a camera proxima a praga para melhor identificacao</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 20 }}>
          <button
            onClick={shoot}
            style={{
              padding: "16px",
              borderRadius: 14,
              background: `linear-gradient(135deg,${C.green},${C.greenLime})`,
              color: C.bg,
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
            onClick={shoot}
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
        background: `radial-gradient(ellipse at 50% 45%,#0d3a12 0%,${C.bg} 70%)`,
      }}
    >
      <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.green}`, animation: "spin .9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "2px solid transparent", borderTop: `2px solid ${C.greenLime}`, animation: "spinRev .6s linear infinite" }} />
        <IcoEye />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Analisando imagem...</h2>
        <p style={{ color: C.textSub, lineHeight: 1.6, maxWidth: 260 }}>Nosso modelo de visao computacional esta processando sua foto</p>
      </div>
      <div style={{ width: 220 }}>
        <div style={{ height: 4, background: C.bgCard, borderRadius: 3, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg,${C.green},${C.greenLime})`, borderRadius: 3, animation: "barGrow 2.6s cubic-bezier(.4,0,.2,1) forwards" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green }}>
        <IcoLogo size={22} />
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 15 }}>Visiagro</span>
      </div>
    </div>
  );
}

function ResultadoScreen({ onBack, onRec }) {
  return (
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Resultado" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div style={{ width: "100%", height: 190, borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg,#183a10,#0e2a09)", border: `1px solid ${C.border}`, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NoImagePlaceholder height={156} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 3 }}>Lagarta</h2>
            <p style={{ color: C.textSub, fontSize: 13 }}>Praga identificada</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 30, fontWeight: 800, color: C.green }}>94%</div>
            <div style={{ color: C.textSub, fontSize: 12 }}>Confianca</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", background: C.bgCard, borderRadius: 11, border: `1px solid ${C.border}`, marginBottom: 18, color: C.textSub, fontSize: 13 }}>
          <div style={{ color: C.warn }}>
            <IcoRisk />
          </div>
          Nivel de risco: <Badge color={C.danger}>Alto</Badge>
        </div>
        <InfoCard title="Descricao">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>Larva de lepidopteros que se alimenta de folhas, caules e frutos. Comumente encontrada em culturas de soja, milho e algodao.</p>
        </InfoCard>
        <InfoCard title="Danos causados">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>Desfolha intensa, reducao de area fotossintetica, perfuracao de frutos e vagens, podendo causar perdas de ate 30% na produtividade.</p>
        </InfoCard>
        <button onClick={onRec} style={{ width: "100%", padding: "16px", borderRadius: 14, background: `linear-gradient(135deg,${C.green},${C.greenLime})`, color: C.bg, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${C.greenGlow}` }}>
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
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Recomendacao" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#183a10", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}>Sem imagem</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Lagarta</div>
            <div style={{ color: C.textSub, fontSize: 13 }}>Manejo recomendado</div>
          </div>
        </div>
        <InfoCard title="Manejo sugerido">
          <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>Controle integrado com monitoramento constante e aplicacao de defensivos biologicos.</p>
        </InfoCard>
        <div style={{ marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Acoes recomendadas</h4>
          {actions.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                <IcoCheck />
              </div>
              <span style={{ color: C.textSub, fontSize: 13, lineHeight: 1.55 }}>{a}</span>
            </div>
          ))}
        </div>
        <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Pesticidas indicados</h4>
        {[
          { n: "Dipel WP", t: "Biologico" },
          { n: "Nim-I-Go EC", t: "Natural / Organico" },
        ].map((p) => (
          <div key={p.n} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
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
  if (value.includes("medio") || value.includes("médio") || value === "yellow") return "yellow";
  return "orange";
};
const riskColor = (r) => {
  const risk = normalizeRisk(r);
  return risk === "red" ? C.danger : risk === "yellow" ? C.warn : C.orange;
};
const riskLabel = (r) => {
  const risk = normalizeRisk(r);
  return risk === "red" ? "Risco Alto" : risk === "yellow" ? "Risco Medio" : "Risco Moderado";
};

const PRAGAS = [
  {
    name: "Lagarta",
    sub: "Larva de lepidopteros que se alimenta de...",
    risk: "red",
    detail: "Larva de lepidopteros que se alimenta de folhas, caules e frutos. Comumente encontrada em soja, milho e algodao. Pode causar perdas de ate 30% na produtividade.",
  },
  {
    name: "Pulgão",
    sub: "Inseto sugador de pequeno porte que...",
    risk: "yellow",
    detail: "Inseto sugador de pequeno porte que suga a seiva das plantas. Transmite virus e causa deformacoes foliares. Favorece o desenvolvimento de fumagina.",
  },
  {
    name: "Mosca-branca",
    sub: "Pequeno inseto alado que se alimenta da...",
    risk: "yellow",
    detail: "Pequeno inseto alado que se alimenta da seiva. Transmite viroses e apresenta alta resistencia a inseticidas. Monitoramento constante e essencial.",
  },
  {
    name: "Cochonilha",
    sub: "Inseto que se fixa em caules e folhas,...",
    risk: "orange",
    detail: "Inseto que se fixa em caules e folhas, liberando substancias que favorecem o aparecimento de fungos. Controle biologico com joaninhas e eficaz.",
  },
  {
    name: "Percevejo",
    sub: "Inseto que causa danos diretos aos graos...",
    risk: "red",
    detail: "Inseto que causa danos diretos aos graos e transmite o fungo Nematospora coryli. Monitoramento com armadilhas e recomendado na fase de enchimento de graos.",
  },
];

function PragasScreen({ setScreen }) {
  const [sel, setSel] = useState(null);
  const [pragas, setPragas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPragas() {
      setLoading(true);
      setError("");
      const { data, error: loadError } = await supabase
        .from("pestes")
        .select(`
          id,
          nome_cientifico,
          nome_comum,
          descricao_simples,
          nivel_risco,
          periodo_mais_comum,
          acoes_recomendadas,
          danos_causados,
          peste_agrotoxico (
            agrotoxicos (
              id,
              nome_produto,
              ingrediente_ativo,
              modo_acao_resumido
            )
          )
        `)
        .order("nome_comum");

      if (!active) return;
      if (loadError) {
        setError(loadError.message);
      } else {
        setPragas(data || []);
      }
      setLoading(false);
    }

    loadPragas();
    return () => {
      active = false;
    };
  }, []);

  if (sel !== null) {
    const p = pragas[sel];
    const produtos = p?.peste_agrotoxico?.map((rel) => rel.agrotoxicos).filter(Boolean) || [];
    return (
      <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <BackHeader title={p.nome_comum} onBack={() => setSel(null)} />
        <div style={{ flex: 1, overflow: "auto", padding: "18px 20px 20px" }}>
          <div style={{ width: "100%", height: 180, borderRadius: 18, background: "#183a10", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <NoImagePlaceholder height={140} />
          </div>
          <Badge color={riskColor(p.nivel_risco)}>{riskLabel(p.nivel_risco)}</Badge>
          {p.nome_cientifico && (
            <p style={{ color: C.textSub, fontSize: 13, marginTop: 10, fontStyle: "italic" }}>{p.nome_cientifico}</p>
          )}
          <InfoCard style={{ marginTop: 14 }} title="Descricao">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>{p.descricao_simples || "Sem descricao cadastrada."}</p>
          </InfoCard>
          <InfoCard title="Danos causados">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>{p.danos_causados || "Sem danos cadastrados."}</p>
          </InfoCard>
          <InfoCard title="Acoes recomendadas">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>{p.acoes_recomendadas || "Sem recomendacoes cadastradas."}</p>
          </InfoCard>
          <InfoCard title="Periodo mais comum">
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.65 }}>{p.periodo_mais_comum || "Nao informado."}</p>
          </InfoCard>
          <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Agrotoxicos relacionados</h4>
          {produtos.length ? (
            produtos.map((produto) => (
              <div key={produto.id} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ color: C.green }}>
                  <IcoFlask />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{produto.nome_produto}</div>
                  <div style={{ color: C.textSub, fontSize: 12 }}>{produto.ingrediente_ativo}</div>
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
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Pragas" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {loading && <LoadingState />}
        {error && <EmptyState label={`Erro ao carregar pragas: ${error}`} />}
        {!loading && !error && pragas.length === 0 && <EmptyState label="Nenhuma praga cadastrada." />}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.borderLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ position: "absolute", top: 10, right: 10, width: 10, height: 10, borderRadius: "50%", background: riskColor(p.nivel_risco), boxShadow: `0 0 6px ${riskColor(p.nivel_risco)}88` }} />
              <div style={{ width: "100%", height: 108, background: "#183a10", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}>Sem imagem</span>
              </div>
              <div style={{ padding: "10px 12px 14px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{p.nome_comum}</div>
                <div style={{ color: C.textSub, fontSize: 12, lineHeight: 1.45 }}>{p.descricao_simples || p.nome_cientifico}</div>
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
    detail: "Inseticida biologico a base de Bacillus thuringiensis. Eficaz contra lagartas em fase inicial. Seletivo para inimigos naturais.",
  },
  {
    name: "Evidence 700 WG",
    type: "Quimico sistemico",
    detail: "Inseticida sistemico de amplo espectro. Controla pulgoes, mosca-branca e outros insetos sugadores. Acao prolongada.",
  },
  {
    name: "Nim-I-Go EC",
    type: "Natural / Organico",
    detail: "Derivado do nim (Azadirachta indica). Repelente e inibidor de crescimento de insetos. Indicado para agricultura organica.",
  },
  {
    name: "Assist Oleo Mineral",
    type: "Adjuvante / Inseticida",
    detail: "Oleo mineral que age sobre ovos e ninfas de acaros e cochonilhas por acao fisica. Nao deixa residuos prejudiciais.",
  },
  {
    name: "Gastoxin B57",
    type: "Fumigante",
    detail: "Fumigante a base de fosfeto de aluminio. Uso em armazenamento de graos. Controle eficaz de pragas de estocagem.",
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
      const { data, error: loadError } = await supabase
        .from("agrotoxicos")
        .select(`
          id,
          nome_produto,
          ingrediente_ativo,
          modo_acao_resumido,
          agrotoxico_fornecedor (
            fornecedores (
              id,
              nome,
              contato
            )
          )
        `)
        .order("nome_produto");

      if (!active) return;
      if (loadError) {
        setError(loadError.message);
      } else {
        setPesticidas(data || []);
      }
      setLoading(false);
    }

    loadPesticidas();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Pesticidas" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {loading && <LoadingState />}
        {error && <EmptyState label={`Erro ao carregar pesticidas: ${error}`} />}
        {!loading && !error && pesticidas.length === 0 && <EmptyState label="Nenhum pesticida cadastrado." />}
        {pesticidas.map((p, i) => {
          const fornecedores = p.agrotoxico_fornecedor?.map((rel) => rel.fornecedores).filter(Boolean) || [];
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
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.bgLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                <IcoFlask />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{p.nome_produto}</div>
                <div style={{ color: C.textSub, fontSize: 12 }}>{p.ingrediente_ativo}</div>
              </div>
              <IcoChevD open={open === i} />
            </button>
            {open === i && (
              <div style={{ background: C.bgLight, borderRadius: "0 0 14px 14px", border: `1px solid ${C.green}`, borderTop: "none", padding: "14px 18px", animation: "fadeIn .2s both" }}>
                <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.65 }}>{p.modo_acao_resumido || "Sem modo de acao cadastrado."}</p>
                <h4 style={{ fontWeight: 700, fontSize: 14, margin: "14px 0 8px" }}>Fornecedores</h4>
                {fornecedores.length ? (
                  fornecedores.map((f) => (
                    <div key={f.id} style={{ padding: "10px 0", borderTop: `1px solid ${C.border}`, color: C.textSub, fontSize: 13 }}>
                      <div style={{ color: C.text, fontWeight: 700 }}>{f.nome}</div>
                      <div>{f.contato || "Contato nao informado"}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: C.textSub, fontSize: 13 }}>Nenhum fornecedor relacionado.</p>
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
  return (
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Historico" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px 20px" }}>
        {HIST.map((h, i) => (
          <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: "#183a10", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: C.textSub, fontSize: 11, fontWeight: 700 }}>Sem imagem</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{h.name}</div>
              <div style={{ color: C.textSub, fontSize: 12 }}>{h.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.green, fontWeight: 700, fontSize: 16, fontFamily: "'Sora',sans-serif" }}>{h.conf}%</span>
              <div style={{ color: C.textSub }}>
                <IcoChevR />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerfilScreen({ setScreen, onLogout, profile, user }) {
  const displayName = getDisplayName(profile, user);
  const menuItems = [
    { Icon: IcoCog, label: "Configuracoes" },
    { Icon: IcoBell, label: "Notificacoes" },
    { Icon: IcoHelp, label: "Ajuda e suporte" },
  ];

  return (
    <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BackHeader title="Perfil" onBack={() => setScreen("home")} />
      <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 82, height: 82, borderRadius: "50%", background: C.bgLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <IcoUser />
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{displayName}</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: C.textSub, fontSize: 13 }}>
            <IcoPin /> {user?.email || "Conta Visiagro"}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            ["3", "Analises"],
            ["2", "Pragas"],
            ["15", "Dias"],
          ].map(([n, l]) => (
            <div key={l} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: C.green }}>{n}</div>
              <div style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        {menuItems.map(({ Icon, label }) => (
          <button
            key={label}
            style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "15px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, color: C.text, transition: "border-color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.borderLight)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ color: C.green, lineHeight: 0 }}>
              <Icon />
            </div>
            <span style={{ flex: 1, textAlign: "left", fontWeight: 500 }}>{label}</span>
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
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,59,.07)")}
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
  const isDesktop = useIsDesktop();

  const loadProfile = async (currentUser, nomeFallback) => {
    if (!currentUser) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, created_at")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Falha ao carregar perfil:", error);
      return null;
    }

    if (data) return data;

    const nome = nomeFallback || currentUser.user_metadata?.nome || currentUser.email?.split("@")[0] || "Usuario";
    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .upsert({ id: currentUser.id, nome }, { onConflict: "id" })
      .select("id, nome, created_at")
      .single();

    if (createError) {
      console.error("Falha ao criar perfil:", createError);
      return null;
    }

    return createdProfile;
  };

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      const currentUser = data.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const loadedProfile = await loadProfile(currentUser);
        if (active) setProfile(loadedProfile);
      }
    }

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setProfile(currentUser ? await loadProfile(currentUser) : null);
      if (!currentUser) {
        setAppState("login");
        setScreen("home");
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async ({ mode, nome, email, password }) => {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome },
        },
      });

      if (error) return { error: error.message };

      if (!data.session) {
        return {
          notice: "Cadastro criado. Confirme seu e-mail no Supabase Auth e depois faca login.",
        };
      }

      const loadedProfile = await loadProfile(data.user, nome);
      setUser(data.user);
      setProfile(loadedProfile);
      setAppState("main");
      setScreen("home");
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const loadedProfile = await loadProfile(data.user);
    setUser(data.user);
    setProfile(loadedProfile);
    setAppState("main");
    setScreen("home");
    return {};
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAppState("login");
    setScreen("home");
  };

  const handleSplashDone = () => {
    setAppState(user ? "main" : "login");
  };

  const navActive = ["historico", "pragas", "pesticidas", "identificar", "perfil"].includes(screen) ? screen : "home";
  const showNav = appState === "main" && screen !== "identificar" && !isDesktop;

  const mainScreens = (
    <>
      {screen === "home" && <HomeScreen setScreen={setScreen} profile={profile} user={user} />}
      {screen === "identificar" && <IdentificarScreen setScreen={setScreen} />}
      {screen === "pragas" && <PragasScreen setScreen={setScreen} />}
      {screen === "pesticidas" && <PesticidasScreen setScreen={setScreen} />}
      {screen === "historico" && <HistoricoScreen setScreen={setScreen} />}
      {screen === "perfil" && <PerfilScreen setScreen={setScreen} onLogout={handleLogout} profile={profile} user={user} />}

      {showNav && <BottomNav active={navActive} setScreen={setScreen} />}
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app-shell">
        {appState === "main" && isDesktop ? (
          <div className="web-shell screen-enter">
            <DesktopSidebar active={navActive} setScreen={setScreen} onLogout={handleLogout} />
            <div className="web-content">{mainScreens}</div>
          </div>
        ) : appState === "login" && isDesktop ? (
          <LoginScreen onLogin={handleLogin} isDesktop />
        ) : (
          <div className="phone-frame">
            {appState === "splash" && <SplashScreen onDone={handleSplashDone} />}
            {appState === "login" && !isDesktop && <LoginScreen onLogin={handleLogin} />}
            {appState === "main" && mainScreens}
          </div>
        )}
      </div>
    </>
  );
}
