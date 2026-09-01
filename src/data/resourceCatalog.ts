export type ResourceCategory = "paint" | "plumbing" | "electrical" | "lumber" | "landscape" | "maintenance";
export type MaterialState = "needed" | "considering" | "purchased" | "on_site" | "used" | "returned";
export const MATERIAL_STATES: readonly MaterialState[] = ["needed", "considering", "purchased", "on_site", "used", "returned"];

export type SupplierResource = {
  id: string; name: string; categories: readonly ResourceCategory[]; summary: string;
  website: string; locator: string; scope: "national" | "regional"; evidence: string;
};

export const RESOURCE_CATEGORIES = [
  { id: "paint", label: "Paint & coatings", prompt: "Painting, prep, stain, primer, or masonry coating" },
  { id: "plumbing", label: "Plumbing & fixtures", prompt: "Pipe, fittings, fixtures, water systems, or repair parts" },
  { id: "electrical", label: "Electrical & safety", prompt: "Electrical supplies, lighting, safety, or maintenance" },
  { id: "lumber", label: "Lumber & building", prompt: "Framing, roofing, siding, doors, windows, or hardware" },
  { id: "landscape", label: "Landscape & exterior", prompt: "Irrigation, hardscape, turf, fencing, or outdoor equipment" },
  { id: "maintenance", label: "Tools & maintenance", prompt: "Tools, fasteners, commercial maintenance, or jobsite supplies" },
] as const;

export const SUPPLIER_RESOURCES: readonly SupplierResource[] = [
  { id:"home-depot",name:"The Home Depot",categories:["paint","plumbing","electrical","lumber","landscape","maintenance"],summary:"Broad home-improvement and building-material categories for project comparison.",website:"https://www.homedepot.com/",locator:"https://www.homedepot.com/l/storeDirectory",scope:"national",evidence:"External merchant website and official store directory" },
  { id:"lowes",name:"Lowe's",categories:["paint","plumbing","electrical","lumber","landscape","maintenance"],summary:"Home improvement, building, repair, flooring, and outdoor project categories.",website:"https://www.lowes.com/",locator:"https://www.lowes.com/store/",scope:"national",evidence:"External merchant website and official store directory" },
  { id:"ace",name:"Ace Hardware",categories:["paint","plumbing","electrical","landscape","maintenance"],summary:"Local hardware, tools, paint, lawn care, and repair-supply categories.",website:"https://www.acehardware.com/",locator:"https://www.acehardware.com/store-locator",scope:"national",evidence:"External merchant website and official store locator" },
  { id:"sherwin-williams",name:"Sherwin-Williams",categories:["paint"],summary:"Paint, primer, stain, coatings, color, and painting-supply resources.",website:"https://www.sherwin-williams.com/homeowners/products/catalog",locator:"https://www.sherwin-williams.com/store-locator",scope:"national",evidence:"External merchant catalog and official store locator" },
  { id:"84-lumber",name:"84 Lumber",categories:["lumber"],summary:"Lumber, framing, roofing, siding, windows, doors, and building materials.",website:"https://www.84lumber.com/",locator:"https://www.84lumber.com/store-locator/",scope:"regional",evidence:"External merchant website and official store locator" },
  { id:"ferguson",name:"Ferguson",categories:["plumbing","maintenance"],summary:"Plumbing, HVAC, water-system, fixture, and professional supply categories.",website:"https://www.ferguson.com/",locator:"https://www.ferguson.com/storefinder",scope:"national",evidence:"External merchant website and official store finder" },
  { id:"siteone",name:"SiteOne Landscape Supply",categories:["landscape"],summary:"Landscape, irrigation, hardscape, turf, nursery, and outdoor-lighting categories.",website:"https://www.siteone.com/",locator:"https://www.siteone.com/en/store-finder",scope:"national",evidence:"External merchant website and official store finder" },
  { id:"grainger",name:"Grainger",categories:["plumbing","electrical","maintenance"],summary:"Commercial tools, electrical, HVAC, plumbing, safety, and maintenance categories.",website:"https://www.grainger.com/",locator:"https://www.grainger.com/branch/",scope:"national",evidence:"External merchant website and official branch directory" },
] as const;

export const RESOURCE_TRUTH_BOUNDARY = {
  livePriceData: false, liveInventoryData: false, supplierEndorsement: false,
  purchaseOccursInHlc: false, routesUseOfficialLocators: true,
} as const;
