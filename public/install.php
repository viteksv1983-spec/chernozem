<?php
/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║  КиївЧорнозем — Інсталятор для Shared Hosting            ║
 * ║  Версія: 1.0                                              ║
 * ║                                                            ║
 * ║  Завантажте ZIP на хостинг, розпакуйте,                   ║
 * ║  відкрийте: https://ваш-домен.com/install.php             ║
 * ║                                                            ║
 * ║  ⚠️  Файл самознищується після успішної інсталяції!       ║
 * ╚════════════════════════════════════════════════════════════╝
 */

// Блокуємо повторну інсталяцію
$lockFile = __DIR__ . '/data/.installed';
if (file_exists($lockFile) && !isset($_GET['force'])) {
    die('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Вже встановлено</title></head><body style="font-family:sans-serif;text-align:center;padding:60px"><h1>✅ Сайт вже встановлено</h1><p>Якщо потрібно перевстановити, видаліть файл <code>data/.installed</code></p><p><a href="/">← На сайт</a> | <a href="/admin">Адмін-панель →</a></p></body></html>');
}

$errors = [];
$warnings = [];
$success = [];
$step = $_POST['step'] ?? 'check';

// ═══════════════════════════════════════════════════════════════
//  КРОК 1: Перевірка вимог
// ═══════════════════════════════════════════════════════════════
function checkRequirements() {
    global $errors, $warnings, $success;

    // PHP версія
    if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
        $success[] = "PHP " . PHP_VERSION . " ✓";
    } else {
        $errors[] = "Потрібен PHP 7.4+, встановлено: " . PHP_VERSION;
    }

    // cURL
    if (function_exists('curl_init')) {
        $success[] = "cURL підтримка ✓";
    } else {
        $errors[] = "Розширення cURL не встановлено (потрібно для Telegram)";
    }

    // JSON
    if (function_exists('json_encode')) {
        $success[] = "JSON підтримка ✓";
    } else {
        $errors[] = "Розширення JSON не встановлено";
    }

    // file_put_contents
    if (function_exists('file_put_contents')) {
        $success[] = "Файлові операції ✓";
    } else {
        $errors[] = "Функція file_put_contents недоступна";
    }

    // Перевірка дозволів запису
    $testDir = __DIR__ . '/data';
    if (!is_dir($testDir)) {
        if (@mkdir($testDir, 0755, true)) {
            $success[] = "Створення директорій ✓";
            @rmdir($testDir);
        } else {
            $errors[] = "Немає прав на створення папок. Встановіть chmod 755 для кореневої директорії.";
        }
    } else {
        if (is_writable($testDir)) {
            $success[] = "Запис у data/ ✓";
        } else {
            $errors[] = "Папка data/ не доступна для запису. chmod 755.";
        }
    }

    // Перевірка .htaccess (Apache mod_rewrite)
    if (function_exists('apache_get_modules')) {
        $modules = apache_get_modules();
        if (in_array('mod_rewrite', $modules)) {
            $success[] = "Apache mod_rewrite ✓";
        } else {
            $warnings[] = "mod_rewrite не знайдено. SPA routing може не працювати.";
        }
    } else {
        $warnings[] = "Не вдалося перевірити mod_rewrite (це нормально на Nginx/CGI)";
    }

    // index.html
    if (file_exists(__DIR__ . '/index.html')) {
        $success[] = "index.html знайдено ✓";
    } else {
        $errors[] = "Файл index.html не знайдено! Переконайтесь, що ви розпакували весь ZIP.";
    }

    // api.php
    if (file_exists(__DIR__ . '/api.php')) {
        $success[] = "api.php знайдено ✓";
    } else {
        $errors[] = "Файл api.php не знайдено!";
    }

    // assets
    if (is_dir(__DIR__ . '/assets')) {
        $count = count(glob(__DIR__ . '/assets/*'));
        $success[] = "assets/ ({$count} файлів) ✓";
    } else {
        $errors[] = "Папка assets/ не знайдена!";
    }

    return empty($errors);
}

