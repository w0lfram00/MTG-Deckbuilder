import dotenv from 'dotenv';

dotenv.config();

export function getEnv(name: string, defaultValue?: any): string {
	const value = process.env[name];
	if (value) return value;
	if (defaultValue) return String(defaultValue);
	throw new Error(`Missing: process.env['${name}'].`);
}
