<?php
// backend/api/stats.php
// GET /api/stats.php
// Admin-only: dashboard summary statistics.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

requireAuth();

try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

$totalEvents        = (int) $db->query('SELECT COUNT(*) FROM events')->fetchColumn();
$totalRegistrations = (int) $db->query('SELECT COUNT(*) FROM registrations')->fetchColumn();
$upcomingEvents     = (int) $db->query("SELECT COUNT(*) FROM events WHERE event_date > NOW()")->fetchColumn();

// Recent registrations (last 5) for dashboard activity feed
$recentStmt = $db->query("
    SELECT r.name, r.email, r.created_at, e.title AS event_title
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    ORDER BY r.created_at DESC
    LIMIT 5
");
$recentRegistrations = $recentStmt->fetchAll();

jsonResponse([
    'total_events'         => $totalEvents,
    'total_registrations'  => $totalRegistrations,
    'upcoming_events'      => $upcomingEvents,
    'recent_registrations' => $recentRegistrations,
]);
