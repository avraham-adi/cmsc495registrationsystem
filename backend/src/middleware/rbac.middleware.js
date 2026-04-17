/*
Adi Avraham
CMSC495 Group Golf Capstone Project
rbac.middleware.js
input
authenticated request objects and allowed role arguments
output
role-checked request users or HTTP authorization responses
description
Reloads role state from the database and blocks requests that lack the required role.
*/

import * as db from '../db/connection.js';

// Reloads the current database-backed role so authorization is not based on stale session data.
async function getRole(id) {
	const adminRows = await db.query('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);
	if (adminRows.length > 0) {
		return {
			role: 'ADMIN',
			role_id: adminRows[0].employee_id,
			role_details: adminRows[0].access_level,
		};
	}

	const professorRows = await db.query('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
	if (professorRows.length > 0) {
		return {
			role: 'PROFESSOR',
			role_id: professorRows[0].professor_id,
			role_details: professorRows[0].department,
		};
	}

	const studentRows = await db.query('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
	if (studentRows.length > 0) {
		return {
			role: 'STUDENT',
			role_id: studentRows[0].student_id,
			role_details: studentRows[0].major,
		};
	}

	return null;
}

// Enforces role membership after reloading the latest role assignment from MySQL.
function roles(...rs) {
	if (rs.length === 0) {
		throw new Error('authorizeRoles requires at least one role');
	}

	return async (req, res, next) => {
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
