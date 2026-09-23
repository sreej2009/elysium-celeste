// Single source of truth for verified Elysium Celeste content.
// Every value here is sourced directly from the Celeste brochure (Celeste.pdf).
// Do not add figures that are not present in that source.

export interface ApartmentType {
  id: "4bhk" | "3bhk";
  label: string;
  flatCode: string;
  bhk: string;
  superBuiltUp: { sqft: number; sqm: number };
  builtUp: number;
  carpet: number;
  rooms: string[];
  roomLabels: RoomLabel[];
  floorPlan2D: string;
  floorPlan3D: string;
}

export interface RoomLabel {
  name: string;
  dimensions?: string;
  // approximate position as a percentage of the plan image, tuned per plan
  x: number;
  y: number;
}

export const CONTACT = {
  phonePrimaryDisplay: "+91 422 - 3527770 / 3517714",
  phoneMobileDisplay: "+91 8144 000 999",
  phoneMobileHref: "+918144000999",
  whatsappHref: "+919500979241",
  email: "info@elysium.in",
  website: "www.elysium.in",
  address: "B-2, Elysium Towers, Door No: 21, ATT Colony, Coimbatore - 641018, Tamil Nadu, India.",
  coordinates: `11°0'43" N 76°57'15" E`,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Elysium+Celeste+Coimbatore",
  whatsappMessage:
    "Hi, I was exploring Elysium Celeste and would like to know more. Could you share the details?",
};

export const LOCATION_LANDMARKS = [
  "Brookfields Mall",
  "Ganga Hospital",
  "KMCH City Centre",
  "The Eye Foundation",
  "Railway Station",
];

export const SPEC_CATEGORIES = [
  {
    id: "structure",
    index: "01",
    title: "Structure",
    items: [
      "Stilt plus 5-story RCC framed structure",
      "Seismic Zone 2 compliant",
      "Waterproof plastering for external walls",
      "Environmentally friendly AAC blocks for external walls",
    ],
  },
  {
    id: "interiors",
    index: "02",
    title: "Foyer / Living / Dining",
    items: [
      "Premium quality granite and tile flooring and skirting",
      "Premium emulsion paint for internal walls and ceilings",
    ],
  },
  {
    id: "bedroom",
    index: "03",
    title: "Bedroom / Corridor",
    items: [
      "Imported high-quality vitrified tile flooring and skirting",
      "Laminated wooden flooring in the master bedroom",
    ],
  },
  {
    id: "water",
    index: "04",
    title: "Toilets / Plumbing",
    items: [
      "Designer anti-skid tile flooring",
      "Designer ceramic wall tiling",
      "Sanitary fittings by Roca, American Standard, or equivalent",
      "Provision for exhaust fan and geyser in all toilets",
      "Concealed master control cock for easy maintenance",
      "Fully concealed PVC, CPVC and UPVC pipes for cold and hot water",
      "Common pressure pump system for the building",
    ],
  },
  {
    id: "kitchen",
    index: "05",
    title: "Kitchen",
    items: [
      "Imported high-quality vitrified tile flooring and skirting",
      "Superior quality glazed wall tiling",
      "Granite kitchen platform with stainless steel sink and drainboard",
      "Provision for chimney, dishwasher, and water purifier",
    ],
  },
  {
    id: "electrical",
    index: "06",
    title: "Electrical",
    items: [
      "Weather-resistant concealed wiring with RCCB protection for each flat",
      "Adequate lighting and plug points",
      "Television and telephone points in living and master bedrooms",
      "Electrical switches by Legrand, Havells, or equivalent",
      "FRLS wires and cables by Finolex, Polycab, KEI, or equivalent",
      "Three-phase electricity connection",
      "Provision for air conditioners in all bedrooms",
      "Genset backup for each flat's lighting",
      "USB charging port provisions in all bedrooms",
      "Provision for smart cleaners (robotic floor cleaners)",
      "Provision for water purifier, dishwasher, and washing machine in utility area",
      "Armoured cable for EB distribution to each flat",
      "Cat6 cables for intercom and Wi-Fi",
    ],
  },
  {
    id: "common",
    index: "07",
    title: "Common Areas",
    items: [
      "High-speed passenger lift",
      "MS/SS handrails for staircase",
      "Access-controlled common lobby",
      "Lightning arrester",
      "Stack parking",
      "Alfresco party lawn with terrace garden",
      "Rainwater percolation trench",
      "EV charging provisions",
    ],
  },
  {
    id: "doors",
    index: "08",
    title: "Doors & Windows",
    items: [
      "Solid teak wood frames and shutters for main doors",
      "Moulded flush doors with densified hardwood or panel frames for bedrooms",
      "Flush doors with waterproof laminated finishes for bathrooms",
      "UPVC frames with glass shutters for all windows and ventilators",
    ],
  },
  {
    id: "other",
    index: "09",
    title: "Other Features",
    items: [
      "Elegant lift cladding in granite or decorative tile",
      "Round-the-clock security with CCTV monitoring",
      "Reverse osmosis plant",
      "Intercom facilities",
      "24x7 power backup for all lighting with AMF panel",
    ],
  },
];

