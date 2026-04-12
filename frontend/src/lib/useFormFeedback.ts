/*
Adi Avraham
CMSC495 Group Golf Capstone Project
useFormFeedback.ts
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Provides reusable frontend form-feedback state and error-message helpers.
*/

import { useState } from 'react';
import { ApiError } from '../api/client';

export type FeedbackState = {
	message: string,
	error: string,
};

export const EMPTY_FEEDBACK: FeedbackState = {
	message: '',
	error: '',
};

// Extracts a user-facing error message from known API and runtime error shapes.
export function getErrorMessage(error: unknown, fallback: string) {
	if (error instanceof ApiError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallback;
}

// Exposes a consistent local success/error API for forms and async actions.
export function useFormFeedback() {
	const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);

	return {
		feedback,
		reset() {
			setFeedback(EMPTY_FEEDBACK);
		},
		setSuccess(message: string) {
			setFeedback({ message, error: '' });
		},
		setError(error: string) {
			setFeedback({ message: '', error });
		},
		setErrorFromUnknown(error: unknown, fallback: string) {
			setFeedback({ message: '', error: getErrorMessage(error, fallback) });
		},
	};
}
