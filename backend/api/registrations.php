<?php
// backend/api/registrations.php
// GET /api/registrations.php?event_id=N[&search=...]
// Admin-only: list registrations for a given event, with optional name/email search.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

// Verify admin token on every request — security is server-side, not just React
requireAuth();

if (!isset($_GET['event_id'])) {
    errorResponse('event_id query parameter is required', 400);
}

$eventId = (int) $_GET['event_id'];
$search  = trim($_GET['search'] ?? '');

try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

$eventStmt = $db->prepare('SELECT id, title FROM events WHERE id = ?');
$eventStmt->execute([$eventId]);
$event = $eventStmt->fetch();
if (!$event) {
    errorResponse('Event not found', 404);
}

// Build query — optionally filter by name or email using LIKE
if ($search !== '') {
    $like = '%' . $search . '%';
    $stmt = $db->prepare("
        SELECT id, name, email, phone, created_at
        FROM registrations
        WHERE event_id = ?
          AND (name LIKE ? OR email LIKE ?)
        ORDER BY created_at DESC
    ");
    $stmt->execute([$eventId, $like, $like]);
} else {
    $stmt = $db->prepare("
        SELECT id, name, email, phone, created_at
        FROM registrations
        WHERE event_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$eventId]);
}

$registrations = $stmt->fetchAll();

// Total count (without search filter)
$countStmt = $db->prepare('SELECT COUNT(*) FROM registrations WHERE event_id = ?');
$countStmt->execute([$eventId]);
$totalCount = (int) $countStmt->fetchColumn();

jsonResponse([
    'event'          => $event,
    'total_count'    => $totalCount,
    'filtered_count' => count($registrations),
    'registrations'  => $registrations,
]);
