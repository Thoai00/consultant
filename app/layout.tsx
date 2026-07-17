import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = "https://expresscustomsconsulting.com";
const CANONICAL_URL = `${SITE_URL}/`;
const SITE_NAME = "Express Customs Consulting UK Ltd";
const TAGLINE = "Navigate Customs with Confidence";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Express Customs Consulting | UK Customs & HMRC Experts",
    template: "%s | Express Customs Consulting UK Ltd",
  },
  description:
    "Navigate customs with confidence. Chelmsford-based UK consultancy: HMRC compliance, tariff classification, duty optimisation, audits & training. Free consultation.",
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
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | UK Customs Consultants`,
    description: `${TAGLINE}. Compliance, tariff classification, documentation, duty optimisation, risk audits and training - one expert UK customs team based in Chelmsford, Essex.`,
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
    title: `${SITE_NAME} | UK Customs Consultants`,
    description: `${TAGLINE}. Compliance, tariff classification, documentation, duty optimisation, risk audits and training - one expert UK customs team based in Chelmsford, Essex.`,
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
  slogan: TAGLINE,
  url: CANONICAL_URL,
  logo: `${SITE_URL}/fav.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: "+447886280525",
  email: "info.expresscustoms26@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "11 Moortown Place",
    addressLocality: "Chelmsford",
    addressRegion: "Essex",
    postalCode: "CM3 3FZ",
    addressCountry: "GB",
  },
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

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does Express Customs Consulting offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provide end-to-end customs solutions: compliance & regulations, tariff classification & duty advice, import/export documentation, duty & tax optimisation, risk management & audits, and training & ongoing support. Every service is tailored to your specific industry and trade routes.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a consultation cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your initial consultation is completely free of charge and carries no obligation. Post-consultation fees are tailored to your business size, trade volume, and the scope of services required - from short-term project engagements to ongoing retainer arrangements. We provide a bespoke, transparent quote before any work begins.",
      },
    },
    {
      "@type": "Question",
      name: "Do you only work with UK businesses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our base is in the UK, but our expertise spans global trade. We assist UK businesses trading internationally as well as overseas companies trading into the UK market.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly can you onboard a new client?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most engagements move from initial assessment to active implementation within 14 days. Urgent compliance issues are escalated and handled within 48 hours.",
      },
    },
    {
      "@type": "Question",
      name: "Can you train our in-house team?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. We run bespoke training programmes - including post-Brexit briefings, regulatory update workshops, and on-demand expert advisory - to empower your team to handle day-to-day customs operations confidently and independently.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:url" content={CANONICAL_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
        />
        {children}
      </body>
    </html>
  );
}
