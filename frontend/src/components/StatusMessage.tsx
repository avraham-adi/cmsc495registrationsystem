/*
Adi Avraham
CMSC495 Group Golf Capstone Project
StatusMessage.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders standardized success, error, and informational status messages.
*/

type statusMessageProps = {
	kind: 'error' | 'success' | 'info';
	message: string;
};

export function StatusMessage({ kind, message }: statusMessageProps) {
	return <p className={'message' + kind}>{message}</p>;
}
