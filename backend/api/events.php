<?php
// backend/api/events.php
// Handles CRUD operations for events.
// GET (list/single): public
// POST, PUT, DELETE: admin-only (requireAuth())

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validate.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

match ($method) {
    'GET'    => $id ? getEvent($db, $id) : listEvents($db),
    'POST'   => createEvent($db),
    'PUT'    => $id ? updateEvent($db, $id) : errorResponse('Event ID required', 400),
    'DELETE' => $id ? deleteEvent($db, $id) : errorResponse('Event ID required', 400),
    default  => errorResponse('Method not allowed', 405),
};


function listEvents(PDO $db): never {
    $stmt = $db->query("
        SELECT
            e.*,
            COUNT(r.id) AS registration_count
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        GROUP BY e.id
        ORDER BY e.event_date ASC
    ");
    $events = $stmt->fetchAll();
    jsonResponse(array_map('computeStatus', $events));
}


function getEvent(PDO $db, int $id): never {
    $stmt = $db->prepare("
        SELECT e.*, COUNT(r.id) AS registration_count
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        WHERE e.id = ?
        GROUP BY e.id
    ");
    $stmt->execute([$id]);
    $event = $stmt->fetch();

    if (!$event) {
        errorResponse('Event not found', 404);
    }

    jsonResponse(computeStatus($event));
}


function createEvent(PDO $db): never {
    requireAuth();

    $body = getJsonBody();
    $missing = validateRequired(['title', 'description', 'event_date', 'venue'], $body);
    if ($missing) {
        errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
    }

    $eventDate = validateDatetime($body['event_date']);
    if (!$eventDate) {
        errorResponse('Invalid event_date format', 422);
    }

    $deadline = null;
    if (!empty($body['registration_deadline'])) {
        $deadline = validateDatetime($body['registration_deadline']);
        if (!$deadline) {
            errorResponse('Invalid registration_deadline format', 422);
        }
    }

    $capacity = isset($body['capacity']) && $body['capacity'] !== '' && $body['capacity'] !== null
        ? (int) $body['capacity']
        : null;

    $stmt = $db->prepare("
        INSERT INTO events (title, description, event_date, venue, image_url, capacity, registration_deadline)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        trim($body['title']),
        trim($body['description']),
        $eventDate,
        trim($body['venue']),
        !empty($body['image_url']) ? trim($body['image_url']) : null,
        $capacity,
        $deadline,
    ]);

    $newId = (int) $db->lastInsertId();
    getEvent($db, $newId);
}


function updateEvent(PDO $db, int $id): never {
    requireAuth();

    $check = $db->prepare('SELECT id FROM events WHERE id = ?');
    $check->execute([$id]);
    if (!$check->fetch()) {
        errorResponse('Event not found', 404);
    }

    $body    = getJsonBody();
    $missing = validateRequired(['title', 'description', 'event_date', 'venue'], $body);
    if ($missing) {
        errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
    }

    $eventDate = validateDatetime($body['event_date']);
    if (!$eventDate) {
        errorResponse('Invalid event_date format', 422);
    }

    $deadline = null;
    if (!empty($body['registration_deadline'])) {
        $deadline = validateDatetime($body['registration_deadline']);
        if (!$deadline) {
            errorResponse('Invalid registration_deadline format', 422);
        }
    }

    $capacity = isset($body['capacity']) && $body['capacity'] !== '' && $body['capacity'] !== null
        ? (int) $body['capacity']
        : null;

    $stmt = $db->prepare("
        UPDATE events
        SET title = ?, description = ?, event_date = ?, venue = ?,
            image_url = ?, capacity = ?, registration_deadline = ?
        WHERE id = ?
    ");
    $stmt->execute([
        trim($body['title']),
        trim($body['description']),
        $eventDate,
        trim($body['venue']),
        !empty($body['image_url']) ? trim($body['image_url']) : null,
        $capacity,
        $deadline,
        $id,
    ]);

    getEvent($db, $id);
}


function deleteEvent(PDO $db, int $id): never {
    requireAuth();

    $check = $db->prepare('SELECT id FROM events WHERE id = ?');
    $check->execute([$id]);
    if (!$check->fetch()) {
        errorResponse('Event not found', 404);
    }

    $stmt = $db->prepare('DELETE FROM events WHERE id = ?');
    $stmt->execute([$id]);

    jsonResponse(['message' => 'Event deleted successfully']);
}


/**
 * Compute the event status based on date, deadline, and capacity.
 * Status is never stored — always calculated fresh from DB data.
 */
function computeStatus(array $event): array {
    $now       = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $eventDate = new DateTimeImmutable($event['event_date']);
    $regCount  = (int) ($event['registration_count'] ?? 0);

    if ($eventDate < $now) {
        $status = 'Past';
    } elseif (
        !empty($event['registration_deadline']) &&
        new DateTimeImmutable($event['registration_deadline']) < $now
    ) {
        $status = 'Registration Closed';
    } elseif (
        $event['capacity'] !== null &&
        $regCount >= (int) $event['capacity']
    ) {
        $status = 'Registration Closed';
    } else {
        $status = 'Upcoming';
    }

    return array_merge($event, [
        'status'             => $status,
        'registration_count' => $regCount,
        'capacity'           => $event['capacity'] !== null ? (int) $event['capacity'] : null,
        'id'                 => (int) $event['id'],
    ]);
}

function getJsonBody(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        errorResponse('Invalid or missing JSON body', 400);
    }
    return $body;
}
