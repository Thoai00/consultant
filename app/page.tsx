"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";

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

/* ─── COUNTER ────────────────────────────────────────────────────────────── */
function Counter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal<HTMLSpanElement>();
  useEffect(() => {
    if (!visible) return;
    const dur = 2200;
    const startTs = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [visible, target]);
  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
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
    stat: "£284K",
    statLabel: "Avg. Duty Saved YTD",
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
    stat: "48h",
    statLabel: "Avg. Turnaround",
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
    icon: "🔍",
  },
  {
    num: "02",
    title: "Client Meeting",
    desc: "A face-to-face or online meeting will help deep-dive your business — mapping operations, identifying risks, and building a shared understanding.",
    icon: "🤝",
  },
  {
    num: "03",
    title: "Quotation",
    desc: "A cost-effective solution will be proposed with a competitive quote tailored to your specific requirements and service level.",
    icon: "💷",
  },
  {
    num: "04",
    title: "Assessment Report",
    desc: "A comprehensive professional report will be presented — covering findings, recommendations, and your bespoke customs roadmap.",
    icon: "📊",
  },
  {
    num: "05",
    title: "After Sales Service",
    desc: "After-sales support will be available in line with the selected service level — from quarterly audits to on-demand expert advisory.",
    icon: "🛡️",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES SECTION — PARALLAX SCROLL
   Each card scrolls naturally into view with parallax depth effect.
   NO sticky/pinned screen. Cards fade+slide in as you scroll down.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Individual service card with parallax */
function ParallaxServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.94, 1, 1, 0.98]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, scale }}
      className="relative max-w-6xl mx-auto px-6 lg:px-10"
    >
      <motion.div
        style={{ y }}
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
            {/* Stat */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: `${service.color}0a`,
                border: `1px solid ${service.color}18`,
              }}
            >
              <p className="text-xs text-[#7a8fa6] uppercase tracking-widest font-bold mb-1">
                {service.statLabel}
              </p>
              <p
                className="font-display text-4xl lg:text-5xl font-bold"
                style={{ color: service.color }}
              >
                {service.stat}
              </p>
            </div>

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
          {SERVICES.map((service, index) => (
            <ParallaxServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* Stats row */}
      <div className="bg-[#080c10] py-10 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: "6", label: "Core Services", icon: "✦" },
            { n: "500+", label: "Businesses Helped", icon: "🏢" },
            { n: "100%", label: "HMRC Aligned", icon: "🛡️" },
            { n: "£0", label: "Client Penalties", icon: "⚖️" },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-5 text-center border"
              style={{
                background: "rgba(20,28,36,0.7)",
                borderColor: "rgba(0,200,215,0.12)",
              }}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="font-display text-2xl font-bold text-[#e8f0f8]">
                {s.n}
              </p>
              <p className="text-[10px] text-[#7a8fa6] uppercase tracking-wider mt-0.5 font-semibold">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
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
                        <span className="text-3xl">{step.icon}</span>
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
      icon: "📚",
    },
    {
      num: "02",
      title: "Tailored to Your Business",
      desc: "Bespoke strategies aligned with your industry, trade routes and risk profile — never a one-size-fits-all approach.",
      icon: "🎯",
    },
    {
      num: "03",
      title: "Proactive, Not Reactive",
      desc: "We identify problems before they become penalties — saving you time, money and reputational risk.",
      icon: "⚡",
    },
    {
      num: "04",
      title: "End-to-End Support",
      desc: "From first consultation to in-house training, we are seamlessly embedded at every stage of your trade lifecycle.",
      icon: "🔗",
    },
    {
      num: "05",
      title: "HMRC-Aligned Expertise",
      desc: "Our consultants have deep familiarity with HMRC requirements, ensuring your declarations are always accurate.",
      icon: "✅",
    },
    {
      num: "06",
      title: "Duty Optimisation Focus",
      desc: "We don't just ensure compliance — we actively seek legitimate savings through relief schemes and trade agreements.",
      icon: "💰",
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
              <div className="text-3xl mb-4">{r.icon}</div>
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
    { label: "HMRC Registered", icon: "🏛️" },
    { label: "WCO Compliant", icon: "🌐" },
    { label: "ICC Member", icon: "⚖️" },
    { label: "BIFA Aligned", icon: "🚢" },
    { label: "UK Trade Authority", icon: "🇬🇧" },
    { label: "FCDO Partner", icon: "🤝" },
    { label: "ISO Standards", icon: "📋" },
    { label: "5.0★ Rated", icon: "⭐" },
  ];
  return (
    <section
      className="py-14 overflow-hidden border-y"
      style={{ background: "#0e1318", borderColor: "rgba(0,200,215,0.1)" }}
    >
      <p className="text-center text-xs tracking-[0.3em] uppercase text-[#7a8fa6] font-semibold mb-7">
        Recognised & trusted by leading UK and international authorities
      </p>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marqueeScroll 28s linear infinite" }}
      >
        {[...badges, ...badges].map((b, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-3 mx-10 text-[#e8f0f8]/25 font-semibold text-sm"
          >
            <span className="text-xl">{b.icon}</span>
            <span>{b.label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c8d7]/35 ml-4" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────────────────────── */
function TestimonialSection() {
  const testimonials = [
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
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((v) => (v + 1) % testimonials.length),
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
                &ldquo;{testimonials[active].quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#141c24] border border-[#00c8d7]/30 flex items-center justify-center text-[#4dd9e6] font-display font-bold">
                  {testimonials[active].initials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#e8f0f8]">
                    {testimonials[active].name}
                  </p>
                  <p className="text-sm text-[#7a8fa6]">
                    {testimonials[active].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-9">
            {testimonials.map((_, i) => (
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

  const metrics = [
    { label: "Compliance Rate", value: 100, suffix: "%", color: "#00c8d7" },
    { label: "Client Retention", value: 94, suffix: "%", color: "#4dd9e6" },
    { label: "Duty Saved YTD", value: 284, suffix: "K", prefix: "£", color: "#b8c6d6" },
  ];

  const recentActivity = [
    { route: "UK → Germany", status: "Cleared", time: "2 min ago", flag: "🇩🇪" },
    { route: "UK → USA", status: "In Transit", time: "8 min ago", flag: "🇺🇸" },
    { route: "UK → Japan", status: "Cleared", time: "15 min ago", flag: "🇯🇵" },
    { route: "UK → Australia", status: "Processing", time: "22 min ago", flag: "🇦🇺" },
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
      {/* ── Top: Brand card with logo watermark ── */}
      <div
        className="relative rounded-3xl overflow-hidden border p-7"
        style={{
          background: "linear-gradient(135deg, rgba(20,28,36,0.95) 0%, rgba(8,12,16,0.98) 100%)",
          borderColor: "rgba(0,200,215,0.18)",
          boxShadow: "0 20px 60px -15px rgba(0,200,215,0.12)",
        }}
      >
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#00c8d7]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#4dd9e6]/8 blur-2xl pointer-events-none" />

        {/* Logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/logo.png" alt="" className="w-3/4 opacity-[0.04]" />
        </div>

        <div className="relative z-10">
          {/* Live badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#00c8d7] font-bold">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative rounded-full w-2 h-2 bg-emerald-400" />
              </span>
              Live Operations
            </div>
            <span className="text-[10px] text-[#7a8fa6] font-semibold tracking-wider">London · GMT</span>
          </div>

          {/* Activity feed */}
          <div className="space-y-2.5 mb-6">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(232,240,248,0.03)",
                  border: "1px solid rgba(232,240,248,0.06)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.flag}</span>
                  <div>
                    <p className="text-xs font-semibold text-[#e8f0f8]">{item.route}</p>
                    <p className="text-[10px] text-[#7a8fa6]">{item.time}</p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background:
                      item.status === "Cleared"
                        ? "rgba(52,211,153,0.12)"
                        : item.status === "In Transit"
                        ? "rgba(0,200,215,0.12)"
                        : "rgba(251,191,36,0.12)",
                    color:
                      item.status === "Cleared"
                        ? "#34d399"
                        : item.status === "In Transit"
                        ? "#00c8d7"
                        : "#fbbf24",
                  }}
                >
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <div className="border-t border-[#e8f0f8]/8 pt-5">
            <svg className="w-8 h-8 text-[#00c8d7]/30 mb-3" fill="currentColor" viewBox="0 0 32 32">
              <path d="M10 8c-3 0-6 3-6 8s3 8 6 8h2v-8H8c0-2 2-4 4-4V8h-2zm12 0c-3 0-6 3-6 8s3 8 6 8h2v-8h-4c0-2 2-4 4-4V8h-2z" />
            </svg>
            <p className="font-display text-lg text-[#e8f0f8]/80 leading-snug italic">
              Years of expertise across every industry, on a truly global scale.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1c2530] border border-[#00c8d7]/30 flex items-center justify-center">
                <img src="/logo.png" alt="EC" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e8f0f8]">Express Customs Team</p>
                <p className="text-[10px] text-[#4dd9e6]">Consulting UK Ltd</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: 3 metric bars ── */}
      <div className="grid grid-cols-1 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
            className="relative rounded-2xl p-5 border overflow-hidden"
            style={{
              background: "rgba(20,28,36,0.8)",
              borderColor: `${m.color}20`,
            }}
          >
            {/* Glow line on left */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: m.color }}
            />
            <div className="flex items-center justify-between mb-3 pl-3">
              <span className="text-xs text-[#7a8fa6] font-semibold uppercase tracking-widest">
                {m.label}
              </span>
              <span
                className="font-display text-2xl font-bold tabular-nums"
                style={{ color: m.color }}
              >
                {m.prefix || ""}{m.value}{m.suffix}
              </span>
            </div>
            {/* Progress bar */}
            <div className="pl-3">
              <div className="h-1.5 bg-[#e8f0f8]/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                  initial={{ width: 0 }}
                  animate={visible ? { width: `${Math.min(m.value, 100)}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.7 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Certification badges strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(20,28,36,0.6)",
          borderColor: "rgba(0,200,215,0.1)",
        }}
      >
        <p className="text-[10px] text-[#7a8fa6] uppercase tracking-[0.25em] font-bold mb-4">
          Certifications & Memberships
        </p>
        <div className="flex flex-wrap gap-2">
          {["HMRC", "WCO", "ICC", "BIFA", "ISO", "FCDO"].map((cert) => (
            <span
              key={cert}
              className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border"
              style={{
                background: "rgba(0,200,215,0.06)",
                borderColor: "rgba(0,200,215,0.2)",
                color: "#4dd9e6",
              }}
            >
              {cert}
            </span>
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

  const contactR = useReveal();

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
              <img
                src="/logo.png"
                alt="Express Customs Consulting UK Ltd"
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
            <span>Est. 2009</span>
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
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-[#00c8d7]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-[#e8f0f8] text-sm font-bold ml-1.5">
                      5.0
                    </span>
                  </div>
                  <p className="text-[#7a8fa6] text-sm">
                    Trusted by{" "}
                    <span className="font-semibold text-[#e8f0f8]">
                      500+ UK businesses
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
                className="hidden sm:block absolute top-[38%] -left-2 glass-card rounded-2xl p-4 w-48 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
                style={{ animation: "floatY 6s ease-in-out infinite 1s" }}
              >
                <p className="text-[10px] text-[#7a8fa6] uppercase tracking-widest mb-1 font-semibold">
                  Duty Saved YTD
                </p>
                <p className="font-display text-3xl font-bold text-[#e8f0f8]">
                  £<Counter target={284} suffix="K" />
                </p>
                <div className="mt-2 h-1.5 bg-[#e8f0f8]/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#00c8d7] rounded-full" />
                </div>
              </div>

              <div
                className="hidden sm:block absolute bottom-6 right-0 glass-card rounded-2xl p-4 w-56 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
                style={{ animation: "floatY 5.5s ease-in-out infinite 0.5s" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#7a8fa6] font-semibold uppercase tracking-widest">
                    Live Shipments
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                {[
                  ["UK → DE", "2 min"],
                  ["UK → US", "8 min"],
                  ["UK → JP", "14 min"],
                ].map(([r, t]) => (
                  <div
                    key={r}
                    className="flex items-center justify-between py-2 text-xs border-t border-[#e8f0f8]/8 first:border-0"
                  >
                    <span className="text-[#e8f0f8] font-semibold">{r}</span>
                    <span className="text-[#00c8d7] font-semibold text-[10px]">
                      {t}
                    </span>
                  </div>
                ))}
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
                ["15+", "Years"],
                ["500+", "Clients"],
                ["98%", "Success"],
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
                a: "Your initial consultation is completely free of charge and carries no obligation. We use this time to understand your business, identify quick wins, and recommend the most appropriate solutions — as outlined in our five-step service structure.",
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
          ref={contactR.ref}
          className="max-w-6xl mx-auto px-6 lg:px-10"
          style={{
            opacity: contactR.visible ? 1 : 0,
            transform: contactR.visible ? "translateY(0)" : "translateY(40px)",
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
                    <img
                      src="/logo.png"
                      alt="EC"
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
                <img
                  src="/logo.png"
                  alt="Express Customs Consulting UK Ltd"
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
                <li className="text-[#e8f0f8]/25">United Kingdom 🇬🇧</li>
              </ul>
            </div>
          </div>
          <div className="pt-9 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} Express Customs Consulting UK Ltd.
              All rights reserved.
            </p>
            <p className="text-[#e8f0f8]/25">
              Crafted with precision in the United Kingdom
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}