export const APARTMENTS: Record<"4bhk" | "3bhk", ApartmentType> = {
  "4bhk": {
    id: "4bhk",
    label: "4 BHK",
    flatCode: "Flat A",
    bhk: "04",
    superBuiltUp: { sqft: 2210, sqm: 205 },
    builtUp: 1844.67,
    carpet: 1713.92,
    rooms: ["Foyer", "Living Room", "Balcony", "Bedroom", "Dining", "Open Kitchen / Utility"],
    roomLabels: [
      { name: "Foyer", dimensions: "7'-0\" x 4'-8\"", x: 12, y: 78 },
      { name: "Living Room", dimensions: "13'-0\" x 18'-9\"", x: 24, y: 65 },
      { name: "Bedroom 1", dimensions: "10'-8\" x 13'-11\"", x: 12, y: 22 },
      { name: "Bedroom 2", dimensions: "10'-8\" x 13'-2\"", x: 43, y: 22 },
      { name: "Bedroom 3", dimensions: "11'-10\" x 13'-8\"", x: 80, y: 25 },
      { name: "Bedroom 4", dimensions: "11'-10\" x 13'-8\"", x: 80, y: 68 },
      { name: "Dining", dimensions: "11'-0\" x 12'-0\"", x: 58, y: 32 },
      { name: "Kitchen & Utility", dimensions: "18'-7\" x 13'-0\"", x: 50, y: 78 },
      { name: "Balcony", dimensions: "6'-10\" x 6'-2\"", x: 37, y: 82 },
      { name: "Toilets", x: 71, y: 20 },
    ],
    floorPlan2D: "floorplan-a-2d",
    floorPlan3D: "floorplan-a-3d",
  },
  "3bhk": {
    id: "3bhk",
    label: "3 BHK",
    flatCode: "Flat B",
    bhk: "03",
    superBuiltUp: { sqft: 1725, sqm: 160 },
    builtUp: 1440.95,
    carpet: 1330.29,
    rooms: ["Foyer", "Living Room", "Balcony", "Bedroom", "Dining", "Kitchen"],
    roomLabels: [
      { name: "Master Bedroom", dimensions: "14'-6\" x 16'-4\"", x: 10, y: 22 },
      { name: "Bedroom 2", dimensions: "10'-8\" x 14'-2\"", x: 38, y: 20 },
      { name: "Bedroom 1", dimensions: "10'-8\" x 16'-5\"", x: 73, y: 20 },
      { name: "Dining", dimensions: "13'-0\" x 11'-10\"", x: 40, y: 62 },
      { name: "Living Room", dimensions: "13'-0\" x 16'-5\"", x: 72, y: 65 },
      { name: "Kitchen & Utility", dimensions: "9'-1\" x 11'-1\"", x: 20, y: 78 },
      { name: "Balcony", dimensions: "6'-8\" x 6'-9\"", x: 54, y: 78 },
      { name: "Foyer", dimensions: "5'-3\" x 6'-10\"", x: 91, y: 82 },
    ],
    floorPlan2D: "floorplan-b-2d",
    floorPlan3D: "floorplan-b-3d",
  },
};
