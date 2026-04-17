const https = require('https');

https.get('https://dns.google/resolve?name=iimoqcdnnehpbqcnasou.supabase.co&type=A', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('SUPABASE:', data));
}).on('error', (e) => console.error(e));
