/**
 * Патч для AdminPage.tsx
 * Запуск: node patch.js
 * Що робить: при імпорті JSON автоматично завантажує base64 фото
 *             в Supabase Storage (замість зберігання в KV Store)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src', 'app', 'pages', 'AdminPage.tsx');

if (!fs.existsSync(FILE)) {
  console.error('❌ Файл не знайдено:', FILE);
  process.exit(1);
}

let content = fs.readFileSync(FILE, 'utf8');

// Перевірка чи вже пропатчено
if (content.includes('reader.onload = async () => {')) {
  console.log('✅ Вже пропатчено! Нічого робити.');
  process.exit(0);
}

// ── Крок 1: зробити callback async ──
content = content.replace(
  'reader.onload = () => {',
  'reader.onload = async () => {'
);

// ── Крок 2: замінити тіло після merged = safeMerge(...) ──
const OLD = `        const merged = safeMerge(rawContent as SiteContent);
        setDraft(merged);
        updateContent(() => merged);
        if (rawIntegrations) {
          setIntg(rawIntegrations);
          saveIntegrations(rawIntegrations);
        }
        // ── Зберегти на сервері (Supabase) щоб всі пристрої бачили ──
        api.saveContent(merged)
          .then(() => setToast("✓ Резервну копію відновлено і збережено на сервері! Тепер видно на всіх пристроях."))
          .catch(() => setToast("✓ Відновлено локально. Натисніть «Зберегти на сервері» щоб синхронізувати."));`;

const NEW = `        const merged = safeMerge(rawContent as SiteContent);

        // ── Крок 1: base64 фото → Supabase Storage ──────────────────────
        const adminPass = api.getAdminPassword();
        if (adminPass) {
          const imageKeys = Object.keys(merged.images) as Array<keyof typeof merged.images>;
          const base64Keys = imageKeys.filter((k) => {
            const v = merged.images[k];
            return typeof v === "string" && (v as string).startsWith("data:");
          });
          if (base64Keys.length > 0) {
            setToast(\`⏳ Завантажуємо \${base64Keys.length} фото в хмару…\`);
            let done = 0;
            await Promise.allSettled(
              base64Keys.map(async (key) => {
                const val = merged.images[key] as string;
                try {
                  const mimeMatch = val.match(/^data:([^;]+);base64,/);
                  const mimeType  = mimeMatch?.[1] ?? "image/jpeg";
                  const url = await api.uploadImage(key as string, val, mimeType);
                  (merged.images as Record<string, string>)[key as string] = url;
                  done++;
                  setToast(\`⏳ Фото в хмарі: \${done}/\${base64Keys.length}…\`);
                } catch (uploadErr) {
                  console.warn(\`[Import] Не вдалося завантажити \${String(key)}:\`, uploadErr);
                }
              })
            );
          }
        }

        // ── Крок 2: зберегти контент із URL ─────────────────────────────
        setDraft(merged);
        updateContent(() => merged);
        if (rawIntegrations) {
          setIntg(rawIntegrations);
          saveIntegrations(rawIntegrations);
        }
        try {
          await api.saveContent(merged);
          setToast("✓ Готово! Всі фото в хмарі — тепер видно на всіх пристроях.");
        } catch (saveErr) {
          console.error("[Import] saveContent error:", saveErr);
          setToast("⚠ Фото завантажено, але помилка збереження тексту. Натисни «Зберегти» ще раз.");
        }`;

if (!content.includes(OLD.trim().slice(0, 60))) {
  console.error('❌ Старий код не знайдено. Можливо файл вже змінено вручну або версія інша.');
  console.log('Шукаю фрагмент:', OLD.trim().slice(0, 60));
  process.exit(1);
}

content = content.replace(OLD, NEW);

fs.writeFileSync(FILE, content, 'utf8');
console.log('✅ Пропатчено успішно!');
console.log('');
console.log('Тепер запусти:');
console.log('  git add src/app/pages/AdminPage.tsx');
console.log('  git commit -m "fix: upload base64 images to Supabase on JSON import"');
console.log('  git push');