// ═══════════════════════════════════════════════════════════════
//  КРОК 2: Інсталяція
// ═══════════════════════════════════════════════════════════════
function doInstall($adminPassword) {
    $results = [];

    // 1. Створити директорії
    $dirs = [
        __DIR__ . '/data',
        __DIR__ . '/uploads',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0755, true)) {
                $results[] = "✅ Створено: " . basename($dir) . "/";
            } else {
                return ['error' => "Не вдалося створити " . basename($dir) . "/"];
            }
        } else {
            $results[] = "📁 Існує: " . basename($dir) . "/";
        }
    }

    // 2. Захист data/ від прямого доступу
    $htaccessData = __DIR__ . '/data/.htaccess';
    if (!file_exists($htaccessData)) {
        file_put_contents($htaccessData, "# Захист — заборона прямого доступу до файлів\n# Дозволити тільки content.json (для фронтенду)\n<Files \"*\">\n    Require all denied\n</Files>\n<Files \"content.json\">\n    Require all granted\n</Files>\n");
        $results[] = "✅ Захист data/.htaccess створено";
    }

    // 3. Створити content.json (якщо немає)
    $contentFile = __DIR__ . '/data/content.json';
    if (!file_exists($contentFile)) {
        // Шукаємо вбудований content.json
        if (file_exists(__DIR__ . '/data/content.json.default')) {
            copy(__DIR__ . '/data/content.json.default', $contentFile);
            $results[] = "✅ content.json створено з шаблону";
        } else {
            $results[] = "⚠️ content.json не знайдено — буде створено при першому збереженні в адмінці";
        }
    } else {
        $results[] = "📄 content.json вже існує";
    }

    // 4. Зберегти пароль адміністратора (bcrypt)
    $hash = password_hash($adminPassword, PASSWORD_BCRYPT);
    file_put_contents(__DIR__ . '/data/password.hash', $hash);
    $results[] = "✅ Пароль адміністратора встановлено (bcrypt)";

    // 5. Створити .htaccess для SPA routing
    $htaccess = __DIR__ . '/.htaccess';
    $htaccessContent = <<<'HTACCESS'
# ╔═══════════════════════════════════════════════════╗
# ║  КиївЧорнозем — Apache Rewrite для SPA           ║
# ╚═══════════════════════════════════════════════════╝

RewriteEngine On

# Якщо сайт у підпапці — змініть RewriteBase:
# RewriteBase /subdirectory/
RewriteBase /

# Статичні файли — віддавати напряму (не rewrite)
RewriteRule ^api\.php - [L]
RewriteRule ^data/content\.json - [L]
RewriteRule ^assets/ - [L]
RewriteRule ^uploads/ - [L]
RewriteRule ^images/ - [L]
RewriteRule ^favicon - [L]
RewriteRule ^robots\.txt - [L]
RewriteRule ^sitemap\.xml - [L]
RewriteRule ^sw\.js - [L]
RewriteRule ^manifest\.json - [L]

# Все остальне → index.html (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# ── Performance & Security ──────────────────────────

# Gzip стискання
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Кешування статики (1 рік — файли мають hash у назві)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Захист від перегляду директорій
Options -Indexes

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
HTACCESS;

    file_put_contents($htaccess, $htaccessContent);
    $results[] = "✅ .htaccess створено (SPA routing + gzip + cache + security)";

    // 6. Створити lock-файл
    file_put_contents(__DIR__ . '/data/.installed', date('Y-m-d H:i:s') . "\n" . PHP_VERSION);
    $results[] = "✅ Lock-файл створено";

    // 7. Видалити install.php (самознищення)
    $results[] = "🗑️ install.php буде видалено після завершення";

    return ['results' => $results];
}

// ═══════════════════════════════════════════════════════════════
//  Обробка POST
// ═══════════════════════════════════════════════════════════════
$installed = false;
$installResults = [];

if ($step === 'install' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $pwd = $_POST['admin_password'] ?? '';
    $pwd2 = $_POST['admin_password2'] ?? '';

    if (strlen($pwd) < 6) {
        $errors[] = "Пароль має бути мінімум 6 символів";
    } elseif ($pwd !== $pwd2) {
        $errors[] = "Паролі не збігаються";
    } else {
        $result = doInstall($pwd);
        if (isset($result['error'])) {
            $errors[] = $result['error'];
        } else {
            $installed = true;
            $installResults = $result['results'];
        }
    }
}

