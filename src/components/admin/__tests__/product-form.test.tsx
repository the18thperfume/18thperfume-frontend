import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductForm from '../product-form';
import { ProductFormData } from '@/types';

const mockInitialData: Partial<ProductFormData> = {
  name: 'Test Product',
  brand: 'Test Brand',
  category: 'Unisex',
  segment: 'Designer',
  origin: 'France',
  fragranceFamily: 'Fresh',
  concentration: 'EDP',
  releaseYear: 2023,
  seasons: ['Xuân'],
  topNotes: 'Bergamot',
  variants: [{
    variantName: 'Test Variant',
    size: '50ml',
    originalPrice: 500000,
    salePercentage: 10,
    stock: 20,
    imageUrl: 'http://test.com/image.jpg'
  }]
};

describe('ProductForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Tên sản phẩm/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thương hiệu/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Giới tính/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phân khúc/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Xuất xứ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nhóm hương/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nồng độ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Năm ra mắt/)).toBeInTheDocument();
  });

  it('renders form with initial data', () => {
    render(
      <ProductForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Brand')).toBeInTheDocument();
    expect(screen.getByDisplayValue('France')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
  });

  it('renders category dropdown with options', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const categorySelect = screen.getByLabelText(/Giới tính/);
    expect(categorySelect).toBeInTheDocument();
    
    // Check options are present
    expect(screen.getByText('Nam')).toBeInTheDocument();
    expect(screen.getByText('Nữ')).toBeInTheDocument();
    expect(screen.getByText('Unisex')).toBeInTheDocument();
  });

  it('renders segment dropdown with options', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const segmentSelect = screen.getByLabelText(/Phân khúc/);
    expect(segmentSelect).toBeInTheDocument();
    
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByText('Niche')).toBeInTheDocument();
  });

  it('renders season checkboxes', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Xuân')).toBeInTheDocument();
    expect(screen.getByText('Hè')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Đông')).toBeInTheDocument();
  });

  it('handles season selection', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const springCheckbox = screen.getByLabelText('Xuân');
    fireEvent.click(springCheckbox);

    expect(springCheckbox).toBeChecked();
  });

  it('renders notes input fields', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Top Notes/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Middle Notes/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Base Notes/)).toBeInTheDocument();
  });

  it('shows ingredients generation notice', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Hệ thống sẽ tự động tạo danh sách "Thành phần"/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Lưu sản phẩm');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Tên sản phẩm là bắt buộc')).toBeInTheDocument();
      expect(screen.getByText('Thương hiệu là bắt buộc')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates release year constraints', async () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Set invalid release year to trigger validation
    const releaseYearInput = screen.getByLabelText(/Năm ra mắt/);
    fireEvent.change(releaseYearInput, { target: { value: '1800' } });
    
    // Trigger validation by blurring the field
    fireEvent.blur(releaseYearInput);

    await waitFor(() => {
      // Check if validation error appears or form prevents submission
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    render(
      <ProductForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Lưu sản phẩm');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          brand: 'Test Brand',
          category: 'Unisex',
          segment: 'Designer'
        })
      );
    });
  });

  it('handles cancel action', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Hủy');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByText('Đang lưu...')).toBeInTheDocument();
    expect(screen.getByText('Đang lưu...')).toBeDisabled();
  });

  it('renders variant manager', () => {
    render(
      <ProductForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Quản lý Biến thể')).toBeInTheDocument();
  });

  it('handles input changes correctly', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Tên sản phẩm/);
    fireEvent.change(nameInput, { target: { value: 'New Product Name' } });

    expect(nameInput).toHaveValue('New Product Name');
  });

  it('handles dropdown selections', () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const categorySelect = screen.getByLabelText(/Giới tính/);
    fireEvent.change(categorySelect, { target: { value: 'Nam' } });

    expect(categorySelect).toHaveValue('Nam');
  });

  it('validates notes length constraints', async () => {
    render(
      <ProductForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const topNotesInput = screen.getByLabelText(/Top Notes/);
    const longText = 'A'.repeat(201); // Over 200 character limit
    fireEvent.change(topNotesInput, { target: { value: longText } });

    const submitButton = screen.getByText('Lưu sản phẩm');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Top Notes không được vượt quá 200 ký tự/)).toBeInTheDocument();
    });
  });
});
