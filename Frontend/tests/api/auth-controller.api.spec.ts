import { expect, test } from '@playwright/test';

type UserResponse = {
	id: string;
	email: string;
	name: string;
	isAdmin: boolean;
};

type AuthResponse = {
	token: string;
	user: UserResponse;
};

const TEST_PASSWORD = 'playwright123';

function buildUserIdentity(prefix: string) {
	const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	return {
		name: `${prefix} ${suffix}`,
		email: `playwright.auth.${suffix}@cinepass.test`,
	};
}

test.describe('Auth controller API contract tests', () => {
	test('POST /api/auth/register returns token and created user payload', async ({ request }) => {
		const identity = buildUserIdentity('Register User');

		const registerResponse = await request.post('/api/auth/register', {
			data: {
				name: identity.name,
				email: identity.email,
				password: TEST_PASSWORD,
			},
		});

		expect(registerResponse.status()).toBe(200);
		const registerBody = (await registerResponse.json()) as AuthResponse;

		expect(registerBody.token).toBeTruthy();
		expect(registerBody.user.id).toBeTruthy();
		expect(registerBody.user.email).toBe(identity.email);
		expect(registerBody.user.name).toBe(identity.name);
		expect(registerBody.user.isAdmin).toBe(false);
	});

	test('POST /api/auth/login authenticates seeded admin user', async ({ request }) => {
		const loginResponse = await request.post('/api/auth/login', {
			data: {
				email: 'admin@cinepass.com',
				password: 'admin123',
			},
		});

		expect(loginResponse.status()).toBe(200);
		const loginBody = (await loginResponse.json()) as AuthResponse;

		expect(loginBody.token).toBeTruthy();
		expect(loginBody.user.id).toBeTruthy();
		expect(loginBody.user.email).toBe('admin@cinepass.com');
		expect(loginBody.user.isAdmin).toBe(true);
	});

	test('POST /api/auth/login works for a newly registered user', async ({ request }) => {
		const identity = buildUserIdentity('Login User');

		const registerResponse = await request.post('/api/auth/register', {
			data: {
				name: identity.name,
				email: identity.email,
				password: TEST_PASSWORD,
			},
		});
		expect(registerResponse.status()).toBe(200);

		const loginResponse = await request.post('/api/auth/login', {
			data: {
				email: identity.email,
				password: TEST_PASSWORD,
			},
		});

		expect(loginResponse.status()).toBe(200);
		const loginBody = (await loginResponse.json()) as AuthResponse;

		expect(loginBody.token).toBeTruthy();
		expect(loginBody.user.email).toBe(identity.email);
		expect(loginBody.user.name).toBe(identity.name);
		expect(loginBody.user.isAdmin).toBe(false);
	});
});
