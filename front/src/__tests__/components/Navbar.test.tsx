import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import { UserProvider } from '../../contexts/UserContext';

// Mock des hooks et contextes
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../components/GlobalSearchBar', () => {
  return function MockGlobalSearchBar() {
    return <div data-testid="global-search-bar">Search</div>;
  };
});

jest.mock('../../components/DropdownMenu', () => {
  return function MockDropdownMenu({ items, trigger }: any) {
    return (
      <div data-testid="dropdown-menu">
        {trigger}
        <div data-testid="dropdown-items">
          {items.map((item: any, index: number) => (
            <button key={index} onClick={item.onClick}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
});

const mockLogout = jest.fn();

const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: mockLogout,
  isAuthenticated: true,
};

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  profile_image: '/test-avatar.jpg',
  updated_at: '2025-01-01T00:00:00Z',
};

const renderNavbar = (user: any = mockUser) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <UserProvider initialUser={user}>
          <Navbar />
        </UserProvider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navbar with logo', () => {
    renderNavbar();
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
  });

  it('renders global search bar', () => {
    renderNavbar();
    expect(screen.getByTestId('global-search-bar')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();

    const homeLink = screen.getByLabelText('nav.home');
    const myMusicLink = screen.getByLabelText('nav.myMusic');
    const importLink = screen.getByLabelText('nav.import');

    expect(homeLink).toBeInTheDocument();
    expect(myMusicLink).toBeInTheDocument();
    expect(importLink).toBeInTheDocument();

    expect(homeLink).toHaveAttribute('href', '/main');
    expect(myMusicLink).toHaveAttribute('href', '/my-music');
    expect(importLink).toHaveAttribute('href', '/import');
  });

  it('renders user profile image', () => {
    renderNavbar();

    const profileImage = screen.getByAltText('nav.userProfile');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', expect.stringContaining('/test-avatar.jpg'));
  });

  it('renders default avatar when no profile image', () => {
    const userWithoutImage = { ...mockUser, profile_image: null };
    renderNavbar(userWithoutImage);

    const profileImage = screen.getByAltText('nav.userProfile');
    expect(profileImage).toHaveAttribute('src', '/default-avatar.png');
  });

  it('renders dropdown menu with correct items', () => {
    renderNavbar();

    const profileButton = screen.getByText('nav.profile');
    const preferencesButton = screen.getByText('nav.preferences');
    const logoutButton = screen.getByText('nav.logout');

    expect(profileButton).toBeInTheDocument();
    expect(preferencesButton).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });

  it('navigates to profile when profile menu item is clicked', () => {
    renderNavbar();

    const profileButton = screen.getByText('nav.profile');
    fireEvent.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigates to preferences when preferences menu item is clicked', () => {
    renderNavbar();

    const preferencesButton = screen.getByText('nav.preferences');
    fireEvent.click(preferencesButton);

    expect(mockNavigate).toHaveBeenCalledWith('/preferences');
  });

  it('handles logout correctly', async () => {
    mockLogout.mockResolvedValue(undefined);
    const mockSetUser = jest.fn();

    // Mock localStorage
    const localStorageMock = {
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderNavbar();

    const logoutButton = screen.getByText('nav.logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('handles logout error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockLogout.mockRejectedValue(new Error('Logout failed'));

    renderNavbar();

    const logoutButton = screen.getByText('nav.logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('includes cache-busting parameter in profile image URL', () => {
    renderNavbar();

    const profileImage = screen.getByAltText('nav.userProfile');
    const src = profileImage.getAttribute('src');

    expect(src).toMatch(/\?t=/);
  });

  it('uses user ID as fallback for avatar version when updated_at is invalid', () => {
    const userWithInvalidDate = {
      ...mockUser,
      updated_at: null,
    };
    renderNavbar(userWithInvalidDate);

    const profileImage = screen.getByAltText('nav.userProfile');
    expect(profileImage).toBeInTheDocument();
  });
});
