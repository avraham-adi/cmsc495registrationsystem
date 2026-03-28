import jwt from 'jsonwebtoken';
import User from '../domain/user.js';

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Authentication required. No token provided.',
            });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Authentication required. Invalid authorization format.',
            });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token.',
        });
    }
}

function firstLoginMiddleware(options = {}) {
    const { allowedPaths = ['/api/auth/change-password', '/api/auth/logout'], allowCurrentUserInfo = true } = options;

    return async function enforceFirstLogin(req, res, next) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    error: 'Authentication required.',
                });
            }

            const user = new User();
            await user.initByID(req.user.id);

            const isFirstLogin = user.getPasswordHash() === 'Password';

            if (!isFirstLogin) {
                return next();
            }

            const requestPath = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
            const normalizedPath = requestPath.replace(/\/+$/, '') || '/';
            const normalizedAllowedPaths = allowedPaths.map((path) => path.replace(/\/+$/, '') || '/');

            if (normalizedAllowedPaths.includes(normalizedPath)) {
                return next();
            }

            if (allowCurrentUserInfo && (normalizedPath === '/api/auth/me' || normalizedPath === '/api/users/current')) {
                return next();
            }

            return res.status(403).json({
                error: 'Password change required before accessing this resource.',
            });
        } catch (err) {
            return next(err);
        }
    };
}

export { firstLoginMiddleware };
export default authMiddleware;
