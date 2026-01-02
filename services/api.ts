const API_BASE_URL = 'http://localhost:8000/api';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role?: string;
    bio?: string;
    avatar_url?: string;
    created_at?: string;
  };
  token?: string;
  token_type?: string;
  expires_in?: number;
  errors?: Record<string, string[]>;
  email?: string;
  avatar_url?: string;
}

// Remember me preference (persists token in localStorage vs sessionStorage)
let rememberMePreference = true;

export const setRememberMe = (value: boolean): void => {
  rememberMePreference = value;
};

// Get stored token (check both storages)
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
};

// Set token based on remember me preference
export const setToken = (token: string): void => {
  if (rememberMePreference) {
    localStorage.setItem('jwt_token', token);
    sessionStorage.removeItem('jwt_token');
  } else {
    sessionStorage.setItem('jwt_token', token);
    localStorage.removeItem('jwt_token');
  }
};

// Remove token from both storages
export const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
};

// API request helper with JWT
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

// API request for file uploads (multipart/form-data)
const apiUploadRequest = async (
  endpoint: string,
  formData: FormData
): Promise<Response> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
};

// Step 1: Register - Send OTP
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Step 2: Verify OTP and complete registration
export const verifyOtp = async (data: {
  email: string;
  otp: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (result.success && result.token) {
    setToken(result.token);
  }
  
  return result;
};

// Resend OTP
export const resendOtp = async (data: {
  email: string;
  type: 'register' | 'reset_password';
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Login
export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (result.success && result.token) {
    setToken(result.token);
  }
  
  return result;
};

// Logout
export const logout = async (): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });
  
  removeToken();
  
  return response.json();
};

// Get current user
export const getMe = async (): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/me', {
    method: 'GET',
  });
  
  return response.json();
};

// Refresh token
export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/refresh', {
    method: 'POST',
  });
  
  const result = await response.json();
  
  if (result.success && result.token) {
    setToken(result.token);
  }
  
  return result;
};

