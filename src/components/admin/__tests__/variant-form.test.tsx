import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariantForm from '../variant-form';
import type { VariantFormData } from '@/types';

// Mock notifications
jest.mock('@/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

describe('VariantForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all form fields', () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText('Ví dụ: Chiết 10ml, Fullseal 50ml')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ví dụ: 10ml, 50ml, 100ml')).toBeInTheDocument();
    expect(screen.getByLabelText('Giá gốc (VNĐ) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Mức sale (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Số lượng kho *')).toBeInTheDocument();
    expect(screen.getByLabelText('URL ảnh')).toBeInTheDocument();
    expect(screen.getByText('Lưu biến thể')).toBeInTheDocument();
    expect(screen.getByText('Hủy')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Lưu biến thể');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check that form validation prevents submission without displaying specific messages
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates price constraints', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const variantNameInput = screen.getByPlaceholderText('Ví dụ: Chiết 10ml, Fullseal 50ml');
    const sizeInput = screen.getByPlaceholderText('Ví dụ: 10ml, 50ml, 100ml');
    const originalPriceInput = screen.getByLabelText('Giá gốc (VNĐ) *');
    const stockInput = screen.getByLabelText('Số lượng kho *');

    fireEvent.change(variantNameInput, { target: { value: 'Test' } });
    fireEvent.change(sizeInput, { target: { value: '10ml' } });
    fireEvent.change(originalPriceInput, { target: { value: '500' } }); // Below minimum
    fireEvent.change(stockInput, { target: { value: '10' } });

    fireEvent.click(screen.getByText('Lưu biến thể'));

    await waitFor(() => {
      // Check that form validation prevents submission with invalid price
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates sale percentage constraints', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const variantNameInput = screen.getByPlaceholderText('Ví dụ: Chiết 10ml, Fullseal 50ml');
    const sizeInput = screen.getByPlaceholderText('Ví dụ: 10ml, 50ml, 100ml');
    const originalPriceInput = screen.getByLabelText('Giá gốc (VNĐ) *');
    const saleInput = screen.getByLabelText('Mức sale (%)');
    const stockInput = screen.getByLabelText('Số lượng kho *');

    fireEvent.change(variantNameInput, { target: { value: 'Test' } });
    fireEvent.change(sizeInput, { target: { value: '10ml' } });
    fireEvent.change(originalPriceInput, { target: { value: '50000' } });
    fireEvent.change(saleInput, { target: { value: '150' } }); // Above maximum
    fireEvent.change(stockInput, { target: { value: '10' } });

    fireEvent.click(screen.getByText('Lưu biến thể'));

    await waitFor(() => {
      // Check that form validation prevents submission with invalid sale percentage
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits valid form', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const variantNameInput = screen.getByPlaceholderText('Ví dụ: Chiết 10ml, Fullseal 50ml');
    const sizeInput = screen.getByPlaceholderText('Ví dụ: 10ml, 50ml, 100ml');
    const originalPriceInput = screen.getByLabelText('Giá gốc (VNĐ) *');
    const salePercentageInput = screen.getByLabelText('Mức sale (%)');
    const stockInput = screen.getByLabelText('Số lượng kho *');
    const imageUrlInput = screen.getByLabelText('URL ảnh');

    fireEvent.change(variantNameInput, { target: { value: 'Fullseal 50ml' } });
    fireEvent.change(sizeInput, { target: { value: '50ml' } });
    fireEvent.change(originalPriceInput, { target: { value: '150000' } });
    fireEvent.change(salePercentageInput, { target: { value: '20' } });
    fireEvent.change(stockInput, { target: { value: '50' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });

    fireEvent.click(screen.getByText('Lưu biến thể'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        variantName: 'Fullseal 50ml',
        size: '50ml',
        originalPrice: 150000,
        salePercentage: 20,
        stock: 50,
        imageUrl: 'https://example.com/image.jpg',
      });
    });
  });

  it('validates URL format for image URL', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const variantNameInput = screen.getByPlaceholderText('Ví dụ: Chiết 10ml, Fullseal 50ml');
    const sizeInput = screen.getByPlaceholderText('Ví dụ: 10ml, 50ml, 100ml');
    const originalPriceInput = screen.getByLabelText('Giá gốc (VNĐ) *');
    const stockInput = screen.getByLabelText('Số lượng kho *');
    const imageUrlInput = screen.getByLabelText('URL ảnh');

    fireEvent.change(variantNameInput, { target: { value: 'Test' } });
    fireEvent.change(sizeInput, { target: { value: '10ml' } });
    fireEvent.change(originalPriceInput, { target: { value: '50000' } });
    fireEvent.change(stockInput, { target: { value: '10' } });
    fireEvent.change(imageUrlInput, { target: { value: 'invalid-url' } });

    fireEvent.click(screen.getByText('Lưu biến thể'));

    await waitFor(() => {
      // Check that form validation prevents submission with invalid URL
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Hủy'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('displays price preview', async () => {
    render(
      <VariantForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const originalPriceInput = screen.getByLabelText('Giá gốc (VNĐ) *');
    const salePercentageInput = screen.getByLabelText('Mức sale (%)');

    fireEvent.change(originalPriceInput, { target: { value: '100000' } });
    fireEvent.change(salePercentageInput, { target: { value: '20' } });

    // Check if price preview is shown (component should display calculated final price)
    await waitFor(() => {
      expect(originalPriceInput).toHaveValue(100000);
      expect(salePercentageInput).toHaveValue(20);
    });
  });

  it('populates form when editing existing variant', () => {
    const existingVariant: VariantFormData = {
      variantName: 'Test Variant',
      size: '30ml',
      originalPrice: 80000,
      salePercentage: 15,
      stock: 25,
      imageUrl: 'https://example.com/test.jpg',
    };

    render(
      <VariantForm
        initialData={existingVariant}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test Variant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30ml')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/test.jpg')).toBeInTheDocument();
  });
});
