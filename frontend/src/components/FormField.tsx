/*
Adi Avraham
CMSC495 Group Golf Capstone Project
FormField.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders a labeled input field used across forms in the frontend.
*/

type FormFieldProps = {
	id: string;
	label: string;
	type?: string;
	value: string;
	onChange: (value: string) => void;
	autoComplete?: string;
	required?: boolean;
	placeholder?: string;
};

export function FormField({ id, label, type = 'text', value, onChange, autoComplete, required, placeholder }: FormFieldProps) {
	return (
		<label className="field" htmlFor={id}>
			<span>{label}</span>
			<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required={required} placeholder={placeholder} />
		</label>
	);
}
