import { renderHook, act } from '@testing-library/react';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';

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

describe('useDeleteConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with no pending confirmation', () => {
    const { result } = renderHook(() => useDeleteConfirm());
    expect(result.current.confirmDialogProps.isOpen).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });

  it('should open confirmation dialog on deleteItem', async () => {
    const { result } = renderHook(() => useDeleteConfirm());

    await act(async () => {
      result.current.deleteItem({
        confirmMessage: 'Sei sicuro?',
        action: async () => {},
        successMessage: 'Eliminato!',
      });
    });

    expect(result.current.confirmDialogProps.isOpen).toBe(true);
    expect(result.current.confirmDialogProps.message).toBe('Sei sicuro?');
  });

  it('should close dialog on cancel', async () => {
    const { result } = renderHook(() => useDeleteConfirm());

    await act(async () => {
      result.current.deleteItem({
        confirmMessage: 'Sei sicuro?',
        action: async () => {},
        successMessage: 'Eliminato!',
      });
    });

    act(() => {
      result.current.confirmDialogProps.onCancel();
    });

    expect(result.current.confirmDialogProps.isOpen).toBe(false);
  });

  it('should execute action and show success on confirm', async () => {
    const action = jest.fn().mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteConfirm());

    await act(async () => {
      result.current.deleteItem({
        confirmMessage: 'Sei sicuro?',
        action,
        successMessage: 'Eliminato!',
        onSuccess,
      });
    });

    await act(async () => {
      await result.current.confirmDialogProps.onConfirm();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith('Eliminato!');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it('should show error message on failure', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Errore DB'));
    const { result } = renderHook(() => useDeleteConfirm());

    await act(async () => {
      result.current.deleteItem({
        confirmMessage: 'Sei sicuro?',
        action,
        successMessage: 'Eliminato!',
      });
    });

    await act(async () => {
      await result.current.confirmDialogProps.onConfirm();
    });

    expect(mockError).toHaveBeenCalledWith('Errore DB');
    expect(result.current.isDeleting).toBe(false);
  });
});
