<?php
// backend/api/register.php
// POST /api/register.php
// Student event registration endpoint. Public (no auth required).
// Validates input, checks event status (past/closed/full), prevents duplicates.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    errorResponse('Invalid JSON body', 400);
}

// ── 1. Validate required fields ───────────────────────────────────────────────
$missing = validateRequired(['event_id', 'name', 'email', 'phone'], $body);
if ($missing) {
    errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
}

$eventId = (int) $body['event_id'];
$name    = trim($body['name']);
$email   = trim($body['email']);
$phone   = trim($body['phone']);

// ── 2. Format validation ──────────────────────────────────────────────────────
if (!validateEmail($email)) {
    errorResponse('Invalid email address', 422);
}

if (!validatePhone($phone)) {
    errorResponse('Phone number must be exactly 10 digits', 422);
}

if (strlen($name) < 2) {
    errorResponse('Full name must be at least 2 characters', 422);
}

// ── 3. Load event from DB ─────────────────────────────────────────────────────
try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

$stmt = $db->prepare("
    SELECT e.*, COUNT(r.id) AS registration_count
    FROM events e
    LEFT JOIN registrations r ON r.event_id = e.id
    WHERE e.id = ?
    GROUP BY e.id
");
$stmt->execute([$eventId]);
$event = $stmt->fetch();

if (!$event) {
    errorResponse('Event not found', 404);
}

// ── 4. Business-rule checks ───────────────────────────────────────────────────
$now       = new DateTimeImmutable('now', new DateTimeZone('UTC'));
$eventDate = new DateTimeImmutable($event['event_date']);

if ($eventDate < $now) {
    errorResponse('Registration is not allowed for past events', 422);
}

if (!empty($event['registration_deadline'])) {
    $deadline = new DateTimeImmutable($event['registration_deadline']);
    if ($deadline < $now) {
        errorResponse('The registration deadline for this event has passed', 422);
    }
}

$regCount = (int) $event['registration_count'];
if ($event['capacity'] !== null && $regCount >= (int) $event['capacity']) {
    errorResponse('This event has reached its maximum capacity', 422);
}

// ── 5. Insert registration (catch duplicate key error) ────────────────────────
try {
    $insert = $db->prepare("
        INSERT INTO registrations (event_id, name, email, phone)
        VALUES (?, ?, ?, ?)
    ");
    $insert->execute([$eventId, $name, $email, $phone]);
} catch (PDOException $e) {
    // SQLSTATE 23000 = Integrity constraint violation (duplicate key)
    if ($e->getCode() === '23000') {
        errorResponse('You are already registered for this event', 409);
    }
    // Re-throw unexpected DB errors
    errorResponse('Registration failed due to a database error', 500);
}

jsonResponse([
    'message' => 'Registration successful! We look forward to seeing you at the event.',
    'registration' => [
        'event_id' => $eventId,
        'name'     => $name,
        'email'    => $email,
    ],
], 201);
