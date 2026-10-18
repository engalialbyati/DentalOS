const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function signToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// Verifies the Bearer token and attaches req.user
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, username: payload.username, role: payload.role };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
}

// Restrict a route to one or more roles. Usage: router.post('/', requireAuth, requireRole('admin'), handler)
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = { signToken, requireAuth, requireRole, JWT_SECRET };
