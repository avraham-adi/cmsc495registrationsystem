export function assertStatus(res, expectedStatus, message) {
	if (res.status !== expectedStatus) {
		throw new Error(`${message}. Expected ${expectedStatus}, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
	}
}

export function assertTruthy(value, message, payload = value) {
	if (!value) {
		throw new Error(`${message}. Payload: ${JSON.stringify(payload)}`);
	}
}

export function assertEqual(actual, expected, message, payload = { actual, expected }) {
	if (actual !== expected) {
		throw new Error(`${message}. Payload: ${JSON.stringify(payload)}`);
	}
}
