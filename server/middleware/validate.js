// Lightweight input validation helpers. Throws a structured error that the
// global handler turns into a 400. Keeps route handlers readable and safe.

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.status = 400;
    }
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

// Ensures body contains the listed keys with non-empty trimmed strings.
function requireString(body, fields) {
    for (const f of fields) {
        if (!isNonEmptyString(body[f])) {
            throw new ValidationError(`Missing or invalid field: ${f}`);
        }
    }
}

// Clamp an integer into [min, max]; throws if missing/invalid.
function requireInt(body, field, { min = -Infinity, max = Infinity, default: def } = {}) {
    let raw = body[field];
    if (raw === undefined || raw === null || raw === '') {
        if (def !== undefined) return def;
        throw new ValidationError(`Missing field: ${field}`);
    }
    const n = Number(raw);
    if (!Number.isInteger(n)) throw new ValidationError(`${field} must be an integer`);
    if (n < min || n > max) throw new ValidationError(`${field} must be between ${min} and ${max}`);
    return n;
}

// Validate + clamp a numeric value (allows decimals, e.g. prices).
function requireNumber(body, field, { min = 0, default: def } = {}) {
    let raw = body[field];
    if (raw === undefined || raw === null || raw === '') {
        if (def !== undefined) return def;
        throw new ValidationError(`Missing field: ${field}`);
    }
    const n = Number(raw);
    if (Number.isNaN(n)) throw new ValidationError(`${field} must be a number`);
    if (n < min) throw new ValidationError(`${field} must be >= ${min}`);
    return n;
}

// Truncate a string to a max length to protect the DB / prevent abuse.
function clampString(value, maxLen = 1000) {
    if (typeof value !== 'string') return null;
    return value.slice(0, maxLen);
}

// Basic email format check (returns boolean, does not throw).
function isValidEmail(v) {
    return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Sanitize a date string; returns a Date or null. Accepts ISO strings only.
function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = {
    ValidationError,
    requireString,
    requireInt,
    requireNumber,
    clampString,
    isValidEmail,
    isNonEmptyString,
    parseDate,
};
