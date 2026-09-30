import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormModal } from '@/common/hooks/useFormModal';

const mockSuccess = jest.fn();
const mockError = jest.fn();

jest.mock('@/common/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    loading: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

describe('useFormModal', () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with default state', () => {
    const { result } = renderHook(() => useFormModal({
      onSubmit: async () => {},
      onClose,
    }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call onSubmit and show success', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useFormModal({
      onSubmit,
      onSuccess,
      onClose,
      successMessage: 'Fatto!',
    }));

    await act(async () => {
      await result.current.handleSubmit({ name: 'test' });
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'test' });
    expect(mockSuccess).toHaveBeenCalledWith('Fatto!');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show error on failure', async () => {
    const onSubmit = jest.fn().mockRejectedValue({});

    const { result } = renderHook(() => useFormModal({
      onSubmit,
      onClose,
      errorMessage: 'Ops!',
    }));

    await act(async () => {
      await result.current.handleSubmit({});
    });

    expect(mockError).toHaveBeenCalledWith('Ops!');
    expect(result.current.error).toBe('Ops!');
    expect(result.current.isLoading).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should extract error message when no custom errorMessage', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Errore DB'));

    const { result } = renderHook(() => useFormModal({
      onSubmit,
      onClose,
    }));

    await act(async () => {
      await result.current.handleSubmit({});
    });

    expect(mockError).toHaveBeenCalledWith('Errore DB');
    expect(result.current.error).toBe('Errore DB');
  });

  it('should not close while loading', async () => {
    const onSubmit = jest.fn(() => new Promise(() => {}));

    const { result } = renderHook(() => useFormModal({
      onSubmit,
      onClose,
    }));

    act(() => {
      result.current.handleSubmit({});
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    act(() => {
      result.current.handleClose();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close when not loading', () => {
    const { result } = renderHook(() => useFormModal({
      onSubmit: async () => {},
      onClose,
    }));

    act(() => {
      result.current.handleClose();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useFormModal({
      onSubmit: async () => {},
      onClose,
    }));

    act(() => {
      result.current.resetState();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
