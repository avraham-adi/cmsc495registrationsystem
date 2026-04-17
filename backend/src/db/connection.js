/*
Adi Avraham
CMSC495 Group Golf Capstone Project
connection.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Creates and exports the shared MySQL connection helpers used across backend services.
*/

import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Parse JSON fields automatically.
function typeCastJson(field, next) {
	if (field.type !== 'JSON') {
		return next();
	}

	const value = field.string('utf8');
	return value === null ? null : JSON.parse(value);
}

// Create a connection pool with the provided configuration details
let con = mysql.createPool({
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	connectionLimit: 10,
	typeCast: typeCastJson,
});

// Standard query through Pool
export const query = (sql, params) => {
	return new Promise((resolve, reject) => {
		con.query(sql, params, (err, results) => {
			if (err) reject(err);
			else resolve(results);
		});
	});
};

// get a connection from the pool for transactions
export const getConnection = () => {
	return new Promise((resolve, reject) => {
		con.getConnection((err, connection) => {
			if (err) reject(err);
			else resolve(connection);
		});
	});
};

// Begin Transaction
export const beginTransaction = (connection) => {
	return new Promise((resolve, reject) => {
		connection.beginTransaction((err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

// Commit Transaction
export const commit = (connection) => {
	return new Promise((resolve, reject) => {
		connection.commit((err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

// Rollback Transaction
export const rollback = (connection) => {
	return new Promise((resolve) => {
		connection.rollback(() => {
			resolve();
		});
	});
};

// Query using a specific connection (for transactions)
export const queryWithConnection = (connection, sql, params) => {
	return new Promise((resolve, reject) => {
		connection.query(sql, params, (err, results) => {
			if (err) reject(err);
			else resolve(results);
		});
	});
};

// Release a connection back to the pool
export const releaseConnection = (connection) => {
	connection.release();
};

// Close the connection pool
export const close = () => {
	return new Promise((resolve, reject) => {
		con.end((err) => {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
};
