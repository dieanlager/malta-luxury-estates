import { Property, Agency, Article } from './types';
import { ARTICLES_PHASE2 } from './content/articles-phase2';
import { ARTICLES_PHASE3 } from './content/articles-phase3';
import { ARTICLES_PHASE3B } from './content/articles-phase3b';
import { ARTICLES_PHASE4 } from './content/articles-phase4';
import { ARTICLES_PHASE4B } from './content/articles-phase4b';
import { ARTICLES_PHASE5 } from './content/articles-phase5';
import { ARTICLES_PHASE5B } from './content/articles-phase5b';
import { ARTICLES_FINANCE } from './content/articles-finance';
import { ARTICLES_LIFESTYLE } from './content/articles-lifestyle';
import { ARTICLES_CITIES } from './content/articles-cities';
import { ARTICLES_LONGTAIL } from './content/articles-longtail';
import { ARTICLES_TECHNICAL } from './content/articles-technical';
export const PROPERTIES: Property[] = [];
export const AGENCIES = [
  { id: '1', name: 'Frank Salt Real Estate', propertyCount: 320 },
  { id: '2', name: 'Engel & Völkers Malta', propertyCount: 185 },
  { id: '3', name: 'Alliance Real Estate', propertyCount: 240 },
  { id: '4', name: 'Dhalia Real Estate', propertyCount: 290 },
  { id: '5', name: 'Quicklets', propertyCount: 410 },
];


export const ARTICLES: Article[] = [...ARTICLES_PHASE2, ...ARTICLES_PHASE3, ...ARTICLES_PHASE3B, ...ARTICLES_PHASE4, ...ARTICLES_PHASE4B, ...ARTICLES_PHASE5, ...ARTICLES_PHASE5B, ...ARTICLES_FINANCE, ...ARTICLES_LIFESTYLE, ...ARTICLES_CITIES, ...ARTICLES_LONGTAIL, ...ARTICLES_TECHNICAL];

export const MALTA_AGENCIES = [
  { name: "Frank Salt Real Estate", website: "franksalt.com.mt", offices: 20 },
  { name: "RE/MAX Malta", website: "remax-malta.com", offices: 15 },
  { name: "Malta Sotheby's International Realty", website: "maltasothebysrealty.com" },
  { name: "Sara Grech", website: "saragrech.com" },
  { name: "Dhalia Real Estate", website: "dhalia.com" },
  { name: "Belair Real Estate", website: "belair.com.mt" },
  { name: "Perry Real Estate", website: "perry.com.mt" },
  { name: "Malta Real Estate", website: "maltarealestate.com" },
  { name: "Engel & Völkers Malta", website: "engelvoelkers.com/malta" },
  { name: "Simoncini Estates", website: "simonciniestates.com" },
  { name: "Open House", website: "openhouse.com.mt" },
  { name: "Quicklets", website: "quicklets.com.mt" },
  { name: "AX Real Estate", website: "axrealestate.com.mt" },
  { name: "Malta Homes", website: "malta-homes.com" },
  { name: "Island Estates", website: "islandestates.com.mt" },
  { name: "Fine & Country Malta", website: "fineandcountry.com/malta" },
  { name: "Christie's International Real Estate Malta", website: "christiesrealestate.com" },
  { name: "Brandão Real Estate", website: "brandao.com.mt" },
  { name: "Majestats", website: "majestats.com" },
  { name: "Move2Gozo", website: "move2gozo.com" },
  { name: "Gozo Properties", website: "gozoproperties.com" },
  { name: "Luxury Malta Property", website: "luxurymaltaproperty.com" },
  { name: "Knight Frank Malta", website: "knightfrank.com/malta" },
];

// UUID of the Alliance agency record in Supabase `agencies` table.
export const ALLIANCE_AGENCY_ID = 'eebbc250-9ac6-4598-b5b4-250dbd1de4dd';