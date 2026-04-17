const fs = require('fs');
const path = require('path');
const desktop = 'C:/Users/Виктор/Desktop';
const files = fs.readdirSync(desktop).filter(f => f.endsWith('.html') && f.includes('350'));
if (files.length === 0) {
    console.log('No HTML files found');
    process.exit(1);
}
const html = fs.readFileSync(path.join(desktop, files[0]), 'utf8');

// The script we injected earlier injected:
// var img = new Image(); img.src = document.querySelector('#hero img').src; ... document.body.appendChild(img);
// Or looking for the #hero background image or ANY huge data URI
const matches = html.match(/src="data:image\/(\w+);base64,([a-zA-Z0-9+/=]+)"/g);
if (matches) {
    // Find the largest data URI
    let largestMatch = '';
    let largestExt = '';
    let largestB64 = '';
    for (const m of matches) {
        const m2 = m.match(/src="data:image\/(\w+);base64,([a-zA-Z0-9+/=]+)"/);
        if (m2 && m2[2].length > largestB64.length) {
            largestExt = m2[1];
            largestB64 = m2[2];
            largestMatch = m;
        }
    }

    if (largestB64) {
        let ext = largestExt === 'jpeg' ? 'jpg' : largestExt;
        const b = Buffer.from(largestB64, 'base64');
        const filename = 'hero_from_html_' + Date.now() + '.' + ext;
        const outPath = 'C:/Users/Виктор/Desktop/Разработка/олд/chernozem1/public/uploads/' + filename;
        fs.writeFileSync(outPath, b);
        console.log('Saved from HTML! Extracted length: ' + b.length);
        
        const contentFile = 'C:/Users/Виктор/Desktop/Разработка/олд/chernozem1/public/data/content.json';
        let c = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
        c.images.heroPhoto = './uploads/' + filename;
        fs.writeFileSync(contentFile, JSON.stringify(c, null, 2));
        console.log('Updated JSON!');
        process.exit(0);
    }
}
console.log('No data image found in HTML');