// Forgot password - Step 1: Send OTP
export const forgotPassword = async (data: {
  email: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Verify reset OTP - Step 2
export const verifyResetOtp = async (data: {
  email: string;
  otp: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Reset password - Step 3
export const resetPassword = async (data: {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Request email change - sends OTP to current email
export const requestEmailChange = async (): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/request-email-change', {
    method: 'POST',
  });
  
  return response.json();
};

// Verify current email OTP for email change
export const verifyCurrentEmailOtp = async (data: {
  otp: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/verify-current-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Submit new email - sends OTP to new email
export const submitNewEmail = async (data: {
  new_email: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/submit-new-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Verify new email OTP and complete email change
export const verifyNewEmailOtp = async (data: {
  new_email: string;
  otp: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/verify-new-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Update profile
export const updateUserProfile = async (data: {
  name?: string;
  phone?: string;
  role?: string;
  bio?: string;
}): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Upload avatar
export const uploadAvatar = async (file: File): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiUploadRequest('/auth/upload-avatar', formData);
  
  return response.json();
};

// Delete avatar
export const deleteAvatar = async (): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/delete-avatar', {
    method: 'DELETE',
  });
  
  return response.json();
};

// ================== TEST RESULTS API ==================

export interface TestResultData {
  test_id: string;
  test_title: string;
  category: string;
  score: number;
  level: string;
  answers?: Record<string, number>;
  dimension_scores?: Array<{ subject: string; score: number }>;
}

export interface TestResultResponse {
  success: boolean;
  message?: string;
  data?: any;
  xp_earned?: number;
  errors?: Record<string, string[]>;
}

export interface TestHistoryItem {
  id: number;
  test_id: string;
  test_title: string;
  category: string;
  score: number;
  level: string;
  xp_earned: number;
  dimension_scores?: Array<{ subject: string; score: number }>;
  date: string;
  created_at: string;
}

export interface UserStats {
  completed_tests: number;
  total_xp: number;
  avg_score: number;
  current_streak: number;
  activity_data: Array<{ name: string; xp: number }>;
}

export interface LeaderboardBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface LeaderboardItem {
  id: number;
  name: string;
  points: number;
  badges: number;
  badge_list?: LeaderboardBadge[];
  avatar: string;
  avatar_url?: string;
  is_me: boolean;
  trend: string;
}

// Save test result
export const saveTestResult = async (data: TestResultData): Promise<TestResultResponse> => {
  const response = await apiRequest('/test-results', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Get user's test history
export const getTestHistory = async (): Promise<{ success: boolean; data: TestHistoryItem[] }> => {
  const response = await apiRequest('/test-results', {
    method: 'GET',
  });
  
  return response.json();
};

// Get user statistics
export const getUserStats = async (): Promise<{ success: boolean; data: UserStats }> => {
  const response = await apiRequest('/user-stats', {
    method: 'GET',
  });
  
  return response.json();
};

// Get leaderboard
export const getLeaderboard = async (): Promise<{ success: boolean; data: LeaderboardItem[] }> => {
  const response = await apiRequest('/leaderboard', {
    method: 'GET',
  });
  
  return response.json();
};

// ================== BADGES API ==================

export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned_at?: string;
  locked?: boolean;
  criteria?: string;
}

export interface BadgesResponse {
  success: boolean;
  data: {
    earned: BadgeItem[];
    locked: BadgeItem[];
    total_badges: number;
    earned_count: number;
  };
}

export interface CheckBadgesResponse {
  success: boolean;
  data: {
    new_badges: BadgeItem[];
    total_earned: number;
  };
}

// Get user's badges
export const getUserBadges = async (): Promise<BadgesResponse> => {
  const response = await apiRequest('/badges', {
    method: 'GET',
  });
  
  return response.json();
};

// Check and award badges after completing a test
export const checkAndAwardBadges = async (): Promise<CheckBadgesResponse> => {
  const response = await apiRequest('/badges/check', {
    method: 'POST',
  });
  
  return response.json();
};

// ================== PAYMENT API ==================

// Public plans interface
export interface PublicPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
}

export interface PublicPlansResponse {
  success: boolean;
  plans: PublicPlan[];
}

// Get public plans (for pricing page)
export const getPublicPlans = async (): Promise<PublicPlansResponse> => {
  const response = await fetch(`${API_BASE_URL}/plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  return response.json();
};

export interface PaymentClientKeyResponse {
  success: boolean;
  client_key: string;
  is_production: boolean;
}

export interface CreateTransactionResponse {
  success: boolean;
  token?: string;
  redirect_url?: string;
  order_id?: string;
  message?: string;
  error?: any;
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    transaction_status: string;
    order_id: string;
    gross_amount: string;
    payment_type?: string;
  };
  message?: string;
}

// Get Midtrans client key
export const getMidtransClientKey = async (): Promise<PaymentClientKeyResponse> => {
  const response = await apiRequest('/payment/client-key', {
    method: 'GET',
  });
  
  return response.json();
};

// Create payment transaction
export const createPaymentTransaction = async (data: {
  plan: 'PRO' | 'PREMIUM';
  referral_code?: string | null;
  voucher_code?: string | null;
}): Promise<CreateTransactionResponse> => {
  const response = await apiRequest('/payment/create-transaction', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Validate voucher code
export interface VoucherValidationResponse {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    discount_percent: number;
  };
}

export const validateVoucherCode = async (code: string): Promise<VoucherValidationResponse> => {
  const response = await apiRequest('/voucher/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  
  return response.json();
};


// Check payment status
export const checkPaymentStatus = async (data: {
  order_id: string;
}): Promise<PaymentStatusResponse> => {
  const response = await apiRequest('/payment/check-status', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Verify payment and upgrade plan
export interface VerifyUpgradeResponse {
  success: boolean;
  message?: string;
  data?: {
    plan: string;
    plan_expires_at: string;
    payment_status: string;
  };
}

export const verifyAndUpgradePlan = async (orderId: string): Promise<VerifyUpgradeResponse> => {
  const response = await apiRequest('/payment/verify-upgrade', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
  
  return response.json();
};

// ================== PLAN EXPIRY & PAYMENT HISTORY API ==================

export interface PlanExpiryResponse {
  success: boolean;
  data: {
    downgraded: boolean;
    previous_plan: string;
    current_plan: string;
    plan: string;
    plan_expires_at: string | null;
  };
}

export interface PaymentHistoryItem {
  id: number;
  order_id: string;
  plan: string;
  plan_name: string;
  amount: number;
  formatted_amount: string;
  payment_type: string | null;
  status: string;
  status_label: string;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistoryItem[];
}

// Check if plan is expired and get current plan status
export const checkPlanExpiry = async (): Promise<PlanExpiryResponse> => {
  const response = await apiRequest('/payment/check-plan-expiry', {
    method: 'GET',
  });
  
  return response.json();
};

// Get payment history
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  const response = await apiRequest('/payment/history', {
    method: 'GET',
  });
  
  return response.json();
};

// Cancel/End current plan
export interface CancelPlanResponse {
  success: boolean;
  message: string;
  data?: {
    previous_plan: string;
    current_plan: string;
  };
}

export const cancelPlan = async (): Promise<CancelPlanResponse> => {
  const response = await apiRequest('/payment/cancel-plan', {
    method: 'POST',
  });
  
  return response.json();
};

// ================== AFFILIATE API ==================

export interface AffiliateSettings {
  whatsapp_cs: string;
  commission_percentage: number;
  discount_percentage: number;
  min_withdrawal: number;
}

export interface AffiliateData {
  id: number;
  referral_code: string;
  is_active: boolean;
  balance: number;
  total_earned: number;
  total_referrals: number;
  created_at: string;
}

export interface AffiliateResponse {
  success: boolean;
  message?: string;
  data: {
    is_affiliate: boolean;
    affiliate?: AffiliateData;
    settings: AffiliateSettings;
    whatsapp_cs?: string;
  };
}

export interface AffiliateStatsResponse {
  success: boolean;
  data: {
    is_affiliate: boolean;
    balance?: number;
    total_earned?: number;
    total_referrals?: number;
    pending_withdrawals?: number;
    total_withdrawals?: number;
    this_month_earnings?: number;
    monthly_earnings?: Array<{
      month: string;
      year: number;
      earnings: number;
      referrals: number;
    }>;
  };
}

export interface ReferralTransaction {
  id: number;
  referred_user: {
    name: string;
    email: string;
  };
  order_amount: number;
  discount_given: number;
  commission_earned: number;
  plan_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export interface WithdrawalItem {
  id: number;
  amount: number;
  payment_method: string;
  payment_method_label: string;
  bank_name: string | null;
  account_name: string;
  account_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface ValidateCodeResponse {
  success: boolean;
  message?: string;
  data?: {
    discount_percentage: number;
    affiliate_name: string;
  };
}

// Get affiliate settings (public)
export const getAffiliateSettings = async (): Promise<{ success: boolean; data: AffiliateSettings }> => {
  const response = await fetch(`${API_BASE_URL}/affiliate/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  return response.json();
};

// Get my affiliate data
export const getMyAffiliate = async (): Promise<AffiliateResponse> => {
  const response = await apiRequest('/affiliate/me', {
    method: 'GET',
  });
  
  return response.json();
};

// Register as affiliate
export const registerAffiliate = async (): Promise<{ success: boolean; message: string; data?: { affiliate: AffiliateData; whatsapp_cs: string } }> => {
  const response = await apiRequest('/affiliate/register', {
    method: 'POST',
  });
  
  return response.json();
};

// Update referral code
export const updateReferralCode = async (referral_code: string): Promise<{ success: boolean; message: string; data?: { referral_code: string } }> => {
  const response = await apiRequest('/affiliate/code', {
    method: 'PUT',
    body: JSON.stringify({ referral_code }),
  });
  
  return response.json();
};

// Validate referral code (for payment)
export const validateReferralCode = async (referral_code: string): Promise<ValidateCodeResponse> => {
  const response = await apiRequest('/affiliate/validate-code', {
    method: 'POST',
    body: JSON.stringify({ referral_code }),
  });
  
  return response.json();
};

// Get affiliate transactions
export const getAffiliateTransactions = async (): Promise<{ success: boolean; data: ReferralTransaction[] }> => {
  const response = await apiRequest('/affiliate/transactions', {
    method: 'GET',
  });
  
  return response.json();
};

// Get affiliate stats
export const getAffiliateStats = async (): Promise<AffiliateStatsResponse> => {
  const response = await apiRequest('/affiliate/stats', {
    method: 'GET',
  });
  
  return response.json();
};

// Request withdrawal
export const requestWithdrawal = async (data: {
  amount: number;
  payment_method: 'bank_transfer' | 'dana' | 'gopay' | 'ovo' | 'shopeepay';
  bank_name?: string;
  account_name: string;
  account_number: string;
}): Promise<{ success: boolean; message: string; data?: { withdrawal_id: number; amount: number; new_balance: number } }> => {
  const response = await apiRequest('/affiliate/withdraw', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Get withdrawal history
export const getWithdrawals = async (): Promise<{ success: boolean; data: WithdrawalItem[] }> => {
  const response = await apiRequest('/affiliate/withdrawals', {
    method: 'GET',
  });
  
  return response.json();
};

// ================== NOTIFICATIONS API ==================

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  unread_count: number;
}

// Get user notifications
export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await apiRequest('/notifications', {
    method: 'GET',
  });
  
  return response.json();
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<{ success: boolean; count: number }> => {
  const response = await apiRequest('/notifications/unread-count', {
    method: 'GET',
  });
  
  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
  });
  
  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiRequest('/notifications/read-all', {
    method: 'PUT',
  });
  
  return response.json();
};

// Delete notification
export const deleteNotification = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  });
  
  return response.json();
};
