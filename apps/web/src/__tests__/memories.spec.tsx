import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import MemoryEditor from '../features/memories/components/memory-editor';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Toast store
jest.mock('../store/toast-store', () => ({
  useToastStore: () => ({
    addToast: jest.fn(),
  }),
}));

describe('Memory Editor & Markdown Calculations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates character, word count and reading time correctly', () => {
    render(<MemoryEditor onSave={jest.fn()} />);
    
    const textarea = screen.getByPlaceholderText(/record your thoughts/i);
    
    // Type in description
    fireEvent.change(textarea, { target: { value: 'Hello world of Aurora-X' } });

    expect(screen.getByText('23 characters')).toBeInTheDocument();
    expect(screen.getByText('4 words')).toBeInTheDocument();
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('saves edits to local draft automatically', () => {
    jest.useFakeTimers();
    render(<MemoryEditor onSave={jest.fn()} />);

    const titleInput = screen.getByPlaceholderText(/give this moment a title/i);
    const textarea = screen.getByPlaceholderText(/record your thoughts/i);

    fireEvent.change(titleInput, { target: { value: 'My Summer Trip' } });
    fireEvent.change(textarea, { target: { value: 'Travel log details' } });

    // Fast-forward autosave timer (4 seconds)
    jest.advanceTimersByTime(4000);

    const savedDraft = JSON.parse(localStorage.getItem('aurora_memory_draft_new') || '{}');
    expect(savedDraft.title).toBe('My Summer Trip');
    expect(savedDraft.description).toBe('Travel log details');

    jest.useRealTimers();
  });
});
