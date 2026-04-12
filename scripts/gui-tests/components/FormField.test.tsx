import { screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormField } from '../../../frontend/src/components/FormField';
import { renderWithRouter } from '../support/test-utils';

describe('FormField', () => {
	it('renders an accessible input by label', () => {
		renderWithRouter(
			<FormField id="email" label="Email" value="" onChange={vi.fn()} type="email" />
		);

		expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
	});

	it('propagates value changes through onChange', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		function ControlledField() {
			const [value, setValue] = useState('');

			return (
				<FormField
					id="password"
					label="Password"
					value={value}
					type="password"
					onChange={(nextValue) => {
						setValue(nextValue);
						onChange(nextValue);
					}}
				/>
			);
		}

		renderWithRouter(<ControlledField />);

		await user.type(screen.getByLabelText('Password'), 'abc');

		expect(onChange).toHaveBeenCalledTimes(3);
		expect(onChange).toHaveBeenLastCalledWith('abc');
	});
});
