/*
Adi Avraham
CMSC495 Group Golf Capstone Project
session.middleware.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Hydrates authenticated requests, enforces session access, and exposes first-login middleware helpers.
*/

import SessionService from '../services/session.service.js';
import * as db from '../db/connection.js';

const s = new SessionService();

export async function authMw(req, res, next) {
    try {
        const a = req.session?.auth;
        const id = a?.userId;

        if (!id) {
            return res.status(401).json({
                error: 'Authentication required. No active session found.',
            });
        }

        const p = await s.getPld(id);
        const sv = Number(a?.sessVer ?? a?.sess_ver);

        if (!Number.isFinite(sv) || sv !== Number(p.sessVer)) {
            await s.destroy(req, res);

            return res.status(401).json({
                error: 'Session is no longer valid. Please log in again.',
            });
        }

        req.user = await s.hydrate(id);
        req.firstLogin = {
            status: req.user.first_login === true,
        };

        return next();
    } catch (err) {
        return next(err);
    }
}

export function flMw(options = {}) {
    const { allowedPaths: paths = ['/user/logout'], allowCurrentUserInfo: cur = true } = options;

    return async function fl(req, res, next) {
        try {
            const id = req.session?.auth?.userId;

            if (!id) {
                return res.status(401).json({
                    error: 'Authentication required.',
                });
            }

            const r = await db.query('SELECT first_login FROM users WHERE user_id = ?', [id]);

            if (r.length === 0) {
                return res.status(401).json({
                    error: 'Authentication required.',
                });
            }

            req.firstLogin = {
                status: r[0].first_login === 1,
            };

            if (req.firstLogin.status === false) {
                return next();
            }

            const p = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
            const np = p.replace(/\/+$/, '') || '/';
            const ap = paths.map((path) => path.replace(/\/+$/, '') || '/');

            if (ap.includes(np)) {
                return next();
            }

            if (cur && np === '/user/me') {
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

export default authMw;
