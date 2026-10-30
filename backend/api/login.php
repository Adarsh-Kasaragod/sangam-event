<?php
// backend/api/login.php
// POST /api/login.php
// Admin authentication endpoint.
// Accepts {email, password}, verifies with password_verify(),
// and returns a signed HMAC token on success.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    errorResponse('Invalid JSON body', 400);
}

$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if ($email === '' || $password === '') {
    errorResponse('Email and password are required', 400);
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
} catch (RuntimeException $e) {
    errorResponse('Database error', 500);
}

// Use constant-time comparison (password_verify is already safe against timing attacks)
if (!$admin || !password_verify($password, $admin['password_hash'])) {
    // Generic message — do not reveal which field is wrong
    errorResponse('Invalid email or password', 401);
}

$token = generateToken((int) $admin['id'], $admin['email']);

jsonResponse([
    'token' => $token,
    'admin' => [
        'id'    => (int) $admin['id'],
        'email' => $admin['email'],
    ],
]);
