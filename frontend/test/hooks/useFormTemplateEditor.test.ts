import { renderHook, act } from '@testing-library/react';
import { useFormTemplateEditor } from '@/modules/form-templates/hooks/useFormTemplateEditor';
import { formTemplateService } from '@/modules/form-templates/api/form-template.api';

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

jest.mock('@/modules/form-templates/api/form-template.api', () => ({
  formTemplateService: {
    delete: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('useFormTemplateEditor', () => {
  const onMutate = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete template and invoke onMutate without window.confirm', async () => {
    (formTemplateService.delete as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useFormTemplateEditor({ onMutate }));

    await act(async () => {
      await result.current.handleDelete(123);
    });

    expect(formTemplateService.delete).toHaveBeenCalledWith(123);
    expect(mockSuccess).toHaveBeenCalledWith('Template eliminato.');
    expect(onMutate).toHaveBeenCalledTimes(1);
  });

  it('should show toast error if deletion fails', async () => {
    (formTemplateService.delete as jest.Mock).mockRejectedValue(new Error('Cancellazione fallita'));

    const { result } = renderHook(() => useFormTemplateEditor({ onMutate }));

    await act(async () => {
      await result.current.handleDelete(123);
    });

    expect(mockError).toHaveBeenCalledWith('Cancellazione fallita');
    expect(onMutate).not.toHaveBeenCalled();
  });
});
