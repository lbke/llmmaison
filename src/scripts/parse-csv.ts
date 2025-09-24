/**
 * First parsing step to have cleaner column names
 * Note : will reparse all data
 * Doesn't call AI yet (see enrich script)
 */
import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { RawDataSchema, ParsedDataSchema, type RawData, type ParsedData } from '../schemas/data.js';

/**
 * @param timestamp If download from google forms : 2025/09/01 10:09:52 AM UTC+3
 * If download from google sheets : may be in French !
 */
function parseTimeStamp(timestamp: string) {
  const [datePart, timePart, ampm, tz] = timestamp.split(' ');
  if (!tz) {
    throw new Error("Download the CSV file from google forms, not sheets, to preserve tz in timestamps")
    /*
    // Date is already in French
    const [day, month, year] = datePart.split('/').map(Number);
    let [hour, minute, second] = timePart.split(':').map(Number);
    // Use Date to get the offset for fr-FR (Europe/Paris)
    // Create a date in UTC, then get the timezone offset for Europe/Paris
    const tempDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    // Get offset in minutes for Europe/Paris
    const localeOffsetMinutes = -tempDate.toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false, hour: '2-digit' }).split(':')[0] + hour;
    const offsetHours = Number(localeOffsetMinutes);
    const date = new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute, second));
    return date
    */
  }
  // Date is not localized
  const [year, month, day] = datePart.split('/').map(Number);
  let [hour, minute, second] = timePart.split(':').map(Number);
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  const tzOffset = tz && tz.match(/UTC([+-]\d+)/);
  const offsetHours = tzOffset ? Number(tzOffset[1]) : 0;
  const date = new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute, second));
  return date
}
/**
 * Slug has to be deterministic so URLs are stable
 * @param timestamp 
 * @returns 
 */
function createSlug(timestamp: string, name?: string): string {
  const date = parseTimeStamp(timestamp)
  // console.log(timestamp)
  // const date = new Date(timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + timestamp.split(' ')[1]);
  const isoString = date.toISOString();
  const beginning = isoString.split('Z')[0]
  const dateSlug = beginning.replaceAll(/[:.]/g, '-').replace(/T/, '-');
  let slug = dateSlug
  if (name) {
    const nameSlug = name.toLowerCase()
      .replaceAll(/[éëêè]/g, "e")
      // replace non char / non dash by dash
      .replaceAll(/[^a-z0-9\-]/g, "-")
      // remove the dupes dash that it may have created
      .replaceAll(/\-\-+/g, "-")
      // these days browser supports 2000+ chars, let's stick to a SEO title
      .slice(0, 60)
      // remove trailing dash if any
      .replace(/\-$/, "")
    if (nameSlug) {
      slug = nameSlug + "-" + dateSlug
    }
  }
  return slug
}

function transformRawToParsed(raw: RawData): ParsedData {
  return {
    timestamp: raw["Horodateur"],
    acceptsLicense: raw["Question obligatoire pour continuer - j'accepte que les données collectées soient partagées librement sous licence Creative Commons, sous différents formats."],
    installLocation: raw["Le modèle d'IA générative de mon installation fonctionne..."],
    externalProvider: raw["Si vous passez par un prestataire IT externe, quel est son nom ?"],
    cloudProvider: raw["Si vous passez par un hébergeur cloud, quel est son nom ?"],
    providerDetails: raw["Autres précision sur votre prestataire IT ou hébergeur cloud (champ libre)"],
    primaryModel: raw["Quel modèle LLM utilisez-vous principalement ?"],
    otherModels: raw["Quels autres modèles LLM utilisez-vous ?"],
    trainsModels: raw["Entraînez-vous des modèles LLM ou d'IA en général sur votre installation ?"],
    software: raw["Quels logiciels et/ou SaaS utilisez-vous pour faire fonctionner votre installation ?"],
    hasGpu: raw["Possédez-vous une ou plusieurs cartes graphiques ?"],
    machineDetails: raw["Si vous hébergez un LLM sur votre machine (tour, ordinateur portable), quelle est sa marque/référence ?"],
    gpuDetails: raw["Quelles cartes graphiques possédez-vous ? Avec quelle puissance (notamment en VRam) ?"],
    rackDetails: raw["Si vous possédez un rack de GPU ou de serveurs, quel est le modèle du rack/boîtier ?"],
    hardwareDetails: raw["Autres précisions sur votre matériel (champ libre)"],
    installPurpose: raw["Mon installation sert..."],
    performance: raw["Quelles sont les performances obtenues avec votre modèle principal ?"],
    installCost: raw["Quel est le coût d'installation de votre système ?"],
    operationCost: raw["Quel est le coût d'opération au quotidien de votre système ?"],
    costDetails: raw["Autres précisions sur vos coûts (champ libre)"],
    installReason: raw["J'ai mis en place cette installation..."],
    professionalUse: raw["Je peux utiliser cette installation dans un contexte professionnel"],
    photo: raw["Une petite photo de votre installation"],
    website: raw["Site web que je souhaite mettre en avant"],
    name: raw["Prénom Nom et/ou nom de votre organisation"],
    additionalInfo: raw["Autres informations que vous souhaitez partager publiquement"],
    slug: createSlug(raw["Horodateur"], raw["Prénom Nom et/ou nom de votre organisation"]),
  };
}

export function parseCsv(inputPath: string, outputPath: string): void {
  try {
    const csvContent = readFileSync(inputPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const parsedData: ParsedData[] = [];

    for (const record of records) {
      try {
        const validatedRaw = RawDataSchema.parse(record);
        const parsed = transformRawToParsed(validatedRaw);
        const validatedParsed = ParsedDataSchema.parse(parsed);
        parsedData.push(validatedParsed);
      } catch (error) {
        console.warn('Skipping invalid record:', error);
        continue;
      }
    }

    const csvOutput = [
      Object.keys(parsedData[0]).join(','),
      ...parsedData.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    writeFileSync(outputPath, csvOutput);

    console.log(`✅ Parsed ${parsedData.length} records`);
    console.log(`📁 Output saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPath = process.argv[2] || './data/raw/responses.csv';
  const outputPath = process.argv[3] || './data/processed/parsed-data.csv';
  parseCsv(inputPath, outputPath);
}