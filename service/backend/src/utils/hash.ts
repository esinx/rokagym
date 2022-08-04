import bcrypt from 'bcrypt'

export const hashPassword = async (plaintext: string) =>
	bcrypt.hash(plaintext, 10)
export const compareHash = async (plaintext: string, hashed: string) =>
	bcrypt.compare(plaintext, hashed)
