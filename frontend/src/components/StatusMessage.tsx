type statusMessageProps = {
	kind: 'error' | 'success' | 'info',
	message: string,
};

export function StatusMessage({ kind, message }: statusMessageProps) {
	return <p className={'message' + kind}>{message}</p>;
}
