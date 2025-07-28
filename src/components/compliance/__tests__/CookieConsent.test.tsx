import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CookieConsent, { useCookieConsent } from '../CookieConsent';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render banner when no consent exists', () => {
    render(<CookieConsent />);
    
    expect(screen.getByText('Cookie Consent')).toBeInTheDocument();
    expect(screen.getByText(/We use cookies to enhance your experience/)).toBeInTheDocument();
  });

  it('should not render banner when consent exists', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'shopmatic_cookie_consent') {
        return 'true';
      }
      return null;
    });

    render(<CookieConsent />);
    
    expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
  });

  it('should handle accept all cookies', async () => {
    render(<CookieConsent />);
    
    const acceptAllButton = screen.getByText('Accept All');
    fireEvent.click(acceptAllButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_cookie_consent',
        'true'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_cookie_preferences',
        expect.stringContaining('analytics":true')
      );
    });
  });

  it('should handle essential only cookies', async () => {
    render(<CookieConsent />);
    
    const essentialButton = screen.getByText('Essential Only');
    fireEvent.click(essentialButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_cookie_consent',
        'true'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_cookie_preferences',
        expect.stringContaining('analytics":false')
      );
    });
  });

  it('should open customization dialog', () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText('Customize');
    fireEvent.click(customizeButton);
    
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
  });

  it('should handle custom preferences', async () => {
    render(<CookieConsent />);
    
    // Open customization dialog
    const customizeButton = screen.getByText('Customize');
    fireEvent.click(customizeButton);
    
    // Toggle analytics checkbox
    const analyticsCheckbox = screen.getByRole('checkbox', { name: /analytics/i });
    fireEvent.click(analyticsCheckbox);
    
    // Save preferences
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shopmatic_cookie_consent',
        'true'
      );
    });
  });

  it('should not allow disabling essential cookies', () => {
    render(<CookieConsent />);
    
    // Open customization dialog
    const customizeButton = screen.getByText('Customize');
    fireEvent.click(customizeButton);
    
    // Essential cookies checkbox should be disabled
    const essentialCheckbox = screen.getByRole('checkbox', { name: /essential/i });
    expect(essentialCheckbox).toBeDisabled();
    expect(essentialCheckbox).toBeChecked();
  });
});

describe('useCookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should return default state when no consent exists', () => {
    const TestComponent = () => {
      const { hasConsent, preferences } = useCookieConsent();
      return (
        <div>
          <span data-testid="consent">{hasConsent ? 'true' : 'false'}</span>
          <span data-testid="analytics">{preferences.analytics ? 'true' : 'false'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('consent')).toHaveTextContent('false');
    expect(screen.getByTestId('analytics')).toHaveTextContent('false');
  });

  it('should return consent state when exists', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'shopmatic_cookie_consent') {
        return 'true';
      }
      if (key === 'shopmatic_cookie_preferences') {
        return JSON.stringify({
          essential: true,
          analytics: true,
          marketing: false,
          personalization: false
        });
      }
      return null;
    });

    const TestComponent = () => {
      const { hasConsent, preferences } = useCookieConsent();
      return (
        <div>
          <span data-testid="consent">{hasConsent ? 'true' : 'false'}</span>
          <span data-testid="analytics">{preferences.analytics ? 'true' : 'false'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('consent')).toHaveTextContent('true');
    expect(screen.getByTestId('analytics')).toHaveTextContent('true');
  });

  it('should handle corrupt preferences gracefully', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'shopmatic_cookie_consent') {
        return 'true';
      }
      if (key === 'shopmatic_cookie_preferences') {
        return 'invalid-json';
      }
      return null;
    });

    const TestComponent = () => {
      const { hasConsent, preferences } = useCookieConsent();
      return (
        <div>
          <span data-testid="consent">{hasConsent ? 'true' : 'false'}</span>
          <span data-testid="analytics">{preferences.analytics ? 'true' : 'false'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('consent')).toHaveTextContent('true');
    expect(screen.getByTestId('analytics')).toHaveTextContent('false');
  });
});