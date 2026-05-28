// Metadaten: Nährstoffe (Label, Einheit, EU-NRV), Evidenz-Tiers, Cluster.

// canonical -> { label, unit, nrv (EU Annex XIII; null = kein NRV), group }
export const NUTRIENTS = {
  kalorien_kcal:{label:"Energie",unit:"kcal",nrv:null,group:"Makro"},
  wasser_g:{label:"Wasser",unit:"g",nrv:null,group:"Makro"},
  eiweisse_g:{label:"Protein",unit:"g",nrv:null,group:"Makro"},
  kohlenhydrate_g:{label:"Kohlenhydrate",unit:"g",nrv:null,group:"Makro"},
  zucker_g:{label:"Zucker",unit:"g",nrv:null,group:"Makro"},
  staerke_g:{label:"Stärke",unit:"g",nrv:null,group:"Makro"},
  nahrungsfasern_g:{label:"Ballaststoffe",unit:"g",nrv:null,group:"Makro"},
  fett_gesamt_g:{label:"Fett gesamt",unit:"g",nrv:null,group:"Fett"},
  gesaettigte_fettsaeuren_g:{label:"Gesättigte FS",unit:"g",nrv:null,group:"Fett"},
  einfach_ungesaettigte_fettsaeuren_g:{label:"Einfach unges. FS",unit:"g",nrv:null,group:"Fett"},
  mehrfach_ungesaettigte_fettsaeuren_g:{label:"Mehrfach unges. FS",unit:"g",nrv:null,group:"Fett"},
  transfette_g:{label:"Transfette",unit:"g",nrv:null,group:"Fett"},
  cholesterin_mg:{label:"Cholesterin",unit:"mg",nrv:null,group:"Fett"},
  omega_3_ala_g:{label:"Omega-3 ALA",unit:"g",nrv:null,group:"Fett"},
  omega_3_gesamt_g:{label:"Omega-3 gesamt",unit:"g",nrv:null,group:"Fett"},
  linolsaeure_g:{label:"Linolsäure",unit:"g",nrv:null,group:"Fett"},
  epa_g:{label:"EPA",unit:"g",nrv:null,group:"Fett"},
  dha_g:{label:"DHA",unit:"g",nrv:null,group:"Fett"},
  salz_g:{label:"Salz",unit:"g",nrv:null,group:"Makro"},
  alkohol_g:{label:"Alkohol",unit:"g",nrv:null,group:"Makro"},
  // Mineralstoffe
  kalzium_mg:{label:"Calcium",unit:"mg",nrv:800,group:"Mineral"},
  eisen_mg:{label:"Eisen",unit:"mg",nrv:14,group:"Mineral"},
  magnesium_mg:{label:"Magnesium",unit:"mg",nrv:375,group:"Mineral"},
  phosphor_mg:{label:"Phosphor",unit:"mg",nrv:700,group:"Mineral"},
  kalium_mg:{label:"Kalium",unit:"mg",nrv:2000,group:"Mineral"},
  natrium_mg:{label:"Natrium",unit:"mg",nrv:null,group:"Mineral"},
  chlorid_mg:{label:"Chlorid",unit:"mg",nrv:800,group:"Mineral"},
  zink_mg:{label:"Zink",unit:"mg",nrv:10,group:"Mineral"},
  kupfer_mg:{label:"Kupfer",unit:"mg",nrv:1,group:"Mineral"},
  mangan_mg:{label:"Mangan",unit:"mg",nrv:2,group:"Mineral"},
  selen_ug:{label:"Selen",unit:"µg",nrv:55,group:"Mineral"},
  iod_ug:{label:"Jod",unit:"µg",nrv:150,group:"Mineral"},
  // Vitamine
  vitamin_a_ug:{label:"Vitamin A",unit:"µg",nrv:800,group:"Vitamin"},
  betacarotin_ug:{label:"Beta-Carotin",unit:"µg",nrv:null,group:"Vitamin"},
  vitamin_c_mg:{label:"Vitamin C",unit:"mg",nrv:80,group:"Vitamin"},
  vitamin_d_ug:{label:"Vitamin D",unit:"µg",nrv:5,group:"Vitamin"},
  vitamin_d3_ug:{label:"Vitamin D3",unit:"µg",nrv:5,group:"Vitamin"},
  vitamin_e_mg:{label:"Vitamin E",unit:"mg",nrv:12,group:"Vitamin"},
  vitamin_k_ug:{label:"Vitamin K",unit:"µg",nrv:75,group:"Vitamin"},
  vitamin_b1_mg:{label:"Vitamin B1",unit:"mg",nrv:1.1,group:"Vitamin"},
  vitamin_b2_mg:{label:"Vitamin B2",unit:"mg",nrv:1.4,group:"Vitamin"},
  vitamin_b3_mg:{label:"Vitamin B3 (Niacin)",unit:"mg",nrv:16,group:"Vitamin"},
  vitamin_b5_mg:{label:"Vitamin B5",unit:"mg",nrv:6,group:"Vitamin"},
  vitamin_b6_mg:{label:"Vitamin B6",unit:"mg",nrv:1.4,group:"Vitamin"},
  folsaeure_ug:{label:"Folat",unit:"µg",nrv:200,group:"Vitamin"},
  folsaeure_dfe_ug:{label:"Folat (DFE)",unit:"µg",nrv:200,group:"Vitamin"},
  vitamin_b12_ug:{label:"Vitamin B12",unit:"µg",nrv:2.5,group:"Vitamin"},
  cholin_mg:{label:"Cholin",unit:"mg",nrv:null,group:"Vitamin"},
  koffein_mg:{label:"Koffein",unit:"mg",nrv:null,group:"Spezial"},
  tryptophan_g:{label:"Tryptophan",unit:"g",nrv:null,group:"Spezial"},
  // Spezial
  antioxidantien_mmol:{label:"Antioxidantien",unit:"mmol",nrv:null,group:"Spezial"},
  saeure_basen_pral:{label:"Säure/Base (PRAL)",unit:"",nrv:null,group:"Spezial"},
  phytate_mg:{label:"Phytate",unit:"mg",nrv:null,group:"Spezial"},
  serotonin_mg:{label:"Serotonin",unit:"mg",nrv:null,group:"Spezial"},
  melatonin_mg:{label:"Melatonin",unit:"mg",nrv:null,group:"Spezial"},
  sulforaphan_mg:{label:"Sulforaphan",unit:"mg",nrv:null,group:"Spezial"},
  epicatechin_mg:{label:"Epicatechin",unit:"mg",nrv:null,group:"Spezial"},
  chlorophyll_mg:{label:"Chlorophyll",unit:"mg",nrv:null,group:"Spezial"},
  biologische_wertigkeit_prozent:{label:"Biolog. Wertigkeit",unit:"%",nrv:null,group:"Spezial"},
  essentielle_aminosaeuren:{label:"Essentielle AS",unit:"",nrv:null,group:"Spezial"},
  anthocyan_rang_orig:{label:"Anthocyan-Rang",unit:"",nrv:null,group:"Spezial"},
  anthocyane_mg:{label:"Anthocyane",unit:"mg",nrv:null,group:"Spezial"},
  vitamin_a_beta_carotin_mg_orig:{label:"Vit-A (β-Carotin, orig.)",unit:"mg",nrv:null,group:"Spezial"},
};

