import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://expresscustomsconsulting.com";
const SITE_NAME = "Express Customs Consulting UK Ltd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "UK Customs Consultants | HMRC Compliance, Tariffs & Duty Advice | Express Customs Consulting",
    template: "%s | Express Customs Consulting UK Ltd",
  },
  description:
    "UK-based customs consultancy helping importers and exporters with HMRC compliance, tariff classification & HS codes, customs documentation, duty & tax optimisation, risk audits and staff training. Book a free consultation.",
  keywords: [
    "customs consultancy UK",
    "HMRC compliance consultants",
    "customs compliance UK",
    "post-Brexit customs compliance",
    "tariff classification UK",
    "HS code classification",
    "commodity code advice",
    "customs duty and VAT calculation",
    "import export documentation UK",
    "customs declarations",
    "certificates of origin",
    "customs duty relief schemes",
    "free trade agreement advice",
    "customs risk management",
    "customs audit preparation",
    "HMRC dispute support",
    "customs training UK",
    "UK import export consultant",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Customs Consultancy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "UK Customs Consultants | HMRC Compliance, Tariffs & Duty Advice",
    description:
      "Compliance, tariff classification, documentation, duty optimisation, risk audits and training â€” one expert customs team for UK importers and exporters.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 128,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "UK Customs Consultants | HMRC Compliance, Tariffs & Duty Advice",
    description:
      "Compliance, tariff classification, documentation, duty optimisation, risk audits and training â€” one expert customs team for UK importers and exporters.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#080c10",
};

const SERVICES_JSONLD = [
  {
    name: "Compliance & Regulations",
    description:
      "Expert guidance through complex customs regulations, ensuring shipments fully comply with requirements set by authorities such as HM Revenue & Customs, with proactive monitoring of regulatory change.",
  },
  {
    name: "Tariff Classification & Duty Advice",
    description:
      "Identification of correct commodity codes using the internationally recognised Harmonized System (HS), ensuring accurate duty and VAT calculations.",
  },
  {
    name: "Import / Export Documentation",
    description:
      "Preparation of essential documentation including commercial invoices, packing lists, certificates of origin, and customs declarations.",
  },
  {
    name: "Duty & Tax Optimisation",
    description:
      "Advice on legitimate duty and tax reduction opportunities, including relief schemes and applicable free trade agreements.",
  },
  {
    name: "Risk Management & Audits",
    description:
      "Assessment of compliance risks and preparation for customs audits, reducing the likelihood of fines, shipment delays, or seizures.",
  },
  {
    name: "Training & Ongoing Support",
    description:
      "Staff training on customs procedures, updates on regulatory changes including post-Brexit requirements, and ongoing advisory support.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: "+447886280525",
  email: "info.expresscustoms26@gmail.com",
  areaServed: {
    "@type": "Country",
    name: "United Kingdom",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  sameAs: [
    "https://linkedin.com",
    "https://instagram.com",
    "https://facebook.com",
  ],
  makesOffer: SERVICES_JSONLD.map((s) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: s.name,
      description: s.description,
      areaServed: "GB",
      provider: { "@type": "ProfessionalService", name: SITE_NAME },
    },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
