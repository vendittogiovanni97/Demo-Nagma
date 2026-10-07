import { artistPercentToStore, studioPercentFromStored } from '@/modules/booking/utils/percentuale';

describe('percentuale studio/artista', () => {
  it('converte la % artista salvata nella % studio mostrata', () => {
    expect(studioPercentFromStored({ percentualeMode: '70' }, 1000)).toBe('30');
    expect(studioPercentFromStored({ percentualeMode: 100 }, 1000)).toBe('0');
  });

  it('legge la vecchia chiave artistPercentage', () => {
    expect(studioPercentFromStored({ artistPercentage: '60' }, 500)).toBe('40');
  });

  it('ricava la % studio dai dati legacy "custom"', () => {
    expect(studioPercentFromStored({ percentualeMode: 'custom', artistPrice: 700 }, 1000)).toBe('30');
    expect(studioPercentFromStored({ percentualeMode: 'custom', artistPrice: 0 }, 0)).toBe('100');
  });

  it('usa il 50% quando non c\'è nulla di salvato o il valore non è numerico', () => {
    expect(studioPercentFromStored({}, 1000)).toBe('50');
    expect(studioPercentFromStored(null, 1000)).toBe('50');
    expect(studioPercentFromStored({ percentualeMode: 'abc' }, 1000)).toBe('50');
  });

  it('salva sempre la % artista', () => {
    expect(artistPercentToStore('30')).toBe('70');
    expect(artistPercentToStore(0)).toBe('100');
    expect(artistPercentToStore('100')).toBe('0');
  });

  it('riaprire e risalvare una prenotazione non cambia la quota artista', () => {
    const salvato = { percentualeMode: '70', artistPrice: 700 };
    const studio = studioPercentFromStored(salvato, 1000);
    expect(artistPercentToStore(studio)).toBe('70');
  });
});
