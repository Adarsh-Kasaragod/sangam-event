<?php
// backend/helpers/response.php
// Centralised JSON response helpers.
// All API endpoints must use these functions to ensure consistent output.

declare(strict_types=1);

/**
 * Send a JSON response and terminate the script.
 */
function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send a standardised error response.
 */
function errorResponse(string $message, int $status = 400, array $extra = []): never {
    jsonResponse(array_merge(['error' => $message], $extra), $status);
}
