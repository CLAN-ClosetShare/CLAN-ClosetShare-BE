import * as argon2 from 'argon2';

const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(password);
  } catch (err) {
    console.error('Error hashing password:', err);
    throw new Error('Cannot hash password');
  }
};

const verifyPassword = async ({
  hashedPassword,
  password,
}: {
  password: string;
  hashedPassword: string;
}): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (err) {
    console.error('Error verifying password:', err);
    throw new Error('Cannot verify password');
  }
};

export { hashPassword, verifyPassword };
