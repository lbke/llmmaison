import { z } from 'zod';

export const RawDataSchema = z.object({
  "Horodateur": z.string(),
  "Question obligatoire pour continuer - j'accepte que les données collectées soient partagées librement sous licence Creative Commons, sous différents formats.": z.string(),
  "Le modèle d'IA générative de mon installation fonctionne...": z.string(),
  "Si vous passez par un prestataire IT externe, quel est son nom ?": z.string(),
  "Si vous passez par un hébergeur cloud, quel est son nom ?": z.string(),
  "Autres précision sur votre prestataire IT ou hébergeur cloud (champ libre)": z.string(),
  "Quel modèle LLM utilisez-vous principalement ?": z.string(),
  "Quels autres modèles LLM utilisez-vous ?": z.string(),
  "Entraînez-vous des modèles LLM ou d'IA en général sur votre installation ?": z.string(),
  "Quels logiciels et/ou SaaS utilisez-vous pour faire fonctionner votre installation ?": z.string(),
  "Possédez-vous une ou plusieurs cartes graphiques ?": z.string(),
  "Si vous hébergez un LLM sur votre machine (tour, ordinateur portable), quelle est sa marque/référence ?": z.string(),
  "Quelles cartes graphiques possédez-vous ? Avec quelle puissance (notamment en VRam) ?": z.string(),
  "Si vous possédez un rack de GPU ou de serveurs, quel est le modèle du rack/boîtier ?": z.string(),
  "Autres précisions sur votre matériel (champ libre)": z.string(),
  "Mon installation sert...": z.string(),
  "Quelles sont les performances obtenues avec votre modèle principal ?": z.string(),
  "Quel est le coût d'installation de votre système ?": z.string(),
  "Quel est le coût d'opération au quotidien de votre système ?": z.string(),
  "Autres précisions sur vos coûts (champ libre)": z.string(),
  "J'ai mis en place cette installation...": z.string(),
  "Je peux utiliser cette installation dans un contexte professionnel": z.string(),
  "Une petite photo de votre installation": z.string(),
  "Site web que je souhaite mettre en avant": z.string(),
  "Prénom Nom et/ou nom de votre organisation": z.string(),
  "Autres informations que vous souhaitez partager publiquement": z.string(),
});

export const ParsedDataSchema = z.object({
  timestamp: z.string(),
  acceptsLicense: z.string(),
  installLocation: z.string(),
  externalProvider: z.string(),
  cloudProvider: z.string(),
  providerDetails: z.string(),
  primaryModel: z.string(),
  otherModels: z.string(),
  trainsModels: z.string(),
  software: z.string(),
  hasGpu: z.string(),
  machineDetails: z.string(),
  gpuDetails: z.string(),
  rackDetails: z.string(),
  hardwareDetails: z.string(),
  installPurpose: z.string(),
  performance: z.string(),
  installCost: z.string(),
  operationCost: z.string(),
  costDetails: z.string(),
  installReason: z.string(),
  professionalUse: z.string(),
  photo: z.string(),
  website: z.string(),
  name: z.string(),
  additionalInfo: z.string(),
  slug: z.string(),
});

export const EnrichedDataSchema = ParsedDataSchema.extend({
  seoTitle: z.string(),
  seoDescription: z.string(),
  h1Title: z.string(),
});

export type RawData = z.infer<typeof RawDataSchema>;
export type ParsedData = z.infer<typeof ParsedDataSchema>;
export type EnrichedData = z.infer<typeof EnrichedDataSchema>;