export function nutLabel(k){ return (NUTRIENTS[k]?.label) || k; }
export function nutUnit(k){ return (NUTRIENTS[k]?.unit) || ""; }
export function nrvPct(k, val){ const n = NUTRIENTS[k]?.nrv; return n ? (100*val/n) : null; }

// Radar-Kernnährstoffe (haben NRV, gut verteilt)
export const RADAR_KEYS = ["eisen_mg","magnesium_mg","kalium_mg","kalzium_mg","zink_mg",
  "vitamin_c_mg","vitamin_a_ug","folsaeure_ug","vitamin_b6_mg","vitamin_b12_ug","selen_ug","vitamin_e_mg"];

export const MACRO_KEYS = ["eiweisse_g","kohlenhydrate_g","fett_gesamt_g","nahrungsfasern_g","zucker_g"];

// Evidenz-Tiers
export const TIERS = {
  A:{label:"A · autorisiert (EFSA)", short:"A", color:"var(--tier-a)", rank:4,
     desc:"EFSA-autorisierter Funktions-Health-Claim (VO 432/2012)"},
  B:{label:"B · starke Evidenz", short:"B", color:"var(--tier-b)", rank:3,
     desc:"WHO-IARC · WCRF · Cochrane · große Meta-Analysen"},
  C:{label:"C · vorläufig", short:"C", color:"var(--tier-c)", rank:2,
     desc:"epidemiologisch / mechanistisch / in-vitro"},
  D:{label:"D · unbelegt", short:"D", color:"var(--tier-d)", rank:1,
     desc:"traditionelle/Folklore-Angabe ohne belastbare Evidenz"},
};
export const LENS_LABELS = ["alles (inkl. Folklore)","ab C · vorläufig","ab B · stark","nur A · autorisiert"];
export const LENS_MINRANK = [1,2,3,4]; // value 0..3 -> min rank

// Cluster -> Farbe (Palette-Rotation)
export const CLUSTERS = {
  "Herz-Kreislauf":"#bf888d", "Krebs":"#9a6f73", "Immunsystem":"#9fbba1",
  "Nerven-Gehirn":"#899d8a", "Knochen-Zähne":"#c5d3c6", "Augen":"#d29da3",
  "Stoffwechsel-Energie":"#b7c9b3", "Verdauung":"#e0c0c3", "Hormonsystem":"#cbb0b2",
  "Atemwege-Allergie":"#a9c2ab", "Haut":"#dcb4b8", "Muskel":"#8fb191",
  "Leber-Niere":"#a89a98", "Allgemein":"#9aa096", "Risiko":"#a85a60",
};
export function clusterColor(c){ return CLUSTERS[c] || "var(--grey)"; }
