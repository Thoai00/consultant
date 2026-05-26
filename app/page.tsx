"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FiAnchor,
  FiBarChart2,
  FiBook,
  FiCheckCircle,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiCrosshair,
  FiDollarSign,
  FiFlag,
  FiGlobe,
  FiHome,
  FiLink,
  FiSearch,
  FiShield,
  FiTag,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
} from "react-simple-maps";

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR SYSTEM — ALIGNED WITH LOGO
   ─────────────────────────────────────────────────────────────────────────
   Cyan:         #00c8d7  (primary accent)
   Cyan Light:   #4dd9e6  (hover / highlight)
   Cyan Dark:    #0099a8  (depth / shadow)
   Silver:       #8a9ab5  (metallic grey)
   Silver Light: #b8c6d6  (lighter silver)
   Void:         #080c10
   Surface:      #0e1318
   Surface2:     #141c24
   Surface3:     #1c2530
   Cream:        #e8f0f8
   Muted:        #7a8fa6
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── HOOKS ──────────────────────────────────────────────────────────────── */
function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useMousePos() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      setP(sh > 0 ? (window.scrollY / sh) * 100 : 0);
    };
    window.addEventListener("scroll", h);
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);
  return p;
}


/* ─── CUSTOM CURSOR ──────────────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mouseX = 0,
      mouseY = 0,
      ringX = 0,
      ringY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };
    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    tick();
    const hoverables = document.querySelectorAll("a, button, [data-cursor]");
    const onEnter = () => ringRef.current?.classList.add("cursor-hover");
    const onLeave = () => ringRef.current?.classList.remove("cursor-hover");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });
    return () => {
      window.removeEventListener("mousemove", onMove);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);
  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[100] w-2 h-2 bg-[#00c8d7] rounded-full hidden lg:block"
        style={{ mixBlendMode: "screen" }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[100] w-9 h-9 border border-[#00c8d7]/40 rounded-full transition-[width,height,border-color] duration-300 hidden lg:block"
      />
      <style>{`
        @media (min-width: 1024px) { body { cursor: none; } a, button { cursor: none; } }
        .cursor-hover { width: 60px !important; height: 60px !important; border-color: rgba(0,200,215,0.7) !important; }
      `}</style>
    </>
  );
}

/* ─── ANIMATED GLOBE ─────────────────────────────────────────────────────── */
function ConnectionGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x: -y * 10, y: x * 10 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  const points = [
    { x: 50, y: 38, label: "UK", lead: true },
    { x: 62, y: 36, label: "EU" },
    { x: 78, y: 44, label: "JP" },
    { x: 30, y: 50, label: "US" },
    { x: 70, y: 60, label: "IN" },
    { x: 55, y: 70, label: "AU" },
    { x: 35, y: 65, label: "BR" },
    { x: 60, y: 28, label: "RU" },
  ];
  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full"
      style={{ perspective: 1000 }}
    >
      <div
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id="globeFill" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#1c2530" />
              <stop offset="55%" stopColor="#0e1318" />
              <stop offset="100%" stopColor="#080c10" />
            </radialGradient>
            <linearGradient id="connLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00c8d7" />
              <stop offset="100%" stopColor="#4dd9e6" />
            </linearGradient>
          </defs>
          <circle
            cx="200"
            cy="200"
            r="160"
            fill="url(#globeFill)"
            stroke="#00c8d7"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {[40, 80, 120, 160].map((r) => (
            <ellipse
              key={r}
              cx="200"
              cy="200"
              rx="160"
              ry={r}
              fill="none"
              stroke="#00c8d7"
              strokeWidth="0.6"
              strokeOpacity="0.2"
            />
          ))}
          {[40, 80, 120, 160].map((rx) => (
            <ellipse
              key={`lon-${rx}`}
              cx="200"
              cy="200"
              rx={rx}
              ry="160"
              fill="none"
              stroke="#8a9ab5"
              strokeWidth="0.5"
              strokeOpacity="0.12"
            />
          ))}
          {points
            .filter((p) => !p.lead)
            .map((p, i) => {
              const x1 = 200,
                y1 = 152,
                x2 = p.x * 4,
                y2 = p.y * 4;
              const cx = (x1 + x2) / 2,
                cy = Math.min(y1, y2) - 50;
              return (
                <g key={i}>
                  <path
                    d={`M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#connLine)"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <circle r="3.5" fill="#00c8d7">
                    <animateMotion
                      dur={`${4 + i * 0.4}s`}
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`}
                    />
                  </circle>
                </g>
              );
            })}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x * 4}
                cy={p.y * 4}
                r={p.lead ? 8 : 4.5}
                fill={p.lead ? "#00c8d7" : "#4dd9e6"}
                stroke="#0e1318"
                strokeWidth="2.5"
                style={{
                  filter: p.lead
                    ? "drop-shadow(0 0 12px rgba(0,200,215,0.9))"
                    : "none",
                }}
              />
              {p.lead && (
                <circle
                  cx={p.x * 4}
                  cy={p.y * 4}
                  r="14"
                  fill="none"
                  stroke="#00c8d7"
                  strokeWidth="1.5"
                >
                  <animate
                    attributeName="r"
                    from="8"
                    to="26"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.8"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <text
                x={p.x * 4 + 11}
                y={p.y * 4 + 4}
                fill="#e8f0f8"
                fontSize="11"
                fontWeight="700"
                fontFamily="Inter"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ─── 3D TILT CARD ───────────────────────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
  intensity = 6,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      x: -y * intensity,
      y: x * intensity,
      glareX: ((e.clientX - rect.left) / rect.width) * 100,
      glareY: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() =>
        setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 })
      }
      className={className}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.18s ease-out",
        backgroundImage: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(0,200,215,0.07), transparent 50%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── MAGNETIC LINK ──────────────────────────────────────────────────────── */
function MagneticLink({
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.25,
      y: (e.clientY - rect.top - rect.height / 2) * 0.25,
    });
  };
  return (
    <a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className={className}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.2s ease-out",
      }}
      {...props}
    >
      {children}
    </a>
  );
}

