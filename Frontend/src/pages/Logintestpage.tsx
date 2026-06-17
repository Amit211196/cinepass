import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Login } from '../components/Login';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type LocationState = {
	from?: string | { pathname?: string };
	selectedSeats?: string[];
};

export const Logintestpage: React.FC = () => {
	const [error, setError] = useState<string | null>(null);

	const { login, loading } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();
	const location = useLocation();

	const state = (location.state || {}) as LocationState;
	const selectedSeats = state.selectedSeats || [];
	const fromPath =
		typeof state.from === 'string'
			? state.from
			: state.from?.pathname || '/';

	const handleLogin = async ({ email, password }: { email: string; password: string }) => {
		setError(null);
		try {
			await login(email, password);
			showToast('Login successful!', 'success');
			navigate(fromPath, { state: { selectedSeats }, replace: true });
		} catch (err: any) {
			setError(err.message || 'Invalid email or password');
		}
	};

	return (
		<div className="auth-page-container">
			<div className="auth-body">
				<Login loading={loading} error={error} onLogin={handleLogin} />
			</div>
		</div>
	);
};

