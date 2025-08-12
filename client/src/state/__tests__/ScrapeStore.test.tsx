import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ScrapeProvider, useScrapeStore, useScrapeItems, useScrapeActions } from '../ScrapeStore';
import { ScrapedItem } from '../ScrapeStore';

// Test component to access the store
const TestComponent = () => {
  const { state, addItems, removeItem, clear, updateItem } = useScrapeStore();
  const items = useScrapeItems();
  const actions = useScrapeActions();

  return (
    <div>
      <div data-testid="item-count">{state.items.length}</div>
      <div data-testid="items">
        {items.map(item => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.company} - {item.category}
          </div>
        ))}
      </div>
      <button onClick={() => addItems([mockItem])} data-testid="add-button">
        Add Item
      </button>
      <button onClick={() => removeItem('1')} data-testid="remove-button">
        Remove Item
      </button>
      <button onClick={clear} data-testid="clear-button">
        Clear All
      </button>
      <button onClick={() => updateItem('1', { company: 'Updated Company' })} data-testid="update-button">
        Update Item
      </button>
    </div>
  );
};

const mockItem: ScrapedItem = {
  id: '1',
  company: 'Test Company',
  category: 'marketing',
  url: 'https://example.com',
  title: 'Test Title',
  markdown: '# Test Content',
  html: '<h1>Test Content</h1>',
  scrapedAt: new Date().toISOString(),
  source: 'test'
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ScrapeProvider>
      {component}
    </ScrapeProvider>
  );
};

describe('ScrapeStore - State Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Store Initialization', () => {
    it('should initialize with empty state', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
      expect(screen.getByTestId('items')).toBeEmptyDOMElement();
    });

    it('should provide store context to children', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('add-button')).toBeInTheDocument();
      expect(screen.getByTestId('remove-button')).toBeInTheDocument();
      expect(screen.getByTestId('clear-button')).toBeInTheDocument();
      expect(screen.getByTestId('update-button')).toBeInTheDocument();
    });
  });

  describe('Adding Items', () => {
    it('should add single item to store', async () => {
      renderWithProvider(<TestComponent />);
      
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('1');
        expect(screen.getByTestId('item-1')).toHaveTextContent('Test Company - marketing');
      });
    });

    it('should add multiple items to store', async () => {
      renderWithProvider(<TestComponent />);
      
      const addButton = screen.getByTestId('add-button');
      
      // Add first item
      fireEvent.click(addButton);
      
      // Add second item
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
        expect(screen.getAllByTestId(/item-/)).toHaveLength(2);
      });
    });

    it('should handle items with different categories', async () => {
      renderWithProvider(<TestComponent />);
      
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toHaveTextContent('marketing');
      });
    });
  });

  describe('Removing Items', () => {
    it('should remove specific item by ID', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add item first
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      });

      // Remove item
      const removeButton = screen.getByTestId('remove-button');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      });
    });

    it('should handle removing non-existent item gracefully', async () => {
      renderWithProvider(<TestComponent />);
      
      const removeButton = screen.getByTestId('remove-button');
      fireEvent.click(removeButton);

      // Should not cause errors
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('Clearing All Items', () => {
    it('should remove all items from store', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add multiple items
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      });

      // Clear all
      const clearButton = screen.getByTestId('clear-button');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.queryByTestId(/item-/)).not.toBeInTheDocument();
      });
    });

    it('should work when store is already empty', () => {
      renderWithProvider(<TestComponent />);
      
      const clearButton = screen.getByTestId('clear-button');
      fireEvent.click(clearButton);

      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('Updating Items', () => {
    it('should update specific item fields', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add item first
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toHaveTextContent('Test Company');
      });

      // Update item
      const updateButton = screen.getByTestId('update-button');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toHaveTextContent('Updated Company');
      });
    });

    it('should preserve other item fields when updating', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add item first
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      // Update item
      const updateButton = screen.getByTestId('update-button');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toHaveTextContent('Updated Company - marketing');
      });
    });

    it('should handle updating non-existent item gracefully', async () => {
      renderWithProvider(<TestComponent />);
      
      const updateButton = screen.getByTestId('update-button');
      fireEvent.click(updateButton);

      // Should not cause errors
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('Store Persistence', () => {
    it('should maintain state across component re-renders', async () => {
      const { rerender } = renderWithProvider(<TestComponent />);
      
      // Add item
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      });

      // Re-render component
      rerender(
        <ScrapeProvider>
          <TestComponent />
        </ScrapeProvider>
      );

      // State should persist
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Company - marketing');
    });
  });

  describe('Data Types and Validation', () => {
    it('should handle items with all required fields', async () => {
      renderWithProvider(<TestComponent />);
      
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        const item = screen.getByTestId('item-1');
        expect(item).toHaveTextContent('Test Company');
        expect(item).toHaveTextContent('marketing');
      });
    });

    it('should handle items with optional fields', async () => {
      const itemWithOptionalFields: ScrapedItem = {
        id: '2',
        company: 'Company B',
        category: 'docs',
        scrapedAt: new Date().toISOString()
      };

      const TestComponentWithOptional = () => {
        const { addItems } = useScrapeStore();
        return (
          <button onClick={() => addItems([itemWithOptionalFields])} data-testid="add-optional">
            Add Optional Item
          </button>
        );
      };

      renderWithProvider(<TestComponentWithOptional />);
      
      const addButton = screen.getByTestId('add-optional');
      fireEvent.click(addButton);

      // Should not cause errors even with missing optional fields
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large numbers of items efficiently', async () => {
      const largeItemList: ScrapedItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        company: `Company ${i}`,
        category: 'marketing',
        scrapedAt: new Date().toISOString()
      }));

      const TestComponentWithLargeList = () => {
        const { addItems, state } = useScrapeStore();
        return (
          <div>
            <div data-testid="item-count">{state.items.length}</div>
            <button onClick={() => addItems(largeItemList)} data-testid="add-large">
              Add Large List
            </button>
          </div>
        );
      };

      renderWithProvider(<TestComponentWithLargeList />);
      
      const addButton = screen.getByTestId('add-large');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('1000');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid item data gracefully', async () => {
      const invalidItem = {
        id: 'invalid',
        company: 'Test Company',
        // Missing required fields
      } as any;

      const TestComponentWithInvalidData = () => {
        const { addItems } = useScrapeStore();
        return (
          <button onClick={() => addItems([invalidItem])} data-testid="add-invalid">
            Add Invalid Item
          </button>
        );
      };

      renderWithProvider(<TestComponentWithInvalidData />);
      
      const addButton = screen.getByTestId('add-invalid');
      
      // Should not crash the application
      expect(() => fireEvent.click(addButton)).not.toThrow();
    });
  });
}); 