import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT, 'public/data');
const UPLOADS_DIR = path.resolve(ROOT, 'public/uploads');

const projectId = "iimoqcdnnehpbqcnasou";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbW9xY2RubmVocGJxY25hc291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDk4NzksImV4cCI6MjA4OTA4NTg3OX0.sBupLGvyY0z4G4xUUmIoVgljvhxzajXvMSGrnwzI5po";
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-857b076b/content`;

async function run() {
    console.log("Fetching content from Supabase...");
    const res = await fetch(BASE, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
        }
    });

    if (!res.ok) {
        console.error("Failed to fetch:", res.status, res.statusText);
        return;
    }

    const data = await res.json();
    if (!data.content || Object.keys(data.content).length === 0) {
        console.log("No content found in Supabase. Nothing to migrate.");
        return;
    }

    let contentStr = JSON.stringify(data.content, null, 2);

    const regex = /https:\/\/iimoqcdnnehpbqcnasou\.supabase\.co\/storage\/v1\/object\/public\/chernozem-images\/([^"'\s]+)/g;
    
    let match;
    const urlsToDownload = new Map();
    while ((match = regex.exec(contentStr)) !== null) {
        const fullUrl = match[0];
        const filename = match[1];
        urlsToDownload.set(fullUrl, filename);
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    console.log(`Found ${urlsToDownload.size} images to migrate.`);

    for (const [url, filename] of urlsToDownload.entries()) {
        console.log(`Downloading ${filename}...`);
        try {
            const imgRes = await fetch(url);
            if (!imgRes.ok) throw new Error(`Status ${imgRes.status}`);
            const buffer = await imgRes.arrayBuffer();
            fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(buffer));
            
            contentStr = contentStr.split(url).join(`/chernozem/uploads/${filename}`);
        } catch(e) {
            console.error(`Error with ${filename}: ${e.message}`);
        }
    }

    fs.writeFileSync(path.join(DATA_DIR, 'content.json'), contentStr, 'utf-8');
    console.log("Migration complete! Content saved to public/data/content.json");
}

run();
