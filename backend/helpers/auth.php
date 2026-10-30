<?php
// backend/helpers/auth.php
// Stateless HMAC token authentication for admin endpoints.
//
// Token format (Base64URL encoded JSON payload + HMAC-SHA256 signature):
//   <base64url(payload)>.<base64url(signature)>
//
// Payload fields: admin_id, email, exp (Unix timestamp expiry)
// Secret: APP_SECRET environment variable (must be set in .env / Render)

declare(strict_types=1);

/**
 * Generate a signed token for an admin user.
 */
function generateToken(int $adminId, string $email): string {
    $secret = $_ENV['APP_SECRET'] ?? getenv('APP_SECRET') ?: 'change-me-in-production';

    $payload = base64url_encode(json_encode([
        'admin_id' => $adminId,
        'email'    => $email,
        'exp'      => time() + (60 * 60 * 24), // 24-hour expiry
    ]));

    $signature = base64url_encode(
        hash_hmac('sha256', $payload, $secret, binary: true)
    );

    return "$payload.$signature";
}

/**
 * Verify the Bearer token from the Authorization header.
 * Returns the decoded payload array on success, or sends a 401 and exits.
 */
function requireAuth(): array {
    $secret = $_ENV['APP_SECRET'] ?? getenv('APP_SECRET') ?: 'change-me-in-production';

    // Extract token from "Authorization: Bearer <token>"
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($authHeader, 'Bearer ')) {
        // Also check Apache rewrites that strip the Authorization header
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }

    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Unauthorised: missing or invalid token']);
        exit;
    }

    $token = substr($authHeader, 7);
    $parts = explode('.', $token);

    if (count($parts) !== 2) {
        sendUnauthorised();
    }

    [$payloadB64, $sigB64] = $parts;

    // Verify signature
    $expectedSig = base64url_encode(
        hash_hmac('sha256', $payloadB64, $secret, binary: true)
    );

    if (!hash_equals($expectedSig, $sigB64)) {
        sendUnauthorised('Invalid token signature');
    }

    $payload = json_decode(base64url_decode($payloadB64), true);

    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        sendUnauthorised('Token expired');
    }

    return $payload;
}

function sendUnauthorised(string $msg = 'Unauthorised'): never {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $msg]);
    exit;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}
