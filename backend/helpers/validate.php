<?php
// backend/helpers/validate.php
// Server-side input validation helpers.
// All validation happens here — never trust client-side checks alone.

declare(strict_types=1);

/**
 * Check that all required field names exist and are non-empty in $data.
 */
function validateRequired(array $required, array $data): array {
    $missing = [];
    foreach ($required as $field) {
        $value = $data[$field] ?? null;
        // Treat empty string and null as missing; 0 is valid
        if ($value === null || (is_string($value) && trim($value) === '')) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Validate an email address using PHP's built-in filter.
 */
function validateEmail(string $email): bool {
    return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate a phone number: must be exactly 10 digits (Indian mobile format).
 * Strips spaces, dashes, and parentheses before checking.
 */
function validatePhone(string $phone): bool {
    // Remove common formatting characters
    $digits = preg_replace('/[\s\-\(\)\+]/', '', $phone);
    // Must be exactly 10 digits
    return preg_match('/^\d{10}$/', $digits) === 1;
}

/**
 * Validate and normalise a datetime string.
 * Accepts ISO 8601 or MySQL datetime format.
 * Returns a MySQL-compatible 'Y-m-d H:i:s' string, or null on failure.
 */
function validateDatetime(string $value): ?string {
    $value = trim($value);
    if ($value === '') {
        return null;
    }
    // Replace 'T' separator (from HTML datetime-local inputs)
    $value = str_replace('T', ' ', $value);
    // Strip seconds if not provided (e.g. "2026-11-15 09:00")
    if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value)) {
        $value .= ':00';
    }
    $dt = DateTime::createFromFormat('Y-m-d H:i:s', $value);
    return ($dt && $dt->format('Y-m-d H:i:s') === $value) ? $value : null;
}
