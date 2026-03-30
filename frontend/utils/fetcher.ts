export const fetcher = async (url: string) => {
  const res = await fetch(`http://localhost:3001${url}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante la fetch dei dati');
  }
  return res.json();
};