$requirementsOk = checkRequirements();
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>КиївЧорнозем — Встановлення</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f2419 0%, #1a3a2a 50%, #0d1f15 100%);
            min-height: 100vh; color: #e8e0d4;
            display: flex; justify-content: center; align-items: flex-start;
            padding: 40px 20px;
        }
        .container {
            max-width: 640px; width: 100%;
            background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px; padding: 48px; box-shadow: 0 24px 80px rgba(0,0,0,0.4);
        }
        .logo { text-align: center; margin-bottom: 36px; }
        .logo h1 {
            font-family: Georgia, serif; font-size: 28px; font-weight: 700;
            color: #8fe8b4; letter-spacing: -0.5px;
        }
        .logo p { font-size: 14px; color: #7a9a8a; margin-top: 6px; }
        .badge {
            display: inline-block; padding: 3px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 600; margin-top: 10px;
        }
        .badge-ver { background: rgba(143,232,180,0.15); color: #8fe8b4; }

        h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #c8dcd0; }
        .check-list { list-style: none; margin-bottom: 24px; }
        .check-list li {
            padding: 8px 0; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex; align-items: center; gap: 8px;
        }
        .check-list li:last-child { border-bottom: none; }
        .ok { color: #8fe8b4; }
        .warn { color: #f0c040; }
        .err { color: #f06060; }

        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block; font-size: 13px; font-weight: 600;
            color: #a0b8aa; margin-bottom: 6px;
        }
        .form-group input {
            width: 100%; padding: 14px 16px; border-radius: 10px;
            border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06);
            color: #e8e0d4; font-size: 15px; outline: none; transition: border 0.2s;
        }
        .form-group input:focus { border-color: #8fe8b4; }
        .form-group small { display: block; margin-top: 4px; font-size: 11px; color: #6a8a7a; }

        .btn {
            width: 100%; padding: 16px; border: none; border-radius: 12px;
            font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s;
            margin-top: 12px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #3cb96e 0%, #24894d 100%);
            color: #fff; box-shadow: 0 6px 24px rgba(36,137,77,0.4);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(36,137,77,0.5); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-secondary {
            background: rgba(255,255,255,0.06); color: #8fe8b4;
            border: 1.5px solid rgba(143,232,180,0.2);
        }

        .alert {
            padding: 14px 16px; border-radius: 10px; margin-bottom: 20px;
            font-size: 13px; line-height: 1.5;
        }
        .alert-error { background: rgba(240,96,96,0.12); border: 1px solid rgba(240,96,96,0.2); color: #f09090; }
        .alert-success { background: rgba(143,232,180,0.1); border: 1px solid rgba(143,232,180,0.2); color: #8fe8b4; }

        .results li { padding: 6px 0; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .results li:last-child { border-bottom: none; }

        .links { text-align: center; margin-top: 24px; }
        .links a {
            display: inline-block; padding: 12px 24px; border-radius: 10px;
            text-decoration: none; font-weight: 600; font-size: 14px; margin: 6px;
        }
        .link-site { background: rgba(143,232,180,0.1); color: #8fe8b4; }
        .link-admin { background: rgba(255,255,255,0.06); color: #c8dcd0; }
    </style>
</head>
<body>
<div class="container">
    <div class="logo">
        <h1>🌱 КиївЧорнозем</h1>
        <p>Інсталятор для Shared Hosting</p>
        <span class="badge badge-ver">v1.0</span>
    </div>

    <?php if ($installed): ?>
        <!-- ═══ УСПІХ ═══ -->
        <div class="alert alert-success">
            ✅ <strong>Інсталяція завершена успішно!</strong>
        </div>

        <h2>Результати:</h2>
        <ul class="check-list results">
            <?php foreach ($installResults as $r): ?>
                <li><?= $r ?></li>
            <?php endforeach; ?>
        </ul>

        <div class="alert" style="background:rgba(240,192,64,0.1);border:1px solid rgba(240,192,64,0.2);color:#f0c040">
            ⚠️ <strong>Збережіть ваш пароль!</strong> Він зашифрований bcrypt — відновити неможливо.<br>
            Файл install.php зараз буде видалено з сервера для безпеки.
        </div>

        <div class="links">
            <a href="/" class="link-site">🌐 Відкрити сайт</a>
            <a href="/admin" class="link-admin">🔐 Адмін-панель</a>
        </div>

        <?php
        // Самознищення install.php
        @unlink(__FILE__);
        ?>

    <?php else: ?>
        <!-- ═══ ПЕРЕВІРКА + ФОРМА ═══ -->

        <?php if (!empty($errors)): ?>
            <div class="alert alert-error">
                <?php foreach ($errors as $e): ?>
                    ❌ <?= htmlspecialchars($e) ?><br>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <h2>Перевірка системи</h2>
        <ul class="check-list">
            <?php foreach ($success as $s): ?>
                <li><span class="ok">✓</span> <?= htmlspecialchars($s) ?></li>
            <?php endforeach; ?>
            <?php foreach ($warnings as $w): ?>
                <li><span class="warn">⚠</span> <?= htmlspecialchars($w) ?></li>
            <?php endforeach; ?>
            <?php foreach ($errors as $e): ?>
                <li><span class="err">✗</span> <?= htmlspecialchars($e) ?></li>
            <?php endforeach; ?>
        </ul>

        <?php if ($requirementsOk || (empty($errors) && $step !== 'install')): ?>
            <h2>Налаштування</h2>
            <form method="POST">
                <input type="hidden" name="step" value="install">

                <div class="form-group">
                    <label>Пароль адміністратора</label>
                    <input type="password" name="admin_password" required minlength="6"
                           placeholder="Мінімум 6 символів">
                    <small>Цей пароль для входу в адмін-панель (/admin)</small>
                </div>

                <div class="form-group">
                    <label>Підтвердження паролю</label>
                    <input type="password" name="admin_password2" required minlength="6"
                           placeholder="Повторіть пароль">
                </div>

                <button type="submit" class="btn btn-primary">
                    🚀 Встановити КиївЧорнозем
                </button>
            </form>
        <?php else: ?>
            <div class="alert alert-error">
                Виправте помилки вище перед встановленням.
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <div style="text-align:center;margin-top:32px;font-size:11px;color:rgba(255,255,255,0.2)">
        КиївЧорнозем · <?= date('Y') ?>
    </div>
</div>
</body>
</html>
