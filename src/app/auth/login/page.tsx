'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { initializeAmplify } from '@/lib/amplify-init';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/password-validation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  
  const router = useRouter();
  const { signIn, confirmNewPassword } = useAdminAuth();

  // Initialize Amplify early
  useEffect(() => {
    initializeAmplify();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(username, password);
      
      if (result.success) {
        router.replace('/admin');
      } else if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setNeedsNewPassword(true);
        setError(null);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(`Mật khẩu không đủ mạnh: ${passwordValidation.feedback.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await confirmNewPassword(newPassword);
      
      if (success) {
        router.replace('/admin');
      } else {
        setError('Không thể đặt mật khẩu mới. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('New password error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {needsNewPassword ? 'Đặt mật khẩu mới' : 'Đăng nhập Admin'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {needsNewPassword 
              ? 'Lần đăng nhập đầu tiên - Vui lòng đặt mật khẩu mới' 
              : 'Truy cập hệ thống quản trị The 18th Perfume'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={needsNewPassword ? handleNewPasswordSubmit : handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Lỗi đăng nhập
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!needsNewPassword ? (
              // Login Form
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập hoặc Email
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="admin hoặc admin@example.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // New Password Form
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Mật khẩu mới
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Độ mạnh mật khẩu:</span>
                        <span className="font-medium">
                          {getPasswordStrengthText(validatePassword(newPassword).score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(validatePassword(newPassword).score)}`}
                          style={{
                            width: `${(validatePassword(newPassword).score / 5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-800 mb-1">Yêu cầu mật khẩu:</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Ít nhất 8 ký tự</li>
                    <li>Ít nhất 1 chữ hoa</li>
                    <li>Ít nhất 1 chữ thường</li>
                    <li>Ít nhất 1 số</li>
                    <li>Ít nhất 1 ký tự đặc biệt</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={
                isLoading || 
                (!needsNewPassword && (!username || !password)) ||
                (needsNewPassword && (!newPassword || !confirmPassword))
              }
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isLoading 
                ? (needsNewPassword ? 'Đang đặt mật khẩu...' : 'Đang đăng nhập...') 
                : (needsNewPassword ? 'Đặt mật khẩu' : 'Đăng nhập')
              }
            </button>
          </div>

          {needsNewPassword && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setNeedsNewPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                disabled={isLoading}
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Chỉ dành cho quản trị viên được ủy quyền
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
