import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { RawDataSchema, ParsedDataSchema, type RawData, type ParsedData } from '../schemas/data.js';

function createSlug(timestamp: string): string {
  const date = new Date(timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + timestamp.split(' ')[1]);
  const isoString = date.toISOString();
  return isoString.replace(/[:.]/g, '-').replace(/T/, '-').replace(/Z$/, '');
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
    slug: createSlug(raw["Horodateur"]),
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
  const inputPath = process.argv[2] || './LLM Maison (réponses) - Réponses au formulaire 1.csv';
  const outputPath = process.argv[3] || './data/processed/parsed-data.csv';
  parseCsv(inputPath, outputPath);
}