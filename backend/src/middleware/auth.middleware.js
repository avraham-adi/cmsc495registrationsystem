import jwt from 'jsonwebtoken';
import * as db from '../db/connection.js';

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
            id: decoded.user.id,
            name: decoded.user.name,
            email: decoded.user.email,
            role: decoded.user.role,
            role_id: decoded.user.role_id,
            role_details: decoded.user.role_details,
        };

        req.firstLogin = {
            status: decoded.firstLogin,
        };

        next();
        // eslint-disable-next-line no-unused-vars
    } catch (err) {
        // console.error(err);
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

            const rows = await db.query('SELECT first_login FROM users WHERE user_id = ?', [req.user.id]);

            if (rows.length === 0) {
                return res.status(401).json({
                    error: 'Authentication required.',
                });
            }

            req.firstLogin = {
                status: rows[0].first_login === 1,
            };

            if (req.firstLogin.status === false) {
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

export { firstLoginMiddleware, authMiddleware };
export default authMiddleware;
