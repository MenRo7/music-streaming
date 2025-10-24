import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfileModal from '../../components/EditProfileModal';
import { updateUserProfile } from '../../apis/UserService';
import { UserProvider } from '../../contexts/UserContext';

jest.mock('../../apis/UserService');
const mockedUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>;

const mockRefreshUser = jest.fn();
jest.mock('../../contexts/UserContext', () => ({
  ...jest.requireActual('../../contexts/UserContext'),
  useUser: () => ({
    refreshUser: mockRefreshUser,
    user: { id: 1, name: 'Test User' },
  }),
}));

const renderComponent = (props: any) => {
  return render(
    <UserProvider>
      <EditProfileModal {...props} />
    </UserProvider>
  );
};

describe('EditProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnProfileUpdate = jest.fn();
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = renderComponent({
      isOpen: false,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    expect(screen.getByText(/modifier le profil/i)).toBeInTheDocument();
  });

  it('should display user name in input', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const nameInput = screen.getByLabelText(/nom d'utilisateur/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test User');
  });

  it('should update name when typing', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const nameInput = screen.getByLabelText(/nom d'utilisateur/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    expect(nameInput.value).toBe('Updated Name');
  });

  it('should render image upload input', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    expect(screen.getByLabelText(/image de profil/i)).toBeInTheDocument();
  });

  it('should handle image file selection', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
    const imageInput = screen.getByLabelText(/image de profil/i) as HTMLInputElement;

    fireEvent.change(imageInput, { target: { files: [file] } });

    expect(imageInput.files?.[0]).toBe(file);
  });

  it('should call updateUserProfile on form submit', async () => {
    mockedUpdateUserProfile.mockResolvedValue({
      data: { user: { ...mockUser, name: 'Updated Name' } },
    });

    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const nameInput = screen.getByLabelText(/nom d'utilisateur/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateUserProfile).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it('should call onProfileUpdate after successful update', async () => {
    const updatedUser = { ...mockUser, name: 'Updated Name' };
    mockedUpdateUserProfile.mockResolvedValue({ data: { user: updatedUser } });

    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnProfileUpdate).toHaveBeenCalledWith(updatedUser);
    });
  });

  it('should call refreshUser after successful update', async () => {
    mockedUpdateUserProfile.mockResolvedValue({
      data: { user: mockUser },
    });

    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('should close modal after successful update', async () => {
    mockedUpdateUserProfile.mockResolvedValue({
      data: { user: mockUser },
    });

    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message on update failure', async () => {
    mockedUpdateUserProfile.mockRejectedValue(new Error('Update failed'));

    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erreur lors de la mise à jour du profil/i)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render save and cancel buttons', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('should have required attribute on name input', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const nameInput = screen.getByLabelText(/nom d'utilisateur/i);
    expect(nameInput).toBeRequired();
  });

  it('should accept image/* file types', () => {
    renderComponent({
      isOpen: true,
      onClose: mockOnClose,
      user: mockUser,
      onProfileUpdate: mockOnProfileUpdate,
    });

    const imageInput = screen.getByLabelText(/image de profil/i);
    expect(imageInput).toHaveAttribute('accept', 'image/*');
  });
});
