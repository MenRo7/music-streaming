import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEditPlaylistModal from '../../components/CreateEditPlaylistModal';
import { createPlaylist, updatePlaylist } from '../../apis/PlaylistService';

jest.mock('../../apis/PlaylistService');
const mockedCreatePlaylist = createPlaylist as jest.MockedFunction<typeof createPlaylist>;
const mockedUpdatePlaylist = updatePlaylist as jest.MockedFunction<typeof updatePlaylist>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderComponent = (props: any) => {
  return render(
    <BrowserRouter>
      <CreateEditPlaylistModal {...props} />
    </BrowserRouter>
  );
};

describe('CreateEditPlaylistModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should not render when isOpen is false', () => {
      const { container } = renderComponent({
        isOpen: false,
        onClose: mockOnClose,
        mode: 'create',
      });

      expect(container.firstChild).toBeNull();
    });

    it('should render create modal when isOpen is true', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      expect(screen.getByText(/créer une playlist/i)).toBeInTheDocument();
    });

    it('should render title input field', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    });

    it('should render image input field', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      expect(screen.getByLabelText(/image/i)).toBeInTheDocument();
    });

    it('should update title when typing', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const titleInput = screen.getByLabelText(/titre/i) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'My New Playlist' } });

      expect(titleInput.value).toBe('My New Playlist');
    });

    it('should call createPlaylist on form submit', async () => {
      mockedCreatePlaylist.mockResolvedValue({ playlist: { id: 1, title: 'New Playlist' } });

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const titleInput = screen.getByLabelText(/titre/i);
      fireEvent.change(titleInput, { target: { value: 'My New Playlist' } });

      const submitButton = screen.getByRole('button', { name: /créer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedCreatePlaylist).toHaveBeenCalledTimes(1);
      });
    });

    it('should close modal after successful creation', async () => {
      mockedCreatePlaylist.mockResolvedValue({ playlist: { id: 1, title: 'New Playlist' } });

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const titleInput = screen.getByLabelText(/titre/i);
      fireEvent.change(titleInput, { target: { value: 'My New Playlist' } });

      const submitButton = screen.getByRole('button', { name: /créer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not submit if title is empty', async () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const submitButton = screen.getByRole('button', { name: /créer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedCreatePlaylist).not.toHaveBeenCalled();
      });
    });

    it('should handle image file selection', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/image/i) as HTMLInputElement;

      fireEvent.change(imageInput, { target: { files: [file] } });

      expect(imageInput.files?.[0]).toBe(file);
    });

    it('should call onClose when cancel button is clicked', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle createPlaylist error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedCreatePlaylist.mockRejectedValue(new Error('Creation failed'));

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const titleInput = screen.getByLabelText(/titre/i);
      fireEvent.change(titleInput, { target: { value: 'My New Playlist' } });

      const submitButton = screen.getByRole('button', { name: /créer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edit Mode', () => {
    const initialData = { id: 1, title: 'Existing Playlist', image: 'existing.jpg' };

    it('should render edit modal with initial data', () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'edit',
        initialData,
      });

      expect(screen.getByText(/modifier la playlist/i)).toBeInTheDocument();
      const titleInput = screen.getByLabelText(/titre/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Existing Playlist');
    });

    it('should call updatePlaylist on form submit', async () => {
      mockedUpdatePlaylist.mockResolvedValue({ message: 'Updated' });

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'edit',
        initialData,
      });

      const titleInput = screen.getByLabelText(/titre/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Playlist' } });

      const submitButton = screen.getByRole('button', { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedUpdatePlaylist).toHaveBeenCalledWith(1, expect.any(FormData));
      });
    });

    it('should close modal after successful update', async () => {
      mockedUpdatePlaylist.mockResolvedValue({ message: 'Updated' });

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'edit',
        initialData,
      });

      const submitButton = screen.getByRole('button', { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should reset form when reopened', () => {
      const { rerender } = renderComponent({
        isOpen: false,
        onClose: mockOnClose,
        mode: 'edit',
        initialData,
      });

      rerender(
        <BrowserRouter>
          <CreateEditPlaylistModal
            isOpen={true}
            onClose={mockOnClose}
            mode="edit"
            initialData={initialData}
          />
        </BrowserRouter>
      );

      const titleInput = screen.getByLabelText(/titre/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Existing Playlist');
    });

    it('should handle updatePlaylist error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedUpdatePlaylist.mockRejectedValue(new Error('Update failed'));

      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'edit',
        initialData,
      });

      const submitButton = screen.getByRole('button', { name: /enregistrer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should not submit with whitespace-only title', async () => {
      renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const titleInput = screen.getByLabelText(/titre/i);
      fireEvent.change(titleInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /créer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedCreatePlaylist).not.toHaveBeenCalled();
      });
    });
  });

  describe('Modal Overlay', () => {
    it('should render modal overlay when open', () => {
      const { container } = renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const overlay = container.querySelector('.modal-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should render modal content when open', () => {
      const { container } = renderComponent({
        isOpen: true,
        onClose: mockOnClose,
        mode: 'create',
      });

      const content = container.querySelector('.modal-content');
      expect(content).toBeInTheDocument();
    });
  });
});
