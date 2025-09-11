import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { EnrichedDataSchema, type EnrichedData, type ParsedData, ParsedDataSchema } from '../schemas/data.js';

let cachedData: EnrichedData[] | null = null;
let cachedParsedData: ParsedData[] | null = null;

/**
 * 
 * @param timestamp 2025/09/01 10:09:52 AM UTC+3
 */
export function parseTimestamp(timestamp: string) {
  const [datePart, timePart, ampm, tz] = timestamp.split(' ');
  const [year, month, day] = datePart.split('/').map(Number);
  let [hour, minute, second] = timePart.split(':').map(Number);
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  const tzOffset = tz.match(/UTC([+-]\d+)/);
  const offsetHours = tzOffset ? Number(tzOffset[1]) : 0;
  const date = new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute, second));
  return date
}

export function loadEnrichedData(): EnrichedData[] {
  if (cachedData) {
    return cachedData;
  }

  try {
    const csvContent = readFileSync('./data/processed/latest/enriched-data.csv', 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    cachedData = records.map((record: any) => EnrichedDataSchema.parse(record));
    return cachedData;
  } catch (error) {
    console.warn('Failed to load enriched data, falling back to parsed data:', error);
    return loadParsedDataAsEnriched();
  }
}

export function loadParsedData(): ParsedData[] {
  if (cachedParsedData) {
    return cachedParsedData;
  }

  try {
    const csvContent = readFileSync('./data/processed/latest/parsed-data.csv', 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    cachedParsedData = records.map((record: any) => ParsedDataSchema.parse(record));
    return cachedParsedData;
  } catch (error) {
    console.error('Failed to load parsed data:', error);
    return [];
  }
}

function loadParsedDataAsEnriched(): EnrichedData[] {
  const parsedData = loadParsedData();
  return parsedData.map(item => ({
    ...item,
    seoTitle: `Installation LLM ${item.primaryModel || 'Personnalisée'} - ${item.name || 'Communauté'}`,
    seoDescription: `Découvrez cette installation ${item.installLocation} avec ${item.primaryModel}. Matériel, logiciels et performance détaillés.`,
    h1Title: `Installation ${item.primaryModel || 'LLM'} par ${item.name || 'la communauté'}`,
  }));
}

export function getRandomInstallations(count: number = 10, exclude?: string): EnrichedData[] {
  const data = loadEnrichedData();
  const filtered = exclude ? data.filter(item => item.slug !== exclude) : data;

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getInstallationBySlug(slug: string): EnrichedData | undefined {
  const data = loadEnrichedData();
  return data.find(item => item.slug === slug);
}

export function getAllSlugs(): string[] {
  const data = loadEnrichedData();
  return data.map(item => item.slug);
}