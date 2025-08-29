export type NavSectionItem = {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
};

export type NavSection = {
  heading: string;
  items: NavSectionItem[];
};

export type NavMenu = {
  key: string;
  label: string;
  sections: NavSection[];
};

// Minimal placeholder icons so the menu layouts look balanced

export const NAV_MENUS: NavMenu[] = [
  {
    key: "products",
    label: "Products",
    sections: [
      {
        heading: "Popular",
        items: [
          { title: "Next.js", description: "React framework", href: "/" },
          { title: "Vercel", description: "Deploy instantly", href: "/" },
        ],
      },
      {
        heading: "More",
        items: [
          { title: "Analytics", description: "Speed insights", href: "/" },
          { title: "Speed", description: "Edge network", href: "/" },
        ],
      },
    ],
  },
  {
    key: "solutions",
    label: "Solutions",
    sections: [
      {
        heading: "Use Cases",
        items: [
          {
            title: "AI Apps",
            description: "Deploy at the speed of AI",
            href: "/",
          },
          {
            title: "Composable Commerce",
            description: "Convert storefronts",
            href: "/",
          },
          { title: "Marketing Sites", description: "Launch fast", href: "/" },
          {
            title: "Multi-tenant Platforms",
            description: "Scale with one codebase",
            href: "/",
          },
          {
            title: "Web Apps",
            description: "Ship features, not infra",
            href: "/",
          },
        ],
      },
      {
        heading: "Users",
        items: [
          {
            title: "Platform Engineers",
            description: "Automate repetition",
            href: "/",
          },
          {
            title: "Design Engineers",
            description: "Deploy every idea",
            href: "/",
          },
        ],
      },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    sections: [
      {
        heading: "Tools",
        items: [
          {
            title: "Resource Center",
            description: "Best practices",
            href: "/",
          },
          {
            title: "Marketplace",
            description: "Automate workflows",
            href: "/",
          },
          { title: "Templates", description: "Jumpstart apps", href: "/" },
          { title: "Guides", description: "Find help quickly", href: "/" },
          {
            title: "Partner Finder",
            description: "Solution partners",
            href: "/",
          },
        ],
      },
      {
        heading: "Company",
        items: [
          { title: "Customers", description: "Trusted by the best", href: "/" },
          { title: "Blog", description: "Posts and changes", href: "/" },
          { title: "Changelog", description: "See what shipped", href: "/" },
          { title: "Press", description: "Read the latest news", href: "/" },
          { title: "Events", description: "Join us at an event", href: "/" },
        ],
      },
    ],
  },
];

export const STATIC_LINKS = [
  { label: "Enterprise", href: "/enterprise" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];
