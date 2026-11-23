import * as fs from 'node:fs';
import * as path from 'node:path';

interface ManifestSpec {
  bounties?: unknown;
  url?: unknown;
}

const MANIFEST_NAME = 'BOUNTY.json';
const MAX_MANIFEST_BYTES = 16_384;
const MAX_BOUNTY_ITEMS = 100;
const MAX_ITEM_LENGTH = 2_048;

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });

function resolveWorkspacePaths(): { sourcePath: string; targetDir: string; targetPath: string } {
  const sourceDir = process.env.MAKEFUN_BOT_DIR || '/bot';
  const targetDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  return {
    sourcePath: path.resolve(sourceDir, MANIFEST_NAME),
    targetDir: path.resolve(targetDir),
    targetPath: path.resolve(targetDir, MANIFEST_NAME),
  };
}

function decodeManifestText(rawBytes: Buffer): string {
  if (rawBytes.byteLength === 0) {
    throw new Error('Manifest file is empty');
  }
  if (rawBytes.byteLength > MAX_MANIFEST_BYTES) {
    throw new Error(`Manifest exceeds ${MAX_MANIFEST_BYTES} byte cap (${rawBytes.byteLength} bytes)`);
  }
  try {
    return UTF8_DECODER.decode(rawBytes);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Manifest contains invalid UTF-8 byte sequence: ${detail}`);
  }
}

function assertValidItemString(value: unknown, label: string): void {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} must not be empty or whitespace`);
  }
  if (value.length > MAX_ITEM_LENGTH) {
    throw new Error(`${label} exceeds ${MAX_ITEM_LENGTH} character limit`);
  }
}

function assertValidManifestBytes(rawBytes: Buffer): void {
  const text = decodeManifestText(rawBytes);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Manifest is not valid JSON: ${detail}`);
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Manifest root must be a JSON object');
  }

  const record = parsed as ManifestSpec;
  const hasBounties = Object.prototype.hasOwnProperty.call(record, 'bounties');
  const hasUrl = Object.prototype.hasOwnProperty.call(record, 'url');

  if (hasBounties && hasUrl) {
    throw new Error('Manifest must not declare both "bounties" and "url"');
  }
  if (!hasBounties && !hasUrl) {
    throw new Error('Manifest must declare either "bounties" or "url"');
  }

  if (hasBounties) {
    if (!Array.isArray(record.bounties) || record.bounties.length < 1 || record.bounties.length > MAX_BOUNTY_ITEMS) {
      throw new Error(`"bounties" must be an array of 1 to ${MAX_BOUNTY_ITEMS} items`);
    }
    for (let idx = 0; idx < record.bounties.length; idx += 1) {
      assertValidItemString(record.bounties[idx], `"bounties[${idx}]"`);
    }
  } else {
    assertValidItemString(record.url, '"url"');
  }
}

function executeExport(): void {
  const { sourcePath, targetDir, targetPath } = resolveWorkspacePaths();
  const stat = fs.statSync(sourcePath);
  if (!stat.isFile()) {
    throw new Error(`${sourcePath} is not a regular file`);
  }
  const payload = fs.readFileSync(sourcePath);
  assertValidManifestBytes(payload);
  fs.mkdirSync(targetDir, { recursive: true });
  if (sourcePath !== targetPath) {
    fs.writeFileSync(targetPath, payload);
  }
}

try {
  executeExport();
} catch (err) {
  const detail = err instanceof Error ? err.message : String(err);
  process.stderr.write(`bounty-entrants-02 entrypoint error: ${detail}\n`);
  process.exit(1);
}
