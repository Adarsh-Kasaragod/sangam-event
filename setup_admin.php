<?php
// setup_admin.php
// Run this script once from the command line to insert/update the admin password.
// Usage: php setup_admin.php
// Place this file in the event-app root (beside .env).

declare(strict_types=1);

require_once __DIR__ . '/backend/config/db.php';

// ── Configuration — change these before running ──────────────────────────────
$adminEmail    = 'admin@college.edu';
$adminPassword = 'Admin@123'; // Change to your desired password
// ─────────────────────────────────────────────────────────────────────────────

if ($adminPassword === 'Admin@123') {
    echo "⚠  WARNING: You are using the default password. Change it before deploying!\n\n";
}

// Generate bcrypt hash (cost 12)
$hash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);

echo "Admin Email:    $adminEmail\n";
echo "Password Hash:  $hash\n\n";

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO admins (email, password_hash)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    ");
    $stmt->execute([$adminEmail, $hash]);
    echo "✅ Admin user inserted/updated successfully.\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
