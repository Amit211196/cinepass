import React, { useState } from 'react';
import { AlertTriangle, Lock, Mail } from 'lucide-react';

type LoginFormValues = {
	email: string;
	password: string;
};

type LoginProps = {
	loading?: boolean;
	error?: string | null;
	defaultEmail?: string;
	onLogin: (values: LoginFormValues) => Promise<void> | void;
};

export const Login: React.FC<LoginProps> = ({
	loading = false,
	error = null,
	defaultEmail = '',
	onLogin,
}) => {
	const [email, setEmail] = useState(defaultEmail);
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLocalError(null);

		if (!email.trim() || !password.trim()) {
			setLocalError('Please fill in all fields');
			return;
		}

		await onLogin({ email: email.trim(), password });
	};

	return (
		<div>
			<h2 className="auth-title">Welcome Back</h2>
			<p className="auth-subtitle">Sign in to your account to book movie tickets.</p>

			{(localError || error) && (
				<div className="auth-error">
					<AlertTriangle size={16} />
					<span>{localError || error}</span>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label className="form-label">Email Address</label>
					<div className="form-input-container">
						<Mail size={16} className="form-input-icon" />
						<input
							type="email"
							className="form-input"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="form-group">
					<label className="form-label">Password</label>
					<div className="form-input-container">
						<Lock size={16} className="form-input-icon" />
						<input
							type="password"
							className="form-input"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
				</div>

				<button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
					{loading ? 'Signing In...' : 'Sign In'}
				</button>
			</form>

			<div
				style={{
					marginTop: '24px',
					textAlign: 'center',
					fontSize: '0.85rem',
					color: 'var(--color-text-muted)',
				}}
			>
				<p>
					Demo admin: <b>admin@cinepass.com</b> / <b>admin123</b>
				</p>
				<p>
					Demo user: <b>user@cinepass.com</b> / <b>user123</b>
				</p>
			</div>
		</div>
	);
};

