import { renderHook, act } from '@testing-library/react';
import { useFilters } from '@/hooks/useFilters';
import { Pet } from '@/types/pets';

const mockPets = [
  { id: '1', name: 'Thor', type: 'dog', size: 'large' },
  { id: '2', name: 'Luna', type: 'cat', size: 'small' },
  { id: '3', name: 'Bob', type: 'dog', size: 'medium' },
] as Pet[];

describe('useFilters Hook', () => {
  it('should return all pets initially', () => {
    const { result } = renderHook(() => useFilters(mockPets));
    expect(result.current.filteredPets).toHaveLength(3);
    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.animalType).toBe('all');
    expect(result.current.filters.size).toBe('all');
  });

  it('should filter pets by name search', () => {
    const { result } = renderHook(() => useFilters(mockPets));

    act(() => {
      result.current.updateFilter('search', 'Thor');
    });

    expect(result.current.filteredPets).toHaveLength(1);
    expect(result.current.filteredPets[0].name).toBe('Thor');
  });

  it('should filter pets by animal type', () => {
    const { result } = renderHook(() => useFilters(mockPets));

    act(() => {
      result.current.updateFilter('animalType', 'cat');
    });

    expect(result.current.filteredPets).toHaveLength(1);
    expect(result.current.filteredPets[0].type).toBe('cat');
  });

  it('should filter pets by size', () => {
    const { result } = renderHook(() => useFilters(mockPets));

    act(() => {
      result.current.updateFilter('size', 'medium');
    });

    expect(result.current.filteredPets).toHaveLength(1);
    expect(result.current.filteredPets[0].size).toBe('medium');
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useFilters(mockPets));

    act(() => {
      result.current.updateFilter('animalType', 'dog');
      result.current.updateFilter('size', 'large');
    });

    expect(result.current.filteredPets).toHaveLength(1);
    expect(result.current.filteredPets[0].name).toBe('Thor');
  });

  it('should handle case insensitive search', () => {
    const { result } = renderHook(() => useFilters(mockPets));

    act(() => {
      result.current.updateFilter('search', 'luna');
    });

    expect(result.current.filteredPets).toHaveLength(1);
    expect(result.current.filteredPets[0].name).toBe('Luna');
  });
});
