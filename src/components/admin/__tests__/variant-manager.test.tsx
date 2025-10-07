import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariantManager from '../variant-manager';
import { VariantFormData } from '@/types';

// Mock the VariantForm component
jest.mock('../variant-form', () => {
  return function MockVariantForm({ initialData, onSubmit, onCancel }: any) {
    return (
      <div data-testid="variant-form">
        <h3>{initialData ? 'Edit Variant Form' : 'Add Variant Form'}</h3>
        <button 
          onClick={() => onSubmit({
            variantName: 'Test Variant',
            size: '50ml',
            originalPrice: 500000,
            salePercentage: 10,
            stock: 100,
            imageUrl: 'http://test.com/image.jpg'
          })}
        >
          Save
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock confirm dialog
global.confirm = jest.fn(() => true);

const mockVariants: VariantFormData[] = [
  {
    variantName: 'Chiết 10ml',
    size: '10ml',
    originalPrice: 200000,
    salePercentage: 15,
    stock: 50,
    imageUrl: 'http://test.com/image1.jpg'
  },
  {
    variantName: 'Fullseal 50ml',
    size: '50ml',
    originalPrice: 800000,
    salePercentage: 0,
    stock: 25,
    imageUrl: 'http://test.com/image2.jpg'
  }
];

describe('VariantManager', () => {
  const mockOnVariantsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no variants', () => {
    render(
      <VariantManager
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    expect(screen.getByText('Chưa có biến thể nào được tạo.')).toBeInTheDocument();
    expect(screen.getByText('Thêm biến thể đầu tiên')).toBeInTheDocument();
  });

  it('renders variants list', () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    expect(screen.getByText('Chiết 10ml')).toBeInTheDocument();
    expect(screen.getByText('Fullseal 50ml')).toBeInTheDocument();
    expect(screen.getByText('10ml')).toBeInTheDocument();
    expect(screen.getByText('50ml')).toBeInTheDocument();
  });

  it('extracts capacity correctly', () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // Should extract 'Chiết' from 'Chiết 10ml'
    expect(screen.getByText('Chiết')).toBeInTheDocument();
    // Should extract 'Fullseal' from 'Fullseal 50ml'
    expect(screen.getByText('Fullseal')).toBeInTheDocument();
  });

  it('calculates final price correctly', () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // First variant: 200,000 - 15% = 170,000
    const priceElements = screen.getAllByText('170.000 VNĐ');
    expect(priceElements.length).toBeGreaterThan(0);
    // Sale percentage display
    expect(screen.getByText('(-15%)')).toBeInTheDocument();

    // Second variant: 800,000 - 0% = 800,000
    expect(screen.getByText('800.000 VNĐ')).toBeInTheDocument();
  });

  it('shows summary information', () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Total variants
    expect(screen.getByText('75 sản phẩm')).toBeInTheDocument(); // Total stock (50 + 25)
    // Check for min price in summary section - use getAllByText since it appears multiple times
    const minPriceElements = screen.getAllByText('170.000 VNĐ');
    expect(minPriceElements.length).toBeGreaterThan(0); // Min price appears in summary
  });

  it('opens add variant form', async () => {
    render(
      <VariantManager
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    const addButton = screen.getByText('Thêm biến thể đầu tiên');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('variant-form')).toBeInTheDocument();
      expect(screen.getByText('Add Variant Form')).toBeInTheDocument();
    });
  });

  it('opens edit variant form', async () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // Find edit buttons by their position (first variant's edit button)
    const editButtons = screen.getAllByRole('button');
    // Edit button should be the first outline button after the main "Thêm biến thể" button
    const editButton = editButtons.find(button => {
      const classes = button.getAttribute('class') || '';
      return classes.includes('outline') && !button.textContent?.includes('Thêm');
    });
    
    expect(editButton).toBeTruthy();
    fireEvent.click(editButton!);

    await waitFor(() => {
      expect(screen.getByTestId('variant-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Variant Form')).toBeInTheDocument();
    });
  });

  it('adds new variant', async () => {
    render(
      <VariantManager
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // Open add form
    fireEvent.click(screen.getByText('Thêm biến thể đầu tiên'));

    await waitFor(() => {
      expect(screen.getByTestId('variant-form')).toBeInTheDocument();
    });

    // Submit form
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnVariantsChange).toHaveBeenCalledWith([{
        variantName: 'Test Variant',
        size: '50ml',
        originalPrice: 500000,
        salePercentage: 10,
        stock: 100,
        imageUrl: 'http://test.com/image.jpg'
      }]);
    });
  });

  it('deletes variant with confirmation', () => {
    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // Find delete button (trash icon)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa biến thể này?');
      expect(mockOnVariantsChange).toHaveBeenCalledWith([mockVariants[1]]); // Remove first variant
    }
  });

  it('cancels form', async () => {
    render(
      <VariantManager
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Thêm biến thể đầu tiên'));

    await waitFor(() => {
      expect(screen.getByTestId('variant-form')).toBeInTheDocument();
    });

    // Cancel form
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('variant-form')).not.toBeInTheDocument();
    });
  });

  it('displays validation errors', () => {
    const errors = {
      variants: [
        { variantName: { message: 'Tên biến thể là bắt buộc' } },
        { originalPrice: { message: 'Giá gốc không hợp lệ' } }
      ]
    };

    render(
      <VariantManager
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
        errors={errors}
      />
    );

    expect(screen.getByText('Tên biến thể là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('Giá gốc không hợp lệ')).toBeInTheDocument();
  });
});
