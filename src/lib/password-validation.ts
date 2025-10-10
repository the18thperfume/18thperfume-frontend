/**
 * Password validation utilities
 */

export interface PasswordStrength {
  score: number; // 0-5
  isValid: boolean;
  feedback: string[];
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Cần ít nhất 8 ký tự');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Cần ít nhất 1 chữ hoa');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Cần ít nhất 1 chữ thường');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Cần ít nhất 1 số');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Cần ít nhất 1 ký tự đặc biệt (!@#$%^&* v.v.)');
  }

  return {
    score,
    isValid: score >= 5,
    feedback,
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 1) return 'bg-red-500';
  if (score <= 2) return 'bg-orange-500';
  if (score <= 3) return 'bg-yellow-500';
  if (score <= 4) return 'bg-blue-500';
  return 'bg-green-500';
};

export const getPasswordStrengthText = (score: number): string => {
  if (score <= 1) return 'Rất yếu';
  if (score <= 2) return 'Yếu';
  if (score <= 3) return 'Trung bình';
  if (score <= 4) return 'Mạnh';
  return 'Rất mạnh';
};
