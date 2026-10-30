<?php
// backend/config/db.php
// PDO database connection — reads credentials from environment variables.
// On XAMPP: set values in .env and load via loadEnv() called from this file.
// On Render/production: set env vars in the Docker service dashboard.

declare(strict_types=1);

/**
 * Minimal .env loader for local XAMPP development.
 * Reads KEY=VALUE pairs and sets them with putenv() + $_ENV.
 * Does NOT overwrite variables already set by the system (e.g. Render env vars).
 */
function loadEnv(string $path): void {
    if (!file_exists($path)) {
        return; // No .env file — rely on system env vars (production)
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue; // Skip comments and blanks
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'"); // Strip quotes if present
        if ($key !== '' && !array_key_exists($key, $_ENV)) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

// Load .env from the project root (two levels up from config/)
loadEnv(dirname(__DIR__, 2) . '/.env');

/**
 * Returns a PDO instance configured for MySQL with error exceptions.
 * Throws RuntimeException on connection failure — callers should catch this.
 */
function getDB(): PDO {
    static $pdo = null; // Singleton: reuse connection within a request

    if ($pdo !== null) {
        return $pdo;
    }

    $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1';
    $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
    $name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'event_app';
    $user = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
    $pass = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Use real prepared statements
        ]);
        return $pdo;
    } catch (PDOException $e) {
        // Do not expose DSN or credentials in the error message
        throw new RuntimeException('Database connection failed: ' . $e->getMessage());
    }
}
