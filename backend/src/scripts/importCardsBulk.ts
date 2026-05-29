import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Prisma } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize Prisma Client
const pool = new Pool({
  connectionString: 'postgresql://postgres:admin@localhost:5432/mtg_deckbuilder?schema=public',
});
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const errorLogPath = path.join(process.cwd(), 'import-errors.log');

function logError(itemId: string | null, reason: string, details?: any) {
  try {
    const entry = {
      ts: new Date().toISOString(),
      itemId: itemId ?? null,
      reason,
      details: details ?? null,
    };
    fs.appendFileSync(errorLogPath, JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('Failed to write import error log', e);
  }
}

// Helper: pick only allowed keys from an object
function pick<T extends Record<string, any>>(obj: Record<string, any>, keys: string[]): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      out[k] = obj[k];
    }
  }
  return out as Partial<T>;
}

function parseJsonValue(value: any) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

function parseBooleanValue(value: any) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  if (typeof value === 'number') return value === 1;
  return Boolean(value);
}

function parseNumberValue(value: any) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}

function parseDateValue(value: any) {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

function transformCardDataValue(key: string, value: any) {
  const jsonFields = new Set([
    'image_uris',
    'produced_mana',
    'colors',
    'color_identity',
    'legalities',
    'artist_ids',
    'attraction_lights',
    'prices',
    'purchase_uris',
    'related_uris',
    'keywords',
    'finishes',
    'all_parts',
    'card_faces',
  ]);
  const booleanFields = new Set([
    'highres_image',
    'reserved',
    'game_changer',
    'oversized',
    'promo',
    'reprint',
    'variation',
    'digital',
    'full_art',
    'textless',
    'booster',
    'story_spotlight',
    'content_warning',
  ]);
  const numericFields = new Set(['tcgplayer_id', 'cardmarket_id', 'cmc', 'edhrec_rank']);

  if (key === 'released_at') {
    return parseDateValue(value);
  }

  if (jsonFields.has(key)) {
    return parseJsonValue(value);
  }

  if (booleanFields.has(key)) {
    return parseBooleanValue(value);
  }

  if (numericFields.has(key)) {
    return parseNumberValue(value);
  }

  return value;
}

async function importData() {
  // 1. Define the path to your JSON file
  const jsonFilePath = path.join(process.cwd(), 'unique-artwork-20260525090336.json');

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: JSON file not found at ${jsonFilePath}`);
    return;
  }

  // 2. Read the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log(`Starting import of ${data.length} records...`);

  try {
    // 3. Process and create CardData and Card records one item at a time
    // Allowed fields for CardData (whitelist) — adjust as needed to match your Prisma model
    const cardDataFields = [
      'name',
      'oracle_id',
      'tcgplayer_id',
      'cardmarket_id',
      'released_at',
      'uri',
      'scryfall_uri',
      'layout',
      'rulings_uri',
      'highres_image',
      'image_uris',
      'mana_cost',
      'cmc',
      'type_line',
      'oracle_text',
      'power',
      'toughness',
      'loyalty',
      'edhrec_rank',
      'life_modifier',
      'hand_modifier',
      'produced_mana',
      'colors',
      'color_identity',
      'keywords',
      'legalities',
      'reserved',
      'game_changer',
      'finishes',
      'oversized',
      'promo',
      'reprint',
      'variation',
      'set_id',
      'set',
      'set_name',
      'set_type',
      'set_uri',
      'set_search_uri',
      'scryfall_set_uri',
      'prints_search_uri',
      'collector_number',
      'digital',
      'rarity',
      'flavor_text',
      'artist',
      'artist_ids',
      'illustration_id',
      'border_color',
      'frame',
      'full_art',
      'textless',
      'attraction_lights',
      'booster',
      'card_back_id',
      'content_warning',
      'flavor_name',
      'story_spotlight',
      'variation_of',
      'prices',
      'purchase_uris',
      'related_uris',
    ];

    // Allowed fields for Card
    const cardFields = ['id', 'name', 'oracle_id', 'deckId', 'cardDataId'];

    for (const item of data) {
      // Basic validation
      if (!item || typeof item !== 'object') {
        console.warn('Skipping invalid item:', item);
        logError(null, 'invalid_item', { item });
        continue;
      }
      if (item.type_line == 'Card // Card') {
        // Skip Card // Card items
        console.warn('Promo skipped');
        continue;
      }
      if (!item.type_line && item.card_faces[0].type_line) {
        console.warn('Double faced card with no type line, used type line of first face');
        item.type_line = item.card_faces[0].type_line;
        item.oracle_id = item.card_faces[0].oracle_id;
      }

      // Build sanitized CardData input
      const cardDataInput = pick<any>(item, cardDataFields) as Record<string, any>;
      for (const [key, value] of Object.entries(cardDataInput)) {
        cardDataInput[key] = transformCardDataValue(key, value);
      }

      // Build sanitized Card input using unchecked create so we can set cardDataId directly
      const cardInput = pick<any>(item, cardFields) as Prisma.CardUncheckedCreateInput;

      // Ensure required card fields exist
      if (!cardInput.id || !cardInput.name || !cardInput.oracle_id) {
        if (!cardInput.oracle_id && cardDataInput.card_faces[0].oracle_id)
          cardInput.oracle_id = cardDataInput.card_faces[0].oracle_id;
        else {
          console.warn('Skipping Card creation due to missing required fields:', cardInput);
          logError(cardInput.id ?? null, 'card_missing_required_fields', { cardInput });
          continue;
        }
      }

      let card: any = null;
      try {
        card = await prisma.card.create({ data: cardInput });
        console.log(`Successfully imported: ${cardInput.name}`);
      } catch (err) {
        console.error('Failed to create Card for item:', cardInput.id || cardInput.name, err);
        logError(cardInput.id ?? null, 'card_create_failed', {
          error: err && err.message ? err.message : String(err),
        });
      }

      if (card) {
        cardDataInput.cardId = card.id;
      }

      // If there are no allowed fields to create, skip CardData creation
      if (Object.keys(cardDataInput).length > 0) {
        try {
          await prisma.cardData.create({
            data: cardDataInput as Prisma.CardDataCreateInput,
          });
        } catch (err) {
          console.error(
            'Failed to create CardData for item (skipping):',
            item.id || item.name,
            err,
          );
          logError(item.id ?? null, 'carddata_create_failed', {
            error: err && err.message ? err.message : String(err),
          });
          continue;
        }
      }
    }

    console.log('✅ Data import completed successfully!');
  } catch (error) {
    console.error('❌ Data import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
