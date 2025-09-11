import { mistral } from "@ai-sdk/mistral";
import { generateText } from "ai";
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
import {
  ParsedDataSchema,
  EnrichedDataSchema,
  type ParsedData,
  type EnrichedData,
} from "../schemas/data.js";
import "dotenv/config";

const model = mistral("mistral-small-latest");

const DEFAULT_SEO_TITLE =
  "Installation LLM Maison 2025 - Découvrez cette configuration";
const DEFAULT_SEO_DESCRIPTION =
  "Découvrez cette installation LLM locale ou cloud partagée par la communauté française. Matériel, logiciels, coûts et performances détaillés.";
const DEFAULT_H1_TITLE =
  "Installation LLM - Configuration détaillée de la communauté";

async function generateSeoTitle(data: ParsedData): Promise<string> {
  try {
    const prompt = `Génère un titre SEO de maximum 60 caractères pour une installation LLM basée sur ces informations :
- Modèle principal: ${data.primaryModel}
- Type d'installation: ${data.installLocation}
- Utilisation: ${data.installPurpose}
- Organisation: ${data.name}

Le titre doit être accrocheur, inclure "LLM" et mentionner l'aspect communautaire/maison.

Le résultat ne doit pas indiquer le nombre de caractères, ne renvoie que le titre, sans guillemets.

Exemple:
La configuration locale de Mistral sur Dell d'Eric Burel
`;

    const { text } = await generateText({
      model,
      prompt,
      //maxTokens: 50,
    });

    return text.trim().substring(0, 60);
  } catch (error) {
    console.warn("❌ Failed to generate SEO title:", error);
    return DEFAULT_SEO_TITLE;
  }
}

async function generateSeoDescription(data: ParsedData): Promise<string> {
  try {
    const prompt = `Génère une description SEO de maximum 160 caractères pour cette installation LLM :
- Modèle: ${data.primaryModel}
- Installation: ${data.installLocation}
- Matériel: ${data.hasGpu}, ${data.machineDetails}
- Logiciels: ${data.software}
- Coûts: ${data.installCost}

Décris l'installation de manière engageante et informative.

Le texte ne doit pas indiquer le nombre de caractères, ne renvoie que la description, sans guillemets.
`;

    const { text } = await generateText({
      model,
      prompt,
      //maxTokens: 80,
    });

    return text.trim().substring(0, 160);
  } catch (error) {
    console.warn("❌ Failed to generate SEO description:", error);
    return DEFAULT_SEO_DESCRIPTION;
  }
}

async function generateH1Title(data: ParsedData): Promise<string> {
  try {
    const prompt = `Génère un titre H1 entre 60 et 80 caractères pour cette installation LLM :
- Modèle : ${data.primaryModel}
- Par : ${data.name}
- Type : ${data.installLocation}

Le titre doit être descriptif et engageant, parfait pour une page de détail.

Le texte ne doit pas indiquer le nombre de caractères, ne renvoie que le titre, sans guillemets.
`;

    const { text } = await generateText({
      model,
      prompt,
      //maxTokens: 50,
    });

    const title = text.trim();
    return title.length >= 60 && title.length <= 80
      ? title
      : title.length < 60
        ? title.padEnd(60, " - Installation LLM Maison")
        : title.substring(0, 80);
  } catch (error) {
    console.warn("❌ Failed to generate H1 title:", error);
    return DEFAULT_H1_TITLE;
  }
}

async function enrichData(data: ParsedData): Promise<EnrichedData> {
  console.log(`🔄 Enriching data for: ${data.name || "Anonymous"}`);

  const [seoTitle, seoDescription, h1Title] = await Promise.all([
    generateSeoTitle(data),
    generateSeoDescription(data),
    generateH1Title(data),
  ]);

  return {
    ...data,
    seoTitle,
    seoDescription,
    h1Title,
  };
}

export async function enrichCsvData(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    const csvContent = readFileSync(inputPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📊 Processing ${records.length} records...`);

    const enrichedData: EnrichedData[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const validatedParsed = ParsedDataSchema.parse(record);
        const enriched = await enrichData(validatedParsed);
        const validatedEnriched = EnrichedDataSchema.parse(enriched);
        enrichedData.push(validatedEnriched);

        console.log(`✅ Processed ${i + 1}/${records.length}`);

        // Small delay to avoid rate limiting
        if (i < records.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.warn(`❌ Skipping record ${i + 1}:`, error);
        continue;
      }
    }

    const csvOutput = [
      Object.keys(enrichedData[0]).join(","),
      ...enrichedData.map((row) =>
        Object.values(row)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    writeFileSync(outputPath, csvOutput);

    console.log(`🎉 Enriched ${enrichedData.length} records`);
    console.log(`📁 Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error enriching data:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPath = process.argv[2] || "./data/processed/parsed-data.csv";
  const outputPath = process.argv[3] || "./data/processed/enriched-data.csv";
  enrichCsvData(inputPath, outputPath);
}
