import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Coming Soon Page', () => {
  it('renders correctly with main heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { name: /18th perfume/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays coming soon message', () => {
    render(<Home />);
    
    const comingSoon = screen.getByRole('heading', { name: /sắp ra mắt/i });
    expect(comingSoon).toBeInTheDocument();
  });

  it('has email subscription form', () => {
    render(<Home />);
    
    const emailInput = screen.getByPlaceholderText(/nhập email của bạn/i);
    const submitButton = screen.getByRole('button', { name: /đăng ký/i });
    
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(submitButton).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Home />);
    
    const facebookBtn = screen.getByRole('button', { name: /facebook/i });
    const instagramBtn = screen.getByRole('button', { name: /instagram/i });
    const tiktokBtn = screen.getByRole('button', { name: /tiktok/i });
    
    expect(facebookBtn).toBeInTheDocument();
    expect(instagramBtn).toBeInTheDocument();
    expect(tiktokBtn).toBeInTheDocument();
  });

  it('has responsive design classes', () => {
    render(<Home />);
    
    // Check the main container div has responsive classes
    const pageContainer = document.querySelector('.container.mx-auto');
    expect(pageContainer).toBeInTheDocument();
    expect(pageContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-16');
  });

  it('displays brand description', () => {
    render(<Home />);
    
    const description = screen.getByText(/chúng tôi đang chuẩn bị/i);
    expect(description).toBeInTheDocument();
  });
});
