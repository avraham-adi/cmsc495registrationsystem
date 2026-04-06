import * as db from '../db/connection.js';

async function getRole(id) {
    const a = await db.query('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);
    if (a.length > 0) {
        return {
            role: 'ADMIN',
            role_id: a[0].employee_id,
            role_details: a[0].access_level,
        };
    }

    const p = await db.query('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
    if (p.length > 0) {
        return {
            role: 'PROFESSOR',
            role_id: p[0].professor_id,
            role_details: p[0].department,
        };
    }

    const s = await db.query('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
    if (s.length > 0) {
        return {
            role: 'STUDENT',
            role_id: s[0].student_id,
            role_details: s[0].major,
        };
    }

    return null;
}

function roles(...rs) {
    if (rs.length === 0) {
        throw new Error('authorizeRoles requires at least one role');
    }

    return async (req, res, next) => {
        // TODO(SESSION_AUTH_MIGRATION): keep this server-side role lookup. Session cookies should only identify the user, not authorize by embedded role data.
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required.',
            });
        }

        const role = await getRole(req.user.id);

        if (!role) {
            return res.status(403).json({
                error: 'Forbidden.',
            });
        }

        req.user = {
            ...req.user,
            role: role.role,
            role_id: role.role_id,
            role_details: role.role_details,
        };

        if (!rs.includes(role.role)) {
            return res.status(403).json({
                error: 'Forbidden.',
            });
        }

        next();
    };
}

export default roles;
