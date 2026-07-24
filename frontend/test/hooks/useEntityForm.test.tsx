import { act, renderHook, waitFor } from '@testing-library/react';
import { useEntityForm } from '@/common/hooks/useEntityForm';

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

interface Entity {
  id: number;
  name: string;
}

interface FormData {
  name: string;
}

describe('useEntityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sincronizza il form quando si apre con una nuova entità', async () => {
    const persist = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ entity, open }: { entity: Entity | null; open: boolean }) =>
        useEntityForm<Entity, FormData>({
          entity,
          open,
          initial: (current) => ({ name: current?.name ?? '' }),
          buildPayload: (data) => data,
          persist,
        }),
      { initialProps: { entity: null, open: false } },
    );

    rerender({ entity: { id: 1, name: 'Mario' }, open: true });

    await waitFor(() => expect(result.current.formData.name).toBe('Mario'));
    expect(result.current.isDirty).toBe(false);

    act(() => result.current.setField('name', 'Luigi'));
    expect(result.current.formData.name).toBe('Luigi');
    expect(result.current.isDirty).toBe(true);
  });

  it('invia lo stesso stato mostrato dal form e inoltra il risultato', async () => {
    const persist = jest.fn().mockResolvedValue({ id: 7 });
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useEntityForm<never, FormData, { normalizedName: string }, { id: number }>({
        entity: null,
        open: true,
        initial: () => ({ name: '' }),
        buildPayload: (data) => ({ normalizedName: data.name.trim() }),
        persist,
        onSuccess,
      }),
    );

    act(() => result.current.setField('name', '  Anna  '));
    await act(async () => result.current.handleSubmit());

    expect(persist).toHaveBeenCalledWith({ normalizedName: 'Anna' }, null);
    expect(onSuccess).toHaveBeenCalledWith({ id: 7 });
  });

  it('blocca la persistenza quando la validazione fallisce', async () => {
    const persist = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useEntityForm<never, FormData>({
        entity: null,
        open: true,
        initial: () => ({ name: '' }),
        buildPayload: (data) => data,
        persist,
        validate: (data) => data.name ? null : 'Nome obbligatorio',
      }),
    );

    await act(async () => result.current.handleSubmit());

    expect(persist).not.toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledWith('Nome obbligatorio');
    expect(result.current.error).toBe('Nome obbligatorio');
  });
});
