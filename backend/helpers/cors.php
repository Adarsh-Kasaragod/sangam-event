<?php
// backend/helpers/cors.php
// Sets CORS headers for every response.
// ALLOWED_ORIGIN env var controls which origin is permitted.
// Never use '*' in production — list the exact frontend URL.

declare(strict_types=1);

function setCorsHeaders(): void {
    $allowedOrigin = $_ENV['ALLOWED_ORIGIN'] ?? getenv('ALLOWED_ORIGIN') ?: 'http://localhost:5173';

    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin'); // Tell caches that the response varies by Origin

    // Handle preflight OPTIONS request immediately
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
