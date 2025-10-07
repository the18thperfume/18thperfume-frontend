import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { CognitoProtectedRoute, useAdminUser } from '../cognito-protected-route';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AWS Amplify auth functions
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  fetchAuthSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Amplify configuration
jest.mock('@/lib/admin-auth-config', () => ({
  configureAmplifyAuth: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockFetchAuthSession = fetchAuthSession as jest.MockedFunction<typeof fetchAuthSession>;

describe('CognitoProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const renderComponent = (props = {}) => {
    return render(
      <CognitoProtectedRoute {...props}>
        <div data-testid="protected-content">Protected Content</div>
      </CognitoProtectedRoute>
    );
  };

  it('should show loading state initially', () => {
    // Mock pending promises
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));
    
    renderComponent();
    
    expect(screen.getByText('Đang xác thực...')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chờ trong giây lát')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('not authenticated'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('should show unauthorized message for non-admin users', async () => {
    const mockUser = { userId: 'user-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'user-123',
            email: 'user@test.com',
            'cognito:groups': ['users'], // Non-admin group
            'custom:role': 'user',
          },
        },
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument();
      expect(screen.getByText('Bạn cần quyền quản trị viên để truy cập khu vực này.')).toBeInTheDocument();
    });
  });

  it('should render protected content for admin users', async () => {
    const mockUser = { userId: 'admin-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'admin-123',
            email: 'admin@test.com',
            'cognito:groups': ['admin'], // Admin group
            'custom:role': 'admin',
          },
        },
      },
    };

    console.log('Setting up mocks for admin test');
    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    console.log('Rendering component for admin test');
    renderComponent();
    
    console.log('Waiting for protected content to appear');
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should accept users with custom admin role', async () => {
    const mockUser = { userId: 'admin-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'admin-123',
            email: 'admin@test.com',
            'cognito:groups': [], // No groups
            'custom:role': 'admin', // But has admin role
          },
        },
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should accept users with super-admin role', async () => {
    const mockUser = { userId: 'superadmin-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'superadmin-123',
            email: 'superadmin@test.com',
            'cognito:groups': ['super-admin'],
            'custom:role': 'super-admin',
          },
        },
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should respect custom required groups', async () => {
    const mockUser = { userId: 'moderator-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'moderator-123',
            email: 'moderator@test.com',
            'cognito:groups': ['moderator'],
            'custom:role': 'moderator',
          },
        },
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    renderComponent({ requiredGroups: ['moderator', 'admin'] });
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should use custom fallback route', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('not authenticated'));
    
    renderComponent({ fallbackRoute: '/custom-login' });
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/custom-login');
    });
  });

  it('should handle invalid token payload', async () => {
    const mockUser = { userId: 'user-123' };
    const mockSession = {
      tokens: {
        idToken: null, // Invalid token
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Lỗi xác thực')).toBeInTheDocument();
      expect(screen.getByText('Invalid ID token')).toBeInTheDocument();
    });
  });

  it('should handle session fetch error', async () => {
    const mockUser = { userId: 'user-123' };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockRejectedValue(new Error('Session fetch failed'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Lỗi xác thực')).toBeInTheDocument();
      expect(screen.getByText('Session fetch failed')).toBeInTheDocument();
    });
  });
});

describe('useAdminUser hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user data for authenticated admin', async () => {
    const mockUser = { userId: 'admin-123' };
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            sub: 'admin-123',
            email: 'admin@test.com',
            'cognito:groups': ['admin'],
            'custom:role': 'admin',
          },
        },
      },
    };

    mockGetCurrentUser.mockResolvedValue(mockUser as any);
    mockFetchAuthSession.mockResolvedValue(mockSession as any);

    const TestComponent = () => {
      const { user, isLoading } = useAdminUser();
      
      if (isLoading) return <div>Loading...</div>;
      if (!user) return <div>No user</div>;
      
      return <div data-testid="user-email">{user.email}</div>;
    };

    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com');
    });
  });

  it('should return null for unauthenticated users', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('not authenticated'));

    const TestComponent = () => {
      const { user, isLoading } = useAdminUser();
      
      if (isLoading) return <div>Loading...</div>;
      if (!user) return <div>No user</div>;
      
      return <div>User found</div>;
    };

    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    // Mock pending promise
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));

    const TestComponent = () => {
      const { user, isLoading } = useAdminUser();
      
      if (isLoading) return <div>Loading...</div>;
      return <div>Loaded</div>;
    };

    render(<TestComponent />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
