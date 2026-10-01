import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { VolumeSlider } from './VolumeSlider';

jest.mock('axios');

describe('VolumeSlider', () => {
  const mockDeviceId = 'test-device-id';

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        success: true,
        volume: 75,
        description: 'Alto'
      }
    });
    axios.post.mockResolvedValue({
      data: {
        success: true,
        volume: 75,
        description: 'Alto'
      }
    });
  });

  describe('Rendering', () => {
    test('should render volume slider component', () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);
      expect(screen.getByText('Control de Volumen')).toBeInTheDocument();
    });

    test('should display initial volume badge', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);
      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    test('should render volume slider input', () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
    });

    test('should render 4 preset buttons', () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);
      expect(screen.getByRole('button', { name: /25%/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /50%/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /75%/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /100%/ })).toBeInTheDocument();
    });
  });

  describe('Volume Fetching', () => {
    test('should fetch volume on component mount', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`/api/v1/devices/${mockDeviceId}/volume`);
      });
    });

    test('should set volume from API response', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          volume: 50,
          description: 'Medio'
        }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByText('Medio')).toBeInTheDocument();
      });
    });

    test('should handle API fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching volume:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Volume Descriptions', () => {
    test('should show "Silencio" for 0% volume', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 0, description: 'Silencio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Silencio')).toBeInTheDocument();
      });
    });

    test('should show "Muy bajo" for volume < 20', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 15, description: 'Muy bajo' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Muy bajo')).toBeInTheDocument();
      });
    });

    test('should show "Bajo" for volume 20-39', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 30, description: 'Bajo' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Bajo')).toBeInTheDocument();
      });
    });

    test('should show "Medio" for volume 40-59', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 50, description: 'Medio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Medio')).toBeInTheDocument();
      });
    });

    test('should show "Alto" for volume 60-79', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 70, description: 'Alto' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Alto')).toBeInTheDocument();
      });
    });

    test('should show "Muy alto" for volume >= 80', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 90, description: 'Muy alto' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('Muy alto')).toBeInTheDocument();
      });
    });
  });

  describe('Volume Icons', () => {
    test('should show mute icon (🔇) for 0% volume', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 0, description: 'Silencio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('🔇')).toBeInTheDocument();
      });
    });

    test('should show low volume icon (🔈) for volume < 30', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 20, description: 'Muy bajo' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('🔈')).toBeInTheDocument();
      });
    });

    test('should show medium volume icon (🔉) for volume 30-69', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 50, description: 'Medio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('🔉')).toBeInTheDocument();
      });
    });

    test('should show high volume icon (🔊) for volume >= 70', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 85, description: 'Muy alto' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('🔊')).toBeInTheDocument();
      });
    });
  });

  describe('Slider Interaction', () => {
    test('should change volume when slider is moved', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 50 }
        );
      });
    });

    test('should disable slider while loading', async () => {
      axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      await waitFor(() => {
        expect(slider).toBeDisabled();
      });
    });

    test('should update lastVolume when volume > 0', async () => {
      axios.post.mockResolvedValueOnce({
        data: { success: true, volume: 50, description: 'Medio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      // Change to 0 (mute)
      fireEvent.change(slider, { target: { value: '0' } });

      // Should have lastVolume = 50 stored
      const unmuteButton = await screen.findByRole('button', { name: /Dessilenciar/ });
      fireEvent.click(unmuteButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 50 }
        );
      });
    });
  });

  describe('Preset Buttons', () => {
    test('should set volume to 25% when 25% button is clicked', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const button25 = screen.getByRole('button', { name: /25%/ });
      fireEvent.click(button25);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 25 }
        );
      });
    });

    test('should set volume to 50% when 50% button is clicked', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const button50 = screen.getByRole('button', { name: /50%/ });
      fireEvent.click(button50);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 50 }
        );
      });
    });

    test('should set volume to 75% when 75% button is clicked', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const button75 = screen.getByRole('button', { name: /75%/ });
      fireEvent.click(button75);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 75 }
        );
      });
    });

    test('should set volume to 100% when 100% button is clicked', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const button100 = screen.getByRole('button', { name: /100%/ });
      fireEvent.click(button100);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 100 }
        );
      });
    });

    test('should highlight active preset button', async () => {
      axios.post.mockResolvedValueOnce({
        data: { success: true, volume: 50, description: 'Medio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      const button50 = screen.getByRole('button', { name: /50%/ });
      fireEvent.click(button50);

      await waitFor(() => {
        expect(button50).toHaveClass('active');
      });
    });
  });

  describe('Mute/Unmute', () => {
    test('should show Silenciar button when volume > 0', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Silenciar/ })).toBeInTheDocument();
      });
    });

    test('should show Dessilenciar button when volume = 0', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 0, description: 'Silencio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Dessilenciar/ })).toBeInTheDocument();
      });
    });

    test('should mute device when Silenciar button is clicked', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const muteButton = screen.getByRole('button', { name: /Silenciar/ });
      fireEvent.click(muteButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 0 }
        );
      });
    });

    test('should unmute device when Dessilenciar button is clicked', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 0, description: 'Silencio' }
      });

      axios.post.mockResolvedValueOnce({
        data: { success: true, volume: 75, description: 'Alto' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Dessilenciar/ })).toBeInTheDocument();
      });

      const unmuteButton = screen.getByRole('button', { name: /Dessilenciar/ });
      fireEvent.click(unmuteButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`,
          { volume: 75 }
        );
      });
    });

    test('should fetch volume after muting', async () => {
      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      jest.clearAllMocks();

      const muteButton = screen.getByRole('button', { name: /Silenciar/ });
      fireEvent.click(muteButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`
        );
      });
    });

    test('should fetch volume after unmuting', async () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, volume: 0, description: 'Silencio' }
      });

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Dessilenciar/ })).toBeInTheDocument();
      });

      jest.clearAllMocks();

      const unmuteButton = screen.getByRole('button', { name: /Dessilenciar/ });
      fireEvent.click(unmuteButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          `/api/v1/devices/${mockDeviceId}/volume`
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle volume change errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error setting volume:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('should handle mute errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const muteButton = screen.getByRole('button', { name: /Silenciar/ });
      fireEvent.click(muteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error muting:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('should re-enable buttons after error', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      render(<VolumeSlider deviceId={mockDeviceId} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      await waitFor(() => {
        expect(slider).not.toBeDisabled();
      });
    });
  });

  describe('Default Props', () => {
    test('should use default deviceId if not provided', () => {
      render(<VolumeSlider />);

      expect(axios.get).toHaveBeenCalledWith('/api/v1/devices/sky-l-90-up-left/volume');
    });
  });
});
