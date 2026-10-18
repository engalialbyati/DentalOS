// Centralized async handler wrapper + error middleware.
// Masks internal errors from clients while logging full detail server-side.

// Wraps an async route handler so rejected promises hit next(err).
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Generic "not found" for unmatched routes.
function notFound(req, res) {
    res.status(404).json({ error: 'Resource not found' });
}

// Final error handler. Never leaks DB/stack details to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = err.status || 500;

    if (status >= 500) {
        console.error('Unhandled server error:', err);
    }

    // In production, hide internal messages for 5xx errors.
    const message =
        status >= 500 && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Server error';

    res.status(status).json({ error: message });
}

module.exports = { asyncHandler, notFound, errorHandler };