/* ─── PARTICLE FIELD ─────────────────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const pts = Array.from({ length: 35 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,215,0.25)";
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W()) p.dx *= -1;
        if (p.y < 0 || p.y > H()) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i],
            b = pts[j],
            d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,200,215,${0.12 * (1 - d / 150)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-80"
    />
  );
}

/* ─── SPLIT TEXT ─────────────────────────────────────────────────────────── */
function SplitText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.1em" }}
        >
          <span
            className="inline-block"
            style={{
              animation: `wordRise 0.9s ${delay + i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1) both`,
            }}
          >
            {word}
            {i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border-b border-[#e8f0f8]/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-7 text-left group"
        data-cursor="hover"
      >
        <span className="font-display text-xl text-[#e8f0f8] font-semibold pr-8 group-hover:text-[#00c8d7] transition-colors duration-300">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-500 ${
            open
              ? "bg-[#00c8d7] border-[#00c8d7] rotate-180"
              : "border-[#e8f0f8]/15 group-hover:border-[#00c8d7]"
          }`}
        >
          <svg
            className={`w-4 h-4 ${open ? "text-[#080c10]" : "text-[#e8f0f8]"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 pb-7" : "max-h-0"}`}
      >
        <p className="text-[#7a8fa6] leading-relaxed text-base max-w-2xl">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const SERVICES = [
  {
    id: "01",
    title: "Compliance & Regulations",
    shortTitle: "Compliance",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    description:
      "We provide expert guidance through complex customs regulations, ensuring your shipments fully comply with requirements set by authorities such as HM Revenue & Customs. Stay ahead of every regulatory change with our proactive monitoring.",
    highlight: "HMRC Aligned",
    stat: "100%",
    statLabel: "Compliance Rate",
    color: "#00c8d7",
    features: [
      "HMRC Regulatory Alignment",
      "Post-Brexit Compliance",
      "Real-time Law Updates",
      "Zero-Penalty Track Record",
    ],
  },
  {
    id: "02",
    title: "Tariff Classification & Duty Advice",
    shortTitle: "Tariff & Duty",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
    description:
      "Our team identifies the correct commodity codes using internationally recognised Harmonized System (HS), ensuring accurate duty and VAT calculations — helping you avoid penalties, delays, or overpayments.",
    highlight: "HS Code Experts",
    stat: "Tailored",
    statLabel: "Savings Per Business",
    color: "#4dd9e6",
    features: [
      "HS Code Classification",
      "VAT & Duty Calculation",
      "Trade Agreement Analysis",
      "Duty Relief Schemes",
    ],
  },
  {
    id: "03",
    title: "Import / Export Documentation",
    shortTitle: "Documentation",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    description:
      "We deliver detailed support in the preparation of essential documentation — including commercial invoices, packing lists, certificates of origin, and customs declarations — ensuring accuracy at every stage.",
    highlight: "End-to-End Docs",
    stat: "Flexible",
    statLabel: "Based on Scope",
    color: "#8a9ab5",
    features: [
      "Commercial Invoices",
      "Certificates of Origin",
      "Customs Declarations",
      "Packing Lists & Manifests",
    ],
  },
  {
    id: "04",
    title: "Duty & Tax Optimisation",
    shortTitle: "Duty Optimisation",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    description:
      "To help optimise your costs, we advise on legitimate duty and tax reduction opportunities — including available relief schemes and applicable free trade agreements. Our strategic approach ensures maximum savings within full legal compliance.",
    highlight: "Cost Reduction",
    stat: "30%",
    statLabel: "Avg. Cost Saving",
    color: "#b8c6d6",
    features: [
      "Duty Relief Schemes",
      "Free Trade Agreements",
      "Tax Reduction Strategy",
      "Relief Scheme Applications",
    ],
  },
  {
    id: "05",
    title: "Risk Management & Audits",
    shortTitle: "Risk & Audits",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    description:
      "We assess potential compliance risks and prepare your business for customs audits, significantly reducing the likelihood of fines, shipment delays, or seizures. Our proactive audit preparation has helped clients maintain clean HMRC records consistently.",
    highlight: "Proactive Protection",
    stat: "98%",
    statLabel: "Audit Pass Rate",
    color: "#0099a8",
    features: [
      "Compliance Risk Assessment",
      "Customs Audit Preparation",
      "HMRC Dispute Support",
      "Seizure Prevention",
    ],
  },
  {
    id: "06",
    title: "Training & Ongoing Support",
    shortTitle: "Training",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
    description:
      "We offer staff training on customs procedures, provide updates on regulatory changes (including post-Brexit requirements), and deliver ongoing advisory support to keep your operations compliant and efficient.",
    highlight: "Knowledge Transfer",
    stat: "500+",
    statLabel: "Staff Trained",
    color: "#4dd9e6",
    features: [
      "Bespoke Staff Workshops",
      "Post-Brexit Briefings",
      "Regulatory Update Reports",
      "On-Demand Expert Support",
    ],
  },
];

/* ─── WORKFLOW STEPS ─────────────────────────────────────────────────────── */
const WORKFLOW = [
  {
    num: "01",
    title: "Initial Assessment",
    desc: "An initial assessment will be conducted to understand your requirements, trade routes, current compliance posture, and biggest pain points.",
    icon: <FiSearch size={26} />,
  },
  {
    num: "02",
    title: "Client Meeting",
    desc: "A face-to-face or online meeting will help deep-dive your business — mapping operations, identifying risks, and building a shared understanding.",
    icon: <FiUsers size={26} />,
  },
  {
    num: "03",
    title: "Quotation",
    desc: "A cost-effective solution will be proposed with a competitive quote tailored to your specific requirements and service level.",
    icon: <FiTag size={26} />,
  },
  {
    num: "04",
    title: "Assessment Report",
    desc: "A comprehensive professional report will be presented — covering findings, recommendations, and your bespoke customs roadmap.",
    icon: <FiBarChart2 size={26} />,
  },
  {
    num: "05",
    title: "After Sales Service",
    desc: "After-sales support will be available in line with the selected service level — from quarterly audits to on-demand expert advisory.",
    icon: <FiShield size={26} />,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES SECTION — PARALLAX SCROLL
   Each card scrolls naturally into view with parallax depth effect.
   NO sticky/pinned screen. Cards fade+slide in as you scroll down.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Individual service card with parallax */
function ParallaxServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.94, 1, 1, 0.98]);

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, scale }}
      className="relative max-w-6xl mx-auto px-6 lg:px-10"
    >
      <motion.div
        className="relative rounded-3xl overflow-hidden border"
        style={{
          background: "rgba(14,19,24,0.97)",
          borderColor: `${service.color}28`,
          boxShadow: `0 0 0 1px ${service.color}12, 0 40px 80px -20px ${service.color}18`,
          backdropFilter: "blur(24px)",
          y,
        }}
      >
        {/* Top accent line */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${service.color}, ${service.color}40, transparent)`,
          }}
        />

        {/* Watermark number */}
        <div
          className="absolute top-4 right-6 font-display text-[7rem] font-bold select-none pointer-events-none leading-none"
          style={{ color: `${service.color}06` }}
        >
          {service.id}
        </div>

        {/* Glow blob */}
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none blur-3xl"
          style={{ background: `${service.color}10` }}
        />

        <div className="h-full grid md:grid-cols-2">
          {/* LEFT PANEL */}
          <div className="p-6 lg:p-10 flex flex-col justify-between relative z-10">
            <div>
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-[#080c10]"
                style={{ background: service.color }}
              >
                {service.icon}
              </div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-4"
                style={{
                  background: `${service.color}15`,
                  color: service.color,
                  border: `1px solid ${service.color}30`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: service.color }}
                />
                {service.highlight}
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-[#e8f0f8] mb-3 leading-tight">
                {service.title}
              </h3>
              <p className="text-[#7a8fa6] leading-relaxed text-sm lg:text-base">
                {service.description}
              </p>
            </div>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-sm rounded-full px-5 py-2.5 self-start transition-all duration-300 hover:scale-105 hover:shadow-xl text-[#080c10]"
              style={{ background: service.color }}
              data-cursor="hover"
            >
              Get Started
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="p-6 lg:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l"
            style={{ borderColor: `${service.color}12` }}
          >
            {/* Features */}
            <div>
              <p className="text-xs text-[#7a8fa6] uppercase tracking-widest font-bold mb-3">
                What&apos;s Included
              </p>
              <div className="space-y-2">
                {service.features.map((f, fi) => (
                  <motion.div
                    key={fi}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: fi * 0.07,
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{
                      background: "rgba(232,240,248,0.03)",
                      border: "1px solid rgba(232,240,248,0.05)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${service.color}20` }}
                    >
                      <svg
                        className="w-3 h-3"
                        style={{ color: service.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-[#e8f0f8]/80 font-medium">
                      {f}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ServicesSection() {
  return (
    <>
      <section id="services" className="py-28 relative bg-[#080c10]">
        {/* Background decoratives */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#00c8d7]/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#8a9ab5]/[0.03] blur-[80px]" />
        </div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto px-6 lg:px-10 mb-20"
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-3">
                <span className="w-8 h-px bg-[#00c8d7]" />
                What We Offer
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e8f0f8] leading-tight">
                Six solutions,{" "}
                <span
                  className="italic"
                  style={{
                    background:
                      "linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "gradShift 8s ease infinite",
                  }}
                >
                  one expert team.
                </span>
              </h2>
            </div>
            <p className="text-[#7a8fa6] max-w-sm leading-relaxed text-sm">
              Comprehensive customs expertise from compliance to cost optimisation — every solution tailored to your trade routes and industry.
            </p>
          </div>
        </motion.div>

        {/* Parallax cards — each scrolls naturally with depth */}
        <div className="space-y-10 lg:space-y-16">
          {SERVICES.map((service) => (
            <ParallaxServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WORKFLOW SECTION
   ═══════════════════════════════════════════════════════════════════════════ */
function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="py-28 relative overflow-hidden"
      style={{ background: "#0e1318" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-40 top-20 w-96 h-96 rounded-full bg-[#00c8d7]/[0.05] blur-[80px]" />
        <div className="absolute -left-20 bottom-20 w-64 h-64 rounded-full bg-[#8a9ab5]/[0.03] blur-[60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5 justify-center">
            <span className="w-8 h-px bg-[#00c8d7]" />
            Our Process
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e8f0f8] leading-[1.02] mb-5">
            A clear path from{" "}
            <span
              className="italic"
              style={{
                background:
                  "linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradShift 8s ease infinite",
              }}
            >
              first call
            </span>{" "}
            to full compliance.
          </h2>
          <p className="text-[#e8f0f8]/55 text-lg leading-relaxed">
            Our five-step service structure ensures every client receives a
            thorough, transparent, and tailored engagement.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#e8f0f8]/5 hidden lg:block" />
          <motion.div
            className="absolute left-[50%] top-0 w-px bg-gradient-to-b from-[#00c8d7] to-[#00c8d7]/10 origin-top hidden lg:block"
            style={{ scaleY: lineScaleY, height: "100%" }}
          />

          <div className="space-y-10 lg:space-y-0">
            {WORKFLOW.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:pb-20`}
                >
                  <div
                    className={`${isEven ? "lg:text-right lg:pr-16" : "lg:col-start-2 lg:pl-16 lg:row-start-1"}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl p-7 border inline-block w-full max-w-lg"
                      style={{
                        background: "rgba(20,28,36,0.8)",
                        borderColor: "rgba(0,200,215,0.12)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}
                      >
                        <span className="flex items-center text-[#00c8d7]">{step.icon}</span>
                        <span className="font-display text-5xl font-bold text-[#e8f0f8]/[0.06]">
                          {step.num}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#e8f0f8] mb-3 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[#7a8fa6] leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>
                  <div
                    className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
                  >
                    <motion.div
                      whileInView={{ scale: [0.5, 1.15, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="w-14 h-14 rounded-full border-2 border-[#00c8d7] bg-[#0e1318] flex items-center justify-center text-[#00c8d7] font-display font-bold text-base shadow-[0_0_30px_rgba(0,200,215,0.3)]"
                    >
                      {step.num}
                    </motion.div>
                  </div>
                  {isEven && <div className="hidden lg:block" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <div
            className="inline-flex flex-col items-center gap-4 rounded-3xl p-10 border"
            style={{
              background: "rgba(20,28,36,0.8)",
              borderColor: "rgba(0,200,215,0.15)",
            }}
          >
            <p className="font-display text-2xl font-semibold text-[#e8f0f8]">
              Ready to start the process?
            </p>
            <p className="text-[#7a8fa6] max-w-md text-center">
              Book your free Initial Assessment today. No obligation, no jargon
              — just clear, expert guidance from day one.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 font-bold text-sm rounded-full px-8 py-4 bg-[#00c8d7] text-[#080c10] hover:bg-[#4dd9e6] transition-all hover:shadow-xl hover:shadow-[#00c8d7]/25"
              data-cursor="hover"
            >
              Book Free Assessment
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── WHY US ─────────────────────────────────────────────────────────────── */
function WhyUsSection() {
  const reasons = [
    {
      num: "01",
      title: "Deep Regulatory Knowledge",
      desc: "Stay ahead of every UK and international customs law change with real-time monitoring and proactive alerts.",
      icon: <FiBook size={26} />,
    },
    {
      num: "02",
      title: "Tailored to Your Business",
      desc: "Bespoke strategies aligned with your industry, trade routes and risk profile — never a one-size-fits-all approach.",
      icon: <FiCrosshair size={26} />,
    },
    {
      num: "03",
      title: "Proactive, Not Reactive",
      desc: "We identify problems before they become penalties — saving you time, money and reputational risk.",
      icon: <FiZap size={26} />,
    },
    {
      num: "04",
      title: "End-to-End Support",
      desc: "From first consultation to in-house training, we are seamlessly embedded at every stage of your trade lifecycle.",
      icon: <FiLink size={26} />,
    },
    {
      num: "05",
      title: "HMRC-Aligned Expertise",
      desc: "Our consultants have deep familiarity with HMRC requirements, ensuring your declarations are always accurate.",
      icon: <FiCheckCircle size={26} />,
    },
    {
      num: "06",
      title: "Duty Optimisation Focus",
      desc: "We don't just ensure compliance — we actively seek legitimate savings through relief schemes and trade agreements.",
      icon: <FiDollarSign size={26} />,
    },
  ];
  return (
    <section className="py-28 bg-[#080c10] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#00c8d7]/[0.03] blur-[100px]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5 justify-center">
            <span className="w-8 h-px bg-[#00c8d7]" />
            The Difference
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e8f0f8] leading-[1.02]">
            Why leading UK businesses{" "}
            <span
              className="italic"
              style={{
                background:
                  "linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradShift 8s ease infinite",
              }}
            >
              choose us.
            </span>
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reasons.map((r) => (
            <motion.div
              key={r.num}
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.96 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="rounded-3xl p-7 border group relative overflow-hidden"
              style={{
                background: "rgba(20,28,36,0.7)",
                borderColor: "rgba(0,200,215,0.1)",
              }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#00c8d7]/[0.08] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-4 text-[#00c8d7]">{r.icon}</div>
              <span className="font-display text-5xl font-bold text-[#e8f0f8]/[0.04] group-hover:text-[#00c8d7]/15 transition-colors duration-500 leading-none select-none block mb-3">
                {r.num}
              </span>
              <h3 className="font-display text-xl font-semibold text-[#e8f0f8] mb-2 leading-tight">
                {r.title}
              </h3>
              <p className="text-[#7a8fa6] leading-relaxed text-sm">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── TRUST STRIP ────────────────────────────────────────────────────────── */
function TrustStrip() {
  const badges = [
    { label: "HMRC Registered",    icon: <FiHome size={22} />,        sub: "UK Revenue Authority" },
    { label: "WCO Compliant",       icon: <FiGlobe size={22} />,       sub: "World Customs Org." },
    { label: "ICC Member",          icon: <FiCheckSquare size={22} />, sub: "Int'l Chamber of Commerce" },
    { label: "BIFA Aligned",        icon: <FiAnchor size={22} />,      sub: "British Int'l Freight Assoc." },
    { label: "UK Trade Authority",  icon: <FiFlag size={22} />,        sub: "Government Registered" },
    { label: "ISO Certified",       icon: <FiClipboard size={22} />,   sub: "International Standards Org." },
  ];

  return (
    <section
      className="py-24 relative overflow-hidden border-y"
      style={{ background: "#0e1318", borderColor: "rgba(0,200,215,0.15)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] rounded-full bg-[#00c8d7]/[0.05] blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5 justify-center">
            <span className="w-10 h-px bg-[#00c8d7]" />
            Accredited &amp; Recognised
            <span className="w-10 h-px bg-[#00c8d7]" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#e8f0f8] leading-tight mb-4">
            Trusted by leading UK &amp;{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradShift 8s ease infinite",
              }}
            >
              international authorities
            </span>
          </h2>
          <p className="text-[#7a8fa6] max-w-xl mx-auto leading-relaxed">
            Our credentials span government agencies, international trade bodies and professional organisations — giving you complete confidence in every engagement.
          </p>
        </motion.div>

        {/* Badge grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {badges.map((b, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.96 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group flex flex-col items-center gap-4 p-6 rounded-2xl border text-center relative overflow-hidden"
              style={{
                background: "rgba(20,28,36,0.9)",
                borderColor: "rgba(0,200,215,0.14)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,200,215,0.1), transparent 65%)" }}
              />
              {/* Icon */}
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-[#00c8d7] transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(0,200,215,0.1)",
                  border: "1px solid rgba(0,200,215,0.22)",
                  boxShadow: "0 0 20px rgba(0,200,215,0.08)",
                }}
              >
                {b.icon}
              </div>
              {/* Label */}
              <div className="relative">
                <p className="text-sm font-bold text-[#e8f0f8] mb-1">{b.label}</p>
                <p className="text-[10px] text-[#7a8fa6] leading-relaxed">{b.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── GLOBAL COVERAGE MAP ────────────────────────────────────────────────── */
function GlobalCoverageSection() {
  /* ISO-3166-1 numeric codes → region bucket */
  const REGION_MAP: Record<string, string> = {
    // ── Americas ──
    "124":"americas","840":"americas","484":"americas","304":"americas",
    "320":"americas","340":"americas","222":"americas","558":"americas",
    "188":"americas","591":"americas","84":"americas","192":"americas",
    "214":"americas","332":"americas","388":"americas","76":"americas",
    "32":"americas","152":"americas","170":"americas","604":"americas",
    "862":"americas","858":"americas","600":"americas","68":"americas",
    "218":"americas","328":"americas","740":"americas","254":"americas",
    "630":"americas","44":"americas","52":"americas","308":"americas",
    "662":"americas","780":"americas","659":"americas","670":"americas",
    // ── Europe ──
    "826":"europe","250":"europe","276":"europe","380":"europe","724":"europe",
    "620":"europe","528":"europe","56":"europe","756":"europe","40":"europe",
    "442":"europe","752":"europe","578":"europe","208":"europe","246":"europe",
    "352":"europe","616":"europe","203":"europe","703":"europe","348":"europe",
    "642":"europe","100":"europe","804":"europe","112":"europe","498":"europe",
    "191":"europe","705":"europe","688":"europe","70":"europe","807":"europe",
    "8":"europe","499":"europe","300":"europe","233":"europe","428":"europe",
    "440":"europe","372":"europe","470":"europe","643":"europe",
    "438":"europe","492":"europe","674":"europe","336":"europe","20":"europe",
    // ── MEA ──
    "818":"mea","784":"mea","682":"mea","634":"mea","414":"mea","512":"mea",
    "400":"mea","422":"mea","760":"mea","275":"mea","368":"mea","364":"mea",
    "887":"mea","48":"mea","376":"mea","792":"mea","504":"mea","12":"mea",
    "788":"mea","434":"mea","729":"mea","566":"mea","288":"mea","686":"mea",
    "324":"mea","466":"mea","204":"mea","854":"mea","384":"mea","430":"mea",
    "694":"mea","768":"mea","404":"mea","800":"mea","834":"mea","646":"mea",
    "108":"mea","231":"mea","262":"mea","232":"mea","706":"mea","24":"mea",
    "180":"mea","178":"mea","266":"mea","120":"mea","140":"mea","148":"mea",
    "710":"mea","516":"mea","72":"mea","748":"mea","426":"mea","508":"mea",
    "716":"mea","454":"mea","894":"mea","450":"mea","690":"mea","480":"mea",
    "174":"mea","562":"mea","270":"mea","624":"mea",
    // ── APAC ──
    "356":"apac","586":"apac","50":"apac","144":"apac","524":"apac","64":"apac",
    "462":"apac","156":"apac","392":"apac","410":"apac","408":"apac","496":"apac",
    "158":"apac","764":"apac","702":"apac","458":"apac","360":"apac","608":"apac",
    "704":"apac","418":"apac","116":"apac","104":"apac","96":"apac","398":"apac",
    "417":"apac","762":"apac","795":"apac","860":"apac","4":"apac","36":"apac",
    "554":"apac","598":"apac","242":"apac","626":"apac","776":"apac","882":"apac",
    "548":"apac","90":"apac",
  };

  const REGION_STYLE = {
    americas: { fill:"rgba(0,200,215,0.15)",   stroke:"rgba(0,200,215,0.5)",   hover:"rgba(0,200,215,0.28)",   color:"#00c8d7" },
    europe:   { fill:"rgba(77,217,230,0.17)",   stroke:"rgba(77,217,230,0.55)",  hover:"rgba(77,217,230,0.32)",   color:"#4dd9e6" },
    mea:      { fill:"rgba(138,154,181,0.15)",  stroke:"rgba(138,154,181,0.45)", hover:"rgba(138,154,181,0.28)",  color:"#8a9ab5" },
    apac:     { fill:"rgba(184,198,214,0.15)",  stroke:"rgba(184,198,214,0.45)", hover:"rgba(184,198,214,0.28)",  color:"#b8c6d6" },
  } as const;

  const markers: Array<{
    coordinates: [number, number]; label: string; region: string;
    lead?: boolean; major?: boolean;
  }> = [
    // Europe
    { coordinates: [-0.1278,  51.5074], label: "London",        region: "europe", lead: true },
    { coordinates: [ 2.3522,  48.8566], label: "Paris",         region: "europe", major: true },
    { coordinates: [13.4050,  52.5200], label: "Berlin",        region: "europe", major: true },
    { coordinates: [37.6173,  55.7558], label: "Moscow",        region: "europe" },
    // Americas
    { coordinates: [-74.0060, 40.7128], label: "New York",      region: "americas", major: true },
    { coordinates: [-99.1332, 19.4326], label: "Mexico City",   region: "americas" },
    { coordinates: [-46.6333,-23.5505], label: "São Paulo",     region: "americas", major: true },
    { coordinates: [-58.3816,-34.6037], label: "Buenos Aires",  region: "americas" },
    { coordinates: [-79.3832, 43.6532], label: "Toronto",       region: "americas" },
    // MEA
    { coordinates: [ 55.2708, 25.2048], label: "Dubai",         region: "mea", major: true },
    { coordinates: [ 31.2357, 30.0444], label: "Cairo",         region: "mea" },
    { coordinates: [  3.3792,  6.5244], label: "Lagos",         region: "mea" },
    { coordinates: [ 36.8219, -1.2921], label: "Nairobi",       region: "mea" },
    { coordinates: [ 28.0473,-26.2041], label: "Johannesburg",  region: "mea", major: true },
    { coordinates: [ 46.6753, 24.6877], label: "Riyadh",        region: "mea" },
    // APAC
    { coordinates: [ 72.8777, 19.0760], label: "Mumbai",        region: "apac", major: true },
    { coordinates: [121.4737, 31.2304], label: "Shanghai",      region: "apac", major: true },
    { coordinates: [139.6917, 35.6895], label: "Tokyo",         region: "apac", major: true },
    { coordinates: [103.8198,  1.3521], label: "Singapore",     region: "apac", major: true },
    { coordinates: [151.2093,-33.8688], label: "Sydney",        region: "apac", major: true },
    { coordinates: [106.8456, -6.2088], label: "Jakarta",       region: "apac" },
    { coordinates: [100.5018, 13.7563], label: "Bangkok",       region: "apac" },
  ];

  const regions = [
    { id: "americas", label: "Americas", count: "35+", color: "#00c8d7", desc: "North & South America" },
    { id: "europe",   label: "Europe",   count: "50+", color: "#4dd9e6", desc: "UK, EU & Eastern Europe" },
    { id: "mea",      label: "MEA",      count: "45+", color: "#8a9ab5", desc: "Middle East & Africa" },
    { id: "apac",     label: "APAC",     count: "40+", color: "#b8c6d6", desc: "Asia Pacific & Oceania" },
  ];

  return (
    <section id="coverage" className="py-28 relative overflow-hidden" style={{ background: "#0e1318" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] rounded-full bg-[#00c8d7]/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5 justify-center">
            <span className="w-8 h-px bg-[#00c8d7]" />
            Global Reach
            <span className="w-8 h-px bg-[#00c8d7]" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e8f0f8] leading-[1.02] mb-5">
            Operating across{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradShift 8s ease infinite",
              }}
            >
              160+ countries
            </span>
          </h2>
          <p className="text-[#e8f0f8]/55 leading-relaxed text-lg">
            From London to Tokyo, New York to Dubai — UK-based customs expertise spanning APAC, MEA, Europe and the Americas via all modes of transport.
          </p>
        </motion.div>

        {/* Map card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border mb-8"
          style={{
            background: "#060a0e",
            borderColor: "rgba(0,200,215,0.15)",
            boxShadow: "0 0 0 1px rgba(0,200,215,0.06), 0 40px 80px -20px rgba(0,0,0,0.7)",
          }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 165, center: [10, 10] }}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Ocean */}
            <Sphere id="rsm-sphere" fill="#060a0e" stroke="rgba(0,200,215,0.07)" strokeWidth={0.5} />
            {/* Lat/lon graticule */}
            <Graticule stroke="rgba(232,240,248,0.045)" strokeWidth={0.35} />

            {/* Countries — real borders from TopoJSON */}
            <Geographies geography="/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const rid = REGION_MAP[String(geo.id)];
                  const rs  = rid ? REGION_STYLE[rid as keyof typeof REGION_STYLE] : null;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={rs ? rs.fill : "rgba(18,28,40,0.92)"}
                      stroke={rs ? rs.stroke : "rgba(0,200,215,0.09)"}
                      strokeWidth={0.45}
                      style={{
                        default: { outline: "none" },
                        hover:   { outline: "none", fill: rs ? rs.hover : "rgba(26,38,52,0.95)" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* City markers */}
            {markers.map((m, i) => {
              const rs = REGION_STYLE[m.region as keyof typeof REGION_STYLE];
              const col = rs.color;
              return (
                <Marker key={i} coordinates={m.coordinates}>
                  {/* Pulse ring for London HQ */}
                  {m.lead && (
                    <circle r={20} fill="none" stroke={col} strokeWidth={0.8} opacity={0.5}>
                      <animate attributeName="r"       from="7"  to="24"  dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0"  dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Dot */}
                  <circle
                    r={m.lead ? 6 : m.major ? 4 : 2.8}
                    fill={col}
                    stroke="#060a0e"
                    strokeWidth={m.lead ? 2.5 : 1.5}
                    style={{ filter: `drop-shadow(0 0 ${m.lead ? 12 : m.major ? 7 : 4}px ${col}cc)` }}
                  />
                  {/* Label */}
                  {(m.lead || m.major) && (
                    <text
                      y={m.lead ? -11 : -8}
                      textAnchor="middle"
                      fill={m.lead ? "#e8f0f8" : col}
                      fontSize={m.lead ? 8.5 : 6.5}
                      fontWeight={m.lead ? "800" : "600"}
                      fontFamily="Inter,sans-serif"
                      paintOrder="stroke"
                      stroke="#060a0e"
                      strokeWidth={3}
                    >
                      {m.label}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Region label overlays */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <span className="absolute top-5 left-[10%]  text-[9px] font-black tracking-[3.5px] text-[#00c8d7]/55">AMERICAS</span>
            <span className="absolute top-5 left-[46%]  text-[9px] font-black tracking-[3.5px] text-[#4dd9e6]/55">EUROPE</span>
            <span className="absolute top-[52%] left-[50%] text-[9px] font-black tracking-[3.5px] text-[#8a9ab5]/55">MEA</span>
            <span className="absolute top-5 right-[10%] text-[9px] font-black tracking-[3.5px] text-[#b8c6d6]/55">APAC</span>
          </div>

          {/* Edge fade */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom,rgba(6,10,14,0.35) 0%,transparent 7%,transparent 93%,rgba(6,10,14,0.35) 100%)" }} />
        </motion.div>

        {/* Region stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {regions.map((r) => (
            <motion.div
              key={r.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-2xl p-5 border text-center"
              style={{ background: "rgba(20,28,36,0.8)", borderColor: `${r.color}22` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${r.color}15`, border: `1px solid ${r.color}35` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
              </div>
              <p className="font-display text-3xl font-bold mb-1" style={{ color: r.color }}>{r.count}</p>
              <p className="text-sm font-bold text-[#e8f0f8] mb-1">{r.label}</p>
              <p className="text-[10px] text-[#7a8fa6] leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      "Working with Express Customs transformed how we approach international trade. Their proactive approach saved us thousands in duties and gave us complete peace of mind on every shipment.",
    name: "James Mitchell",
    role: "Operations Director, Global Importers Ltd",
    initials: "JM",
  },
  {
    quote:
      "The tariff classification expertise alone has saved our business significant sums annually. Their team is incredibly responsive and genuinely invested in our success.",
    name: "Sarah Thompson",
    role: "Head of Logistics, TechExport UK",
    initials: "ST",
  },
  {
    quote:
      "From documentation support to staff training, Express Customs has been indispensable since Brexit. We couldn't navigate the complexity without them.",
    name: "David Chen",
    role: "CEO, Pacific Bridge Trading",
    initials: "DC",
  },
];

function TestimonialSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((v) => (v + 1) % TESTIMONIALS.length),
      5000
    );
    return () => clearInterval(id);
  }, []);
  return (
    <section className="py-28 bg-[#080c10] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#00c8d7]/[0.04] blur-[80px]" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-10 justify-center">
            <span className="w-8 h-px bg-[#00c8d7]" />
            Client Voices
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-14 h-14 mx-auto text-[#00c8d7]/20 mb-7"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3 0-6 3-6 8s3 8 6 8h2v-8H8c0-2 2-4 4-4V8h-2zm12 0c-3 0-6 3-6 8s3 8 6 8h2v-8h-4c0-2 2-4 4-4V8h-2z" />
              </svg>
              <p className="font-display text-2xl md:text-4xl font-medium text-[#e8f0f8] leading-snug mb-9 max-w-3xl mx-auto">
                &ldquo;{TESTIMONIALS[active].quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#141c24] border border-[#00c8d7]/30 flex items-center justify-center text-[#4dd9e6] font-display font-bold">
                  {TESTIMONIALS[active].initials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#e8f0f8]">
                    {TESTIMONIALS[active].name}
                  </p>
                  <p className="text-sm text-[#7a8fa6]">
                    {TESTIMONIALS[active].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-9">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    i === active ? "#00c8d7" : "rgba(0,200,215,0.2)",
                  transform: i === active ? "scale(1.4)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT LEFT PANEL — Rich visual components
   ═══════════════════════════════════════════════════════════════════════════ */
function AboutLeftPanel() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [gaugeAnimated, setGaugeAnimated] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setGaugeAnimated(true), 350);
    return () => clearTimeout(t);
  }, [visible]);

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = gaugeAnimated ? circumference * 0.02 : circumference;

  const stats = [
    { value: "Free",  label: "Initial Consult", color: "#4dd9e6" },
    { value: "160+",  label: "Countries",        color: "#00c8d7" },
    { value: "98%",   label: "HMRC Aligned",     color: "#b8c6d6" },
  ];

  const certs = [
    { label: "HMRC", desc: "Tax Authority" },
    { label: "WCO",  desc: "World Customs" },
    { label: "ICC",  desc: "Int'l Chamber" },
    { label: "BIFA", desc: "Freight Assoc." },
    { label: "ISO",  desc: "Standards Org." },
    { label: "CDS",  desc: "UK Customs Decl." },
  ];

  return (
    <div
      ref={ref}
      className="flex flex-col gap-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-40px)",
        transition: "all 0.9s ease",
      }}
    >
      {/* ── Hero card ── */}
      <div
        className="relative rounded-3xl overflow-hidden border p-7"
        style={{
          background: "linear-gradient(135deg, rgba(20,28,36,0.98) 0%, rgba(8,12,16,0.99) 100%)",
          borderColor: "rgba(0,200,215,0.22)",
          boxShadow: "0 24px 64px -16px rgba(0,200,215,0.18), 0 0 0 1px rgba(0,200,215,0.06)",
        }}
      >
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#00c8d7]/[0.09] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#4dd9e6]/[0.05] blur-2xl pointer-events-none" />

        {/* Header badge */}
        <div className="flex items-center justify-between mb-7 relative z-10">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#00c8d7] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c8d7]" />
            Express Customs
          </div>
          <span className="text-[10px] text-[#7a8fa6] font-semibold tracking-wider">London · UK</span>
        </div>

        {/* ── SVG compliance gauge ── */}
        <div className="flex justify-center mb-7 relative z-10">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 170 170">
              {/* Dashed outer decoration ring */}
              <circle cx="85" cy="85" r="82" fill="none" stroke="rgba(0,200,215,0.08)" strokeWidth="1" strokeDasharray="3 7" />
              {/* Track */}
              <circle cx="85" cy="85" r={radius} fill="none" stroke="rgba(232,240,248,0.06)" strokeWidth="10" />
              {/* Soft glow layer */}
              <circle
                cx="85" cy="85" r={radius}
                fill="none"
                stroke="rgba(0,200,215,0.18)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1)", filter: "blur(6px)" }}
              />
              {/* Main progress ring */}
              <circle
                cx="85" cy="85" r={radius}
                fill="none"
                stroke="#00c8d7"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1)",
                  filter: "drop-shadow(0 0 12px rgba(0,200,215,0.85))",
                }}
              />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold text-[#e8f0f8] leading-none">98%</span>
              <span className="text-[10px] text-[#00c8d7] uppercase tracking-[0.2em] font-bold mt-2">Compliance</span>
              <span className="text-[9px] text-[#7a8fa6] tracking-widest mt-0.5">HMRC Aligned</span>
            </div>
          </div>
        </div>

        {/* ── 3 stat tiles ── */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 relative z-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(232,240,248,0.04)",
                border: `1px solid ${s.color}22`,
              }}
            >
              <p className="font-display text-xl font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-[#7a8fa6] uppercase tracking-widest mt-1.5 font-semibold leading-tight">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Transport modes ── */}
        <div className="relative z-10 mb-5">
          <p className="text-[10px] text-[#7a8fa6] uppercase tracking-[0.25em] font-bold mb-3">All Modes of Transport</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Air",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                ),
              },
              { label: "Sea",  icon: <FiAnchor size={16} /> },
              { label: "Road", icon: <FiTruck size={16} /> },
              {
                label: "Rail",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4.03-4-8-4zm-3.5 15c-.83 0-1.5-.67-1.5-1.5S7.67 14 8.5 14s1.5.67 1.5 1.5S9.33 17 8.5 17zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h13v5z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-center"
                style={{ background: "rgba(0,200,215,0.06)", border: "1px solid rgba(0,200,215,0.14)" }}
              >
                <span className="text-[#00c8d7]">{icon}</span>
                <span className="text-[9px] text-[#7a8fa6] font-bold uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Office hours ── */}
        <div className="relative z-10 pt-4 border-t border-[#e8f0f8]/8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#7a8fa6] uppercase tracking-[0.25em] font-bold mb-1">Office Hours</p>
              <p className="text-xs text-[#e8f0f8] font-semibold">Mon – Fri &nbsp; 9:00 – 18:00 GMT</p>
              <p className="text-[10px] text-[#7a8fa6] mt-0.5">Sat by appointment</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#00c8d7]"><FiClock size={18} /></span>
              <span className="text-[9px] text-emerald-400 font-bold">Free call</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Certification grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="rounded-2xl border p-5"
        style={{
          background: "rgba(20,28,36,0.8)",
          borderColor: "rgba(0,200,215,0.14)",
        }}
      >
        <p className="text-[10px] text-[#7a8fa6] uppercase tracking-[0.25em] font-bold mb-4">
          Certifications &amp; Memberships
        </p>
        <div className="grid grid-cols-3 gap-2">
          {certs.map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center"
              style={{
                background: "rgba(0,200,215,0.05)",
                borderColor: "rgba(0,200,215,0.15)",
              }}
            >
              <span className="text-[11px] font-bold tracking-widest text-[#4dd9e6]">{c.label}</span>
              <span className="text-[9px] text-[#7a8fa6] mt-0.5 tracking-wide">{c.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");
  const mouse = useMousePos();
  const progress = useScrollProgress();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ukTime = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/London",
        hour12: false,
      }).format(now);
      setTime(ukTime);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { ref: contactRef, visible: contactVisible } = useReveal();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=Inter:wght@300;400;500;600;700&display=swap');
        :root { scroll-behavior: smooth; }
        * { -webkit-font-smoothing: antialiased; }
        body { margin:0; background:#080c10; color:#e8f0f8; font-family:'Inter',sans-serif; overflow-x:hidden; }
        .font-display { font-family:'Fraunces',serif; letter-spacing:-0.025em; }

        .grad-text {
          background: linear-gradient(120deg,#e8f0f8 0%,#00c8d7 40%,#4dd9e6 60%,#e8f0f8 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          animation: gradShift 8s ease infinite;
        }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        .btn-primary { background:#00c8d7; color:#080c10; position:relative; overflow:hidden; transition:color 0.4s ease; }
        .btn-primary::before { content:''; position:absolute; inset:0; background:#4dd9e6; transform:translateY(100%); transition:transform 0.4s cubic-bezier(0.65,0,0.35,1); }
        .btn-primary:hover::before { transform:translateY(0); }
        .btn-primary>* { position:relative; z-index:1; }

        .btn-ghost { background:transparent; color:#e8f0f8; border:1.5px solid rgba(232,240,248,0.18); position:relative; overflow:hidden; transition:color 0.4s ease,border-color 0.3s ease; }
        .btn-ghost::before { content:''; position:absolute; inset:0; background:rgba(232,240,248,0.05); transform:translateY(100%); transition:transform 0.4s cubic-bezier(0.65,0,0.35,1); }
        .btn-ghost:hover { color:#4dd9e6; border-color:rgba(0,200,215,0.5); }
        .btn-ghost:hover::before { transform:translateY(0); }
        .btn-ghost>* { position:relative; z-index:1; }

        @keyframes wordRise { from{transform:translateY(110%)} to{transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulseRing { 0%{transform:scale(0.95);opacity:1} 100%{transform:scale(1.7);opacity:0} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes drawLine { to{stroke-dashoffset:0} }
        @keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .grid-bg {
          background-image: linear-gradient(to right,rgba(0,200,215,0.04) 1px,transparent 1px), linear-gradient(to bottom,rgba(0,200,215,0.04) 1px,transparent 1px);
          background-size: 56px 56px;
        }
        .noise { background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0.78 0 0 0 0 0.84 0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
        .glass { background:rgba(14,19,24,0.92); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(232,240,248,0.06); }
        .glass-card { background:rgba(20,28,36,0.8); backdrop-filter:blur(12px); border:1px solid rgba(0,200,215,0.15); }

        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:0; height:2px; background:#00c8d7; transition:width 0.35s ease; }
        .nav-link:hover::after { width:100%; }

        .section-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(0,200,215,0.12),transparent); }
        .logo-img { height:38px; width:auto; object-fit:contain; }
        .logo-img-lg { height:52px; width:auto; object-fit:contain; }
      `}</style>

      <CustomCursor />

      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-[#00c8d7] origin-left"
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      {/* ═══ NAVIGATION ════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-[0_2px_30px_-8px_rgba(0,0,0,0.7)]" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-3 group"
            data-cursor="hover"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Express Customs Consulting UK Ltd"
                width={150}
                height={38}
                className="logo-img group-hover:opacity-90 transition-opacity duration-300"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080c10]" />
            </div>
          </a>
          <div className="hidden md:flex items-center gap-10 text-sm text-[#e8f0f8] font-medium">
            {[
              ["About", "about"],
              ["Services", "services"],
              ["Process", "process"],
              ["Contact", "contact"],
            ].map(([l, h]) => (
              <a
                key={h}
                href={`#${h}`}
                className="nav-link hover:text-[#00c8d7] transition-colors duration-300"
                data-cursor="hover"
              >
                {l}
              </a>
            ))}
          </div>
          <MagneticLink
            href="#contact"
            className="hidden md:flex btn-primary items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
          >
            <span className="relative z-10">Free Consultation</span>
            <svg
              className="w-4 h-4 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </MagneticLink>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 text-[#e8f0f8]"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 glass ${menuOpen ? "max-h-80" : "max-h-0"}`}
        >
          {[
            ["About", "about"],
            ["Services", "services"],
            ["Process", "process"],
            ["Contact", "contact"],
          ].map(([l, h]) => (
            <a
              key={h}
              href={`#${h}`}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-4 text-[#e8f0f8] hover:bg-white/5 hover:text-[#00c8d7] text-sm border-b border-[#e8f0f8]/8 font-medium"
            >
              {l}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-[#080c10] pt-24">
        {/* Mouse glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(700px circle at ${mouse.x}% ${mouse.y}%, rgba(0,200,215,0.09), transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-60" />
        <ParticleField />
        <div className="absolute inset-0 noise opacity-60 pointer-events-none" />

        {/* Side badges — desktop */}
        <div className="hidden lg:flex absolute top-32 left-10 flex-col gap-3 text-[10px] tracking-[0.3em] uppercase text-[#e8f0f8]/25 font-semibold">
          <div className="rotate-180 [writing-mode:vertical-rl] flex items-center gap-3">
            <span>Customs Experts</span>
            <span className="w-8 h-px bg-[#e8f0f8]/25" />
            <span>United Kingdom</span>
          </div>
        </div>
        <div className="hidden lg:flex absolute top-32 right-10 flex-col items-end gap-2 text-[10px] tracking-[0.3em] uppercase text-[#e8f0f8]/25 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="font-display text-base text-[#e8f0f8] tabular-nums tracking-normal">
            {time}
          </div>
          <span>London · GMT</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16 min-h-[calc(100vh-6rem)]">
          {/* DESKTOP: two-col grid */}
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center h-full">
            {/* LEFT */}
            <div className="relative">
              <div
                className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-xs font-semibold text-[#e8f0f8] mb-8 shadow-sm"
                style={{ animation: "fadeUp 0.7s ease both" }}
              >
                <span className="relative flex w-2 h-2">
                  <span
                    className="absolute inset-0 rounded-full bg-emerald-400 opacity-75"
                    style={{ animation: "pulseRing 1.6s ease-out infinite" }}
                  />
                  <span className="relative rounded-full w-2 h-2 bg-emerald-400" />
                </span>
                <span className="tracking-widest uppercase">
                  UK Customs Specialists
                </span>
                <span className="text-[#e8f0f8]/30">·</span>
                <span className="text-[#00c8d7]">HMRC Aligned</span>
              </div>

              <h1 className="font-display text-[3rem] md:text-[5rem] font-bold leading-[0.92] mb-8 text-[#e8f0f8]">
                <SplitText text="Navigate" />
                <br />
                <span className="relative inline-block">
                  <SplitText
                    text="Customs"
                    className="grad-text italic"
                    delay={0.15}
                  />
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="14"
                    viewBox="0 0 200 14"
                    fill="none"
                  >
                    <path
                      d="M2 9 Q 50 2 100 7 T 198 6"
                      stroke="#00c8d7"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 250,
                        strokeDashoffset: 250,
                        animation: "drawLine 1.5s 1.2s ease forwards",
                      }}
                    />
                  </svg>
                </span>
                <br />
                <SplitText text="with Confidence." delay={0.3} />
              </h1>

              <p
                className="text-[#e8f0f8]/55 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
                style={{ animation: "fadeUp 0.9s 0.55s ease both" }}
              >
                Grow your business with comprehensive, effective customs
                solutions. From compliance to global trade strategy — we handle
                the complexity so you can focus on what matters most.
              </p>

              <div
                className="flex flex-wrap gap-4 mb-12"
                style={{ animation: "fadeUp 0.9s 0.7s ease both" }}
              >
                <MagneticLink
                  href="#contact"
                  className="btn-primary font-semibold px-7 py-4 rounded-full text-sm inline-flex items-center gap-2"
                >
                  <span>Get Free Consultation</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </MagneticLink>
                <MagneticLink
                  href="#services"
                  className="btn-ghost font-semibold px-7 py-4 rounded-full text-sm"
                >
                  <span>Explore Services</span>
                </MagneticLink>
              </div>

              <div
                className="flex items-center gap-5"
                style={{ animation: "fadeUp 0.9s 0.85s ease both" }}
              >
                <div className="flex -space-x-3">
                  {["#4dd9e6", "#141c24", "#00c8d7", "#1e3a5f"].map((c, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-[#080c10] shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${c}, ${c}cc)`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[#7a8fa6] text-sm">
                    Trusted by{" "}
                    <span className="font-semibold text-[#e8f0f8]">
                      UK importers &amp; exporters
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — Globe */}
            <div
              className="relative w-full"
              style={{ animation: "fadeRight 1.1s 0.4s ease both" }}
            >
              <div className="relative mx-auto w-full max-w-sm lg:max-w-none lg:w-[460px] aspect-square">
                <ConnectionGlobe />
              </div>

              {/* Floating cards */}
              <div
                className="hidden sm:block absolute top-2 right-0 glass-card rounded-2xl p-4 w-52 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
                style={{ animation: "floatY 5s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/40 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#e8f0f8] font-semibold text-sm">
                      HMRC Compliant
                    </p>
                    <p className="text-emerald-400 text-[10px] font-semibold">
                      All clear
                    </p>
                  </div>
                </div>
              </div>


              <div
                className="hidden sm:block absolute bottom-6 right-0 glass-card rounded-2xl p-4 w-56 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
                style={{ animation: "floatY 5.5s ease-in-out infinite 0.5s" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#00c8d7]/15 flex items-center justify-center text-[#00c8d7]">
                    <FiClock size={14} />
                  </div>
                  <p className="text-[10px] text-[#7a8fa6] font-semibold uppercase tracking-widest">
                    Office Hours
                  </p>
                </div>
                {[
                  ["Mon – Fri", "9:00 – 18:00"],
                  ["Sat", "By appointment"],
                ].map(([day, hrs]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between py-1.5 text-xs border-t border-[#e8f0f8]/8 first:border-0"
                  >
                    <span className="text-[#e8f0f8] font-semibold">{day}</span>
                    <span className="text-[#00c8d7] font-semibold text-[10px]">
                      {hrs}
                    </span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-[#e8f0f8]/8 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Free initial call</span>
                </div>
              </div>

              <div
                className="hidden sm:block absolute bottom-0 left-8 rounded-2xl p-4 shadow-2xl w-44 bg-[#00c8d7]"
                style={{ animation: "floatY 6.5s ease-in-out infinite 1.5s" }}
              >
                <p className="text-[10px] text-[#080c10]/70 tracking-widest uppercase mb-1 font-semibold">
                  Compliance
                </p>
                <p className="font-display text-3xl font-bold text-[#080c10]">
                  98<span className="text-[#080c10]/60">%</span>
                </p>
                <div className="mt-2 flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded ${i < 9 ? "bg-[#080c10]/40" : "bg-[#080c10]/15"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#e8f0f8]/25">
          <div className="w-6 h-10 border-2 border-[#e8f0f8]/18 rounded-full flex justify-center p-1.5">
            <div
              className="w-1 h-2 bg-[#e8f0f8]/25 rounded-full"
              style={{ animation: "floatY 1.5s ease-in-out infinite" }}
            />
          </div>
          <span className="text-[10px] tracking-widest uppercase font-bold">
            Scroll
          </span>
        </div>
      </section>

      {/* ═══ KINETIC MARQUEE ══════════════════════════════════════════ */}
      <section
        className="py-10 overflow-hidden relative border-y"
        style={{
          background: "#0e1318",
          borderColor: "rgba(0,200,215,0.12)",
        }}
      >
        <div
          className="flex whitespace-nowrap w-max"
          style={{ animation: "marqueeScroll 30s linear infinite" }}
        >
          {[...Array(2)].flatMap((_, k) =>
            [
              "Compliance",
              "Tariff Classification",
              "Documentation",
              "Duty Optimisation",
              "Risk Management",
              "Training",
              "Global Strategy",
            ].map((s, i) => (
              <div
                key={`${k}-${i}`}
                className="flex items-center gap-8 mx-8"
              >
                <span className="font-display text-5xl md:text-7xl font-semibold text-[#e8f0f8]/70">
                  {s}
                </span>
                <span className="text-[#00c8d7] text-5xl">✦</span>
              </div>
            ))
          )}
        </div>
      </section>

      <TrustStrip />
      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ ABOUT ════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="py-28 bg-[#080c10] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-start">
          {/* LEFT — rich visual panel (replaces the blank/tilt card) */}
          <AboutLeftPanel />

          {/* RIGHT — text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5">
              <span className="w-8 h-px bg-[#00c8d7]" />
              Who We Are
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#e8f0f8] leading-[1.02] mb-7">
              Decades of customs
              <br />
              expertise,{" "}
              <span className="grad-text italic">one trusted</span> team.
            </h2>
            <p className="text-[#e8f0f8]/60 text-lg leading-relaxed mb-5">
              With years of experience across a range of industries on a global
              scale, Express Customs Consulting UK Ltd understands the full
              complexity of modern customs operations — and provides extensive,
              tailored solutions for every client.
            </p>
            <p className="text-[#7a8fa6] leading-relaxed mb-9">
              Whether you&apos;re a growing SME or an established enterprise,
              our consultants work as an extension of your team — ensuring every
              shipment is fully compliant and every opportunity captured.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-9">
              {[
                ["Free", "Consultation"],
                ["160+", "Countries"],
                ["98%", "HMRC Aligned"],
              ].map(([n, l]) => (
                <div key={l} className="border-l-2 border-[#00c8d7] pl-4">
                  <p className="font-display text-4xl font-bold text-[#e8f0f8]">
                    {n}
                  </p>
                  <p className="text-xs text-[#7a8fa6] tracking-wider uppercase mt-1 font-semibold">
                    {l}
                  </p>
                </div>
              ))}
            </div>
            <MagneticLink
              href="#contact"
              className="btn-primary inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full text-sm"
            >
              <span>Start Your Project</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </MagneticLink>
          </motion.div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ GLOBAL COVERAGE MAP ══════════════════════════════════════ */}
      <GlobalCoverageSection />

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ SERVICES — Parallax scroll, no sticky pinning ════════════ */}
      <ServicesSection />

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ WORKFLOW ═════════════════════════════════════════════════ */}
      <WorkflowSection />

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ WHY US ═══════════════════════════════════════════════════ */}
      <WhyUsSection />

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ TESTIMONIALS ═════════════════════════════════════════════ */}
      <TestimonialSection />

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══ FAQ ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#080c10]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#00c8d7] font-bold mb-5 justify-center">
              <span className="w-8 h-px bg-[#00c8d7]" />
              Questions
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e8f0f8] leading-[1.02]">
              Frequently asked{" "}
              <span className="grad-text italic">questions.</span>
            </h2>
          </motion.div>
          <div
            className="rounded-3xl p-8 md:p-12 border"
            style={{
              background: "rgba(20,28,36,0.8)",
              borderColor: "rgba(0,200,215,0.12)",
            }}
          >
            {[
              {
                q: "What services does Express Customs Consulting offer?",
                a: "We provide end-to-end customs solutions: compliance & regulations, tariff classification & duty advice, import/export documentation, duty & tax optimisation, risk management & audits, and training & ongoing support. Every service is tailored to your specific industry and trade routes.",
              },
              {
                q: "How much does a consultation cost?",
                a: "Your initial consultation is completely free of charge and carries no obligation. Post-consultation fees are tailored to your business size, trade volume, and the scope of services required — from short-term project engagements to ongoing retainer arrangements. We provide a bespoke, transparent quote before any work begins.",
              },
              {
                q: "Do you only work with UK businesses?",
                a: "Our base is in the UK, but our expertise spans global trade. We assist UK businesses trading internationally as well as overseas companies trading into the UK market.",
              },
              {
                q: "How quickly can you onboard a new client?",
                a: "Most engagements move from initial assessment to active implementation within 14 days. Urgent compliance issues are escalated and handled within 48 hours.",
              },
              {
                q: "Can you train our in-house team?",
                a: "Absolutely. We run bespoke training programmes — including post-Brexit briefings, regulatory update workshops, and on-demand expert advisory — to empower your team to handle day-to-day customs operations confidently and independently.",
              },
            ].map((f, i) => (
              <FAQItem key={i} {...f} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ══════════════════════════════════════════════════ */}
      <section
        id="contact"
        className="py-28 bg-[#080c10] relative overflow-hidden"
      >
        <div
          ref={contactRef}
          className="max-w-6xl mx-auto px-6 lg:px-10"
          style={{
            opacity: contactVisible ? 1 : 0,
            transform: contactVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.9s ease",
          }}
        >
          <TiltCard
            className="relative border rounded-[2.5rem] p-10 md:p-16 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
            style={
              {
                background: "rgba(20,28,36,0.92)",
                borderColor: "rgba(0,200,215,0.18)",
              } as React.CSSProperties
            }
            intensity={3}
          >
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00c8d7]/12 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#4dd9e6]/6 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#4dd9e6] font-bold mb-6">
                  <span className="w-8 h-px bg-[#00c8d7]" />
                  Get Started
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-[#e8f0f8] leading-[1.02] mb-7">
                  Ready to navigate customs with{" "}
                  <span className="text-[#00c8d7] italic">confidence?</span>
                </h2>
                <p className="text-[#e8f0f8]/55 leading-relaxed mb-9 text-lg">
                  Reach out today for a free, no-obligation consultation. Our
                  customs experts are ready to help you trade smarter, faster
                  and fully compliant.
                </p>
                <div className="flex flex-wrap gap-4">
                  <MagneticLink
                    href="tel:+447886280525"
                    className="inline-flex items-center gap-3 bg-[#00c8d7] text-[#080c10] font-bold px-6 py-4 rounded-full text-sm hover:bg-[#4dd9e6] transition-all hover:shadow-xl hover:shadow-[#00c8d7]/25"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +44 7886 280525
                  </MagneticLink>
                  <MagneticLink
                    href="mailto:info.expresscustoms26@gmail.com"
                    className="inline-flex items-center gap-3 bg-[#e8f0f8]/6 border border-[#e8f0f8]/12 text-[#e8f0f8] font-semibold px-6 py-4 rounded-full text-sm hover:bg-[#e8f0f8]/10 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    info.expresscustoms26@gmail.com
                  </MagneticLink>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="relative aspect-square max-w-sm ml-auto">
                  <div className="absolute inset-0 rounded-full border border-[#e8f0f8]/7" />
                  <div className="absolute inset-6 rounded-full border border-[#e8f0f8]/9" />
                  <div className="absolute inset-12 rounded-full border border-[#00c8d7]/35 animate-[spin-slow_18s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#00c8d7] rounded-full shadow-[0_0_24px_rgba(0,200,215,0.9)]" />
                  </div>
                  <div className="absolute inset-20 rounded-full border border-[#e8f0f8]/13 animate-[spin-slow_12s_linear_infinite_reverse]">
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#e8f0f8] rounded-full" />
                  </div>
                  <div className="absolute inset-28 rounded-full bg-[#1c2530] border border-[#00c8d7]/30 flex items-center justify-center shadow-[0_0_60px_rgba(0,200,215,0.25)]">
                    <Image
                      src="/logo.png"
                      alt="EC"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer
        className="text-[#e8f0f8]/45 pt-20 pb-10 relative overflow-hidden border-t"
        style={{ background: "#050810", borderColor: "rgba(0,200,215,0.1)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-[0.03]" />
        <div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 font-display font-bold text-[14rem] leading-none pointer-events-none select-none whitespace-nowrap"
          style={{ color: "rgba(0,200,215,0.02)" }}
        >
          Express
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-[#e8f0f8]/7">
            <div className="md:col-span-2">
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Express Customs Consulting UK Ltd"
                  width={210}
                  height={52}
                  className="logo-img-lg opacity-90"
                />
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-8">
                Helping UK businesses navigate customs with confidence.
                Compliance, classification and global trade strategy under one
                expert roof.
              </p>
              <div className="flex gap-3">
                {["in", "f", "x"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-11 h-11 rounded-full border border-[#e8f0f8]/12 flex items-center justify-center hover:bg-[#00c8d7] hover:border-[#00c8d7] hover:text-[#080c10] transition-all text-xs font-bold"
                    data-cursor="hover"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#e8f0f8] font-semibold mb-5 text-sm tracking-wider uppercase">
                Company
              </p>
              <ul className="space-y-3 text-sm">
                {["About", "Services", "Process", "Contact"].map((l) => (
                  <li key={l}>
                    <a
                      href={`#${l.toLowerCase()}`}
                      className="hover:text-[#00c8d7] transition-colors"
                      data-cursor="hover"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#e8f0f8] font-semibold mb-5 text-sm tracking-wider uppercase">
                Get In Touch
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="tel:+447886280525"
                    className="hover:text-[#00c8d7] transition-colors"
                    data-cursor="hover"
                  >
                    +44 7886 280525
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info.expresscustoms26@gmail.com"
                    className="hover:text-[#00c8d7] transition-colors break-all"
                    data-cursor="hover"
                  >
                    info.expresscustoms26@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-1.5 text-[#e8f0f8]/25"><FiFlag size={12} /> United Kingdom</li>
              </ul>
            </div>
          </div>
          <div className="pt-9 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} Express Customs Consulting UK Ltd.
              All rights reserved.
            </p>
            <p className="text-[#e8f0f8]/25">
              Crafted By Three Plug
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}