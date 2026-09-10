import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const publicDir = path.join(projectRoot, 'public')

dotenv.config({ path: path.join(projectRoot, 'server', '.env') })

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])
const shouldUpload = process.argv.includes('--apply')

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath]
  }))
  return files.flat()
}

function safeSegment(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '')
}

function publicIdFor(relativePath) {
  const parsed = path.parse(relativePath)
  const directory = parsed.dir
    .split(path.sep)
    .filter(Boolean)
    .map(safeSegment)
    .join('/')
  const filename = `${safeSegment(parsed.name)}__${safeSegment(parsed.ext.slice(1).toLowerCase())}`
  return ['t24_web_assets', directory, filename].filter(Boolean).join('/')
}

const images = (await walk(publicDir))
  .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
  .sort()

if (!shouldUpload) {
  const totalBytes = (await Promise.all(images.map(async (filePath) => (await fs.stat(filePath)).size)))
    .reduce((total, size) => total + size, 0)
  console.log(JSON.stringify({
    dryRun: true,
    images: images.length,
    totalBytes,
    destinationFolder: 't24_web_assets',
    note: 'Pass --apply to create missing Cloudinary assets without overwriting existing ones.',
  }, null, 2))
  process.exit(0)
}

let cursor = 0
let completed = 0
const failures = []

async function worker() {
  while (cursor < images.length) {
    const index = cursor
    cursor += 1
    const filePath = images[index]
    const relativePath = path.relative(publicDir, filePath)
    const publicId = publicIdFor(relativePath)

    try {
      await cloudinary.uploader.upload(filePath, {
        resource_type: 'image',
        public_id: publicId,
        overwrite: false,
        invalidate: false,
        unique_filename: false,
        use_filename: false,
      })
      completed += 1
      process.stdout.write(`Uploaded ${completed}/${images.length}: ${relativePath}\n`)
    } catch (error) {
      failures.push({ relativePath, message: error instanceof Error ? error.message : String(error) })
    }
  }
}

await Promise.all(Array.from({ length: Math.min(4, images.length) }, () => worker()))

if (failures.length) {
  console.error(JSON.stringify({ uploaded: completed, failed: failures }, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ uploaded: completed, failed: 0, folder: 't24_web_assets' }))
}
