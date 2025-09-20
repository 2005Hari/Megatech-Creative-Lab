import type { User } from '../types';

// In a real application, this would come from a secure backend.
const employeeCredentials = {
  'jatin@megatech.com': 'simran12',
  'hari@megatech.com': '#hari@2205',
};

const SESSION_KEY = 'megatech_creative_lab_user';

export const login = (email: string, password: string): User | null => {
  const normalizedEmail = email.toLowerCase().trim();
  if (employeeCredentials[normalizedEmail] && employeeCredentials[normalizedEmail] === password) {
    const user: User = { email: normalizedEmail };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
        console.error("Could not save user to sessionStorage", e);
        return null;
    }
  }
  return null;
};

export const logout = (): void => {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch(e) {
        console.error("Could not remove user from sessionStorage", e);
    }
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(SESSION_KEY);
        if (userJson) {
            return JSON.parse(userJson);
        }
        return null;
    } catch (e) {
        console.error("Could not retrieve user from sessionStorage", e);
        return null;
    }
};
