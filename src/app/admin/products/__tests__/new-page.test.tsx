import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import NewProductPage from '../new/page';

// Mock the hooks and services
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/admin/product-admin-service', () => ({
  ProductAdminService: {
    createProduct: jest.fn(),
    validateProductData: jest.fn(() => []),
  },
}));

jest.mock('@/components/admin/product-form', () => {
  return function MockProductForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="product-form">
        <button onClick={() => onSubmit({ name: 'Test Product' })} data-testid="submit-btn">
          Submit
        </button>
        <button onClick={onCancel} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('@/lib/notifications', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

describe('NewProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({ push: mockPush });
  });

  it('renders new product form', () => {
    render(<NewProductPage />);

    expect(screen.getByText('Thêm Sản phẩm Mới')).toBeInTheDocument();
    expect(screen.getByText('Tạo một sản phẩm mới với đầy đủ thông tin và biến thể')).toBeInTheDocument();
    expect(screen.getByTestId('product-form')).toBeInTheDocument();
  });

  it('redirects to edit page with query parameter after successful product creation', async () => {
    const mockNewProduct = {
      productId: 'new-product-123',
      name: 'Test Product',
    };

    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    ProductAdminService.createProduct.mockResolvedValue(mockNewProduct);

    render(<NewProductPage />);

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(ProductAdminService.createProduct).toHaveBeenCalledWith({ name: 'Test Product' });
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/products/edit?id=new-product-123');
  });

  it('shows error when product creation fails', async () => {
    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    const { showError } = require('@/lib/notifications');
    
    ProductAdminService.createProduct.mockRejectedValue(new Error('Creation failed'));

    render(<NewProductPage />);

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Creation failed');
    });
  });

  it('navigates back to products list when cancel is clicked', () => {
    render(<NewProductPage />);

    const cancelBtn = screen.getByTestId('cancel-btn');
    fireEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith('/admin/products');
  });

  it('validates data before submission', async () => {
    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    const { showError } = require('@/lib/notifications');
    
    ProductAdminService.validateProductData.mockReturnValue(['Name is required']);

    render(<NewProductPage />);

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Dữ liệu không hợp lệ: Name is required', { duration: 7000 });
    });

    expect(ProductAdminService.createProduct).not.toHaveBeenCalled();
  });
});
