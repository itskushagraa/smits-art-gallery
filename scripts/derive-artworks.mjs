// scripts/derive-artworks.mjs
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(URL, SERVICE);

// sizes to produce (longest side)
const SIZES = [1600, 1200, 800, 480];

async function download(bucket, objectPath) {
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) throw new Error(`Download failed: ${bucket}/${objectPath}: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}

async function upload(bucket, objectPath, buf, contentType = 'image/webp') {
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buf, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${bucket}/${objectPath}: ${error.message}`);
}

async function findFile(slug, baseName) {
  const { data, error } = await supabase.storage.from('artworks').list(slug);
  if (error) throw new Error(`List failed: ${error.message}`);
  const f = (data || []).find(x => new RegExp(`^${baseName}\\.[a-z0-9]+$`, 'i').test(x.name));
  return f ? `${slug}/${f.name}` : null;
}

async function makeDerivative(masterBuf, wmBuf, targetW) {
  const wmScaled = await sharp(wmBuf)
    .trim() // remove transparent padding
    .resize({ width: Math.round(targetW * 0.60) }) // bigger mark
    .png()
    .toBuffer();

  return await sharp(masterBuf)
    .resize({ width: targetW, withoutEnlargement: true })
    .composite([{ input: wmScaled, gravity: 'southeast', blend: 'over', opacity: 0.6 }])
    .webp({ quality: 82 })
    .toBuffer();
}

async function buildSet(slug, baseName, masterBuf, wmBuf) {
  for (const w of SIZES) {
    const buf = await makeDerivative(masterBuf, wmBuf, w);
    const out = `${slug}/${baseName}_${w}_wm.webp`;
    await upload('artworks-derivatives', out, buf, 'image/webp');
    console.log('↑', out);
  }
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: DOTENV_CONFIG_PATH=.env.local node scripts/derive-artworks.mjs <slug>');
    process.exit(1);
  }

  const wmPath = path.resolve('public/watermark.png');
  const wmBuf = await fs.readFile(wmPath);

  // FULL (required)
  const fullPath = await findFile(slug, 'full');
  if (!fullPath) throw new Error(`No full.* in artworks/${slug}`);
  const fullBuf = await download('artworks', fullPath);
  await buildSet(slug, 'full', fullBuf, wmBuf);

  // INTERIOR (optional)
  const interiorPath = await findFile(slug, 'interior');
  if (interiorPath) {
    const interiorBuf = await download('artworks', interiorPath);
    await buildSet(slug, 'interior', interiorBuf, wmBuf);
  } else {
    console.log('(no interior.* found; skipped)');
  }

  console.log('Done:', slug);
}

main().catch(e => { console.error(e); process.exit(1); });
