import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const backupsFolder = path.join(process.env.USERPROFILE, 'Downloads');
const targetFile = path.join(backupsFolder, 'kyivchornozem-backup-2026-03-15.json');
const alternativeFile = path.join(backupsFolder, 'kyivchornozem-backup-2026-03-14 (2).json');

const publicDir = path.resolve('public');
const uploadsDir = path.join(publicDir, 'uploads');
const dataDir = path.join(publicDir, 'data');
const outputFile = path.join(dataDir, 'content.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function processBackup() {
    let sourcePath = targetFile;
    if (!fs.existsSync(sourcePath)) {
        console.log(`Main backup missing. Checking alternative...`);
        if (fs.existsSync(alternativeFile)) {
             sourcePath = alternativeFile;
        } else {
             console.error("No JSON backups found!");
             process.exit(1);
        }
    }

    console.log(`Loading JSON backup from: ${sourcePath}`);
    const raw = fs.readFileSync(sourcePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse JSON backup.");
        process.exit(1);
    }
    
    // Sometimes the export format is { general: {...}, images: {...} }
    // Or it might be { content: { general: {...}, images: {...} } }
    let rootContent = data.content ? data.content : data;
    
    if (!rootContent.images) {
        console.error("No images found in JSON backup!");
        process.exit(1);
    }

    let modifiedCount = 0;
    const images = rootContent.images;

    for (const [key, val] of Object.entries(images)) {
        if (typeof val === 'string' && val.startsWith('data:image/')) {
            const matches = val.match(/^data:image\/(\w+);base64,(.+)$/);
            if (matches) {
                let ext = matches[1];
                if (ext === 'jpeg') ext = 'jpg';
                if (ext === 'svg+xml') ext = 'svg';

                const buffer = Buffer.from(matches[2], 'base64');
                const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 6);
                const filename = `img_${Date.now()}_${hash}.${ext}`;
                const filepath = path.join(uploadsDir, filename);

                fs.writeFileSync(filepath, buffer);
                images[key] = `/uploads/${filename}`;
                console.log(`[Extracted] ${key} -> /uploads/${filename}`);
                modifiedCount++;
            }
        } else if (typeof val === 'string' && val.trim() !== '') {
            console.log(`[Skipped] ${key} is already a URL or path: ${val.substring(0, 50)}`);
        }
    }

    console.log(`Extracted and saved ${modifiedCount} images.`);

    // Write final content.json
    fs.writeFileSync(outputFile, JSON.stringify(rootContent, null, 2));
    console.log(`Saved updated content to public/data/content.json!`);
}

processBackup().catch(console.error);
