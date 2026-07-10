import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../features/auth/components/login-form';
import RegisterForm from '../features/auth/components/register-form';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Auth Context
const mockLogin = jest.fn();
const mockRegister = jest.fn();
jest.mock('../context/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
  }),
}));

describe('Auth Forms Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginForm', () => {
    it('should submit login credentials when valid', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText('name@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display error if fields are submitted empty', async () => {
      const { container } = render(<LoginForm />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      
      fireEvent.submit(form!);

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('RegisterForm', () => {
    it('should submit registration payload when valid', async () => {
      render(<RegisterForm />);

      const nameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('name@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(nameInput, { target: { value: 'John Smith' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password321' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password321', 'John Smith');
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
