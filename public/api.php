<?php
// КиївЧорнозем — PHP Бекенд для Shared Хостингу
// Цей файл замінює функціонал Supabase Edge Function

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Password, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Обробка CORS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

// Директорії для зберігання даних
$dataDir = __DIR__ . '/data';
$uploadsDir = __DIR__ . '/uploads';
$contentFile = $dataDir . '/content.json';
$passwordFile = $dataDir . '/password.hash';

// Створення директорій, якщо їх немає
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    // Захист директорії від прямого доступу через браузер
    file_put_contents($dataDir . '/.htaccess', "Require all denied\n");
}
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
    // Відключення лістингу в папці з картинками
    file_put_contents($uploadsDir . '/.htaccess', "Options -Indexes\n");
}

// Ініціалізація пароля за замовчуванням (уже не генеруємо автоматично)
if (!file_exists($passwordFile)) {
    // We let the system know the file is missing when trying to verify
}

function verifyPassword($passwordInput) {
    global $passwordFile;
    if (!file_exists($passwordFile)) return false;
    $hash = file_get_contents($passwordFile);
    return password_verify($passwordInput, trim($hash));
}

// Отримання паролю з заголовків (працює і на Apache, і на Nginx)
function getAuthPassword() {
    $pass = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if (empty($pass) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $pass = $headers['x-admin-password'] ?? $headers['X-Admin-Password'] ?? '';
    }
    return $pass;
}

// 1. Отримання контенту (Публічний доступ)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'content') {
    if (file_exists($contentFile)) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['content' => json_decode(file_get_contents($contentFile))]);
    } else {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['content' => null]);
    }
    exit;
}

// 2. POST запити
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // 2.1 Перевірка паролю (при логіні)
    if ($action === 'verify') {
        $password = $data['password'] ?? '';
        $valid = verifyPassword($password);
        header('Content-Type: application/json');
        echo json_encode(['valid' => $valid]);
        exit;
    }

    // Всі наступні дії вимагають авторизації через заголовок
    // EXCEPT telegram-send (public order form) which was handled above

    // 2.1b Telegram Proxy — send message (NO AUTH — public order form)
    if ($action === 'telegram-send') {
        $tgConfigFile = $dataDir . '/telegram.json';
        if (!file_exists($tgConfigFile)) {
            http_response_code(400);
            echo json_encode(['error' => 'Telegram не налаштовано']);
            exit;
        }
        $tgConfig = json_decode(file_get_contents($tgConfigFile), true);
        $token = $tgConfig['botToken'] ?? '';
        $chatId = $tgConfig['chatId'] ?? '';
        if (empty($token) || empty($chatId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Telegram Bot Token або Chat ID не задано']);
            exit;
        }
        $text = $data['text'] ?? '';
        if (empty($text)) {
            http_response_code(400);
            echo json_encode(['error' => 'Порожнє повідомлення']);
            exit;
        }
        $tgUrl = 'https://api.telegram.org/bot' . $token . '/sendMessage';
        $ch = curl_init($tgUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $tgResponse = json_decode($result, true);
        header('Content-Type: application/json');
        if ($httpCode === 200 && ($tgResponse['ok'] ?? false)) {
            echo json_encode(['ok' => true]);
        } else {
            http_response_code(502);
            echo json_encode(['ok' => false, 'error' => $tgResponse['description'] ?? 'Telegram API error']);
        }
        exit;
    }

    // Всі наступні дії вимагають авторизації через заголовок
    $authPass = getAuthPassword();
    if (!verifyPassword($authPass)) {
        http_response_code(401);
        echo json_encode(['error' => 'Невірний пароль доступу']);
        exit;
    }

    // 2.2 Збереження контенту
    if ($action === 'content') {
        $content = $data['content'] ?? [];
        file_put_contents($contentFile, json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    // 2.3 Зміна паролю
    if ($action === 'change-password') {
        $newPassword = $data['newPassword'] ?? '';
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Пароль має бути не менше 6 символів']);
            exit;
        }
        file_put_contents($passwordFile, password_hash($newPassword, PASSWORD_BCRYPT));
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    // 2.4 Завантаження картинки
    if ($action === 'upload') {
        $imageBase64 = $data['imageBase64'] ?? '';
        
        // Перевіряємо формат: data:image/png;base64,.....
        if (preg_match('/^data:image\/(\w+);base64,/', $imageBase64, $match)) {
            $type = strtolower($match[1]); // jpg, jpeg, png, webp
            
            if (!in_array($type, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                if ($type === 'svg+xml') {
                    $type = 'svg';
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Непідтримуваний формат файлу: ' . $type]);
                    exit;
                }
            }
            
            // Відрізаємо мета-заголовок data:... і декодуємо
            $dataBase64 = substr($imageBase64, strpos($imageBase64, ',') + 1);
            $decodedData = base64_decode($dataBase64);
            
            if ($decodedData === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Помилка декодування зображення']);
                exit;
            }
            
            $filename = 'img_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $type;
            file_put_contents($uploadsDir . '/' . $filename, $decodedData);
            
            // Динамічний розрахунок базового шляху
            $reqUri = explode('?', $_SERVER['REQUEST_URI'])[0]; 
            $basePath = rtrim(dirname($reqUri), '/\\');
            
            $url = $basePath . '/uploads/' . $filename;
            
            header('Content-Type: application/json');
            echo json_encode(['url' => $url]);
            exit;
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Невірний формат Base64.']);
            exit;
        }
    }


    // 2.6 Telegram Config — save bot token + chat ID (admin only, already auth-checked above)
    if ($action === 'telegram-config') {
        $tgConfigFile = $dataDir . '/telegram.json';
        $botToken = $data['botToken'] ?? '';
        $chatId = $data['chatId'] ?? '';
        // Validate token format: 123456:ABCdef...
        if (!empty($botToken) && !preg_match('/^\d+:[A-Za-z0-9_-]{30,50}$/', $botToken)) {
            http_response_code(400);
            echo json_encode(['error' => 'Невірний формат Bot Token']);
            exit;
        }
        file_put_contents($tgConfigFile, json_encode([
            'botToken' => $botToken,
            'chatId' => $chatId,
        ], JSON_UNESCAPED_UNICODE));
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    // 2.7 Telegram Config — read (admin only, returns masked token)
    if ($action === 'telegram-config' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        // This won't actually match (we're inside POST block), but keep for docs
    }

    http_response_code(400);
    echo json_encode(['error' => 'Невідома дія (action)']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Метод не підтримується']);
exit;
