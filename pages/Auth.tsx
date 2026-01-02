
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { login as apiLogin, register as apiRegister, verifyOtp, resendOtp, forgotPassword, verifyResetOtp, resetPassword, setRememberMe as setApiRememberMe } from '../services/api';
import Button from '../components/Button';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Stethoscope, CheckCircle2, ArrowLeft, Phone, KeyRound, RefreshCw, X, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'verify-reset-otp' | 'new-password';

export const Auth = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { language } = useLanguage();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showSpamHelpModal, setShowSpamHelpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // OTP resend countdown
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const content = {
    id: {
      login: {
        title: 'Selamat Datang Kembali',
        subtitle: 'Masuk ke akun Anda untuk melanjutkan diagnosa',
        button: 'Masuk',
        noAccount: 'Belum punya akun?',
        register: 'Daftar sekarang',
        forgotPassword: 'Lupa Password?'
      },
      register: {
        title: 'Buat Akun Baru',
        subtitle: 'Daftar untuk memulai perjalanan diagnosa Anda',
        button: 'Kirim Kode OTP',
        hasAccount: 'Sudah punya akun?',
        login: 'Masuk'
      },
      verifyOtp: {
        title: 'Verifikasi Email',
        subtitle: 'Masukkan kode OTP yang telah dikirim ke email Anda',
        button: 'Verifikasi & Daftar',
        resend: 'Kirim Ulang Kode',
        resendIn: 'Kirim ulang dalam',
        back: 'Kembali',
        codeNotShowing: 'Kode tidak muncul?',
        spamHelpTitle: 'Tidak Menerima Kode?',
        spamHelpContent: [
          'Cek folder Spam atau Junk di email Anda',
          'Pastikan alamat email yang Anda masukkan sudah benar',
          'Tunggu beberapa menit, kadang email butuh waktu untuk sampai',
          'Gunakan tombol "Kirim Ulang Kode" setelah countdown selesai'
        ],
        spamHelpButton: 'Mengerti'
      },
      forgotPassword: {
        title: 'Lupa Password',
        subtitle: 'Masukkan email Anda untuk menerima kode reset',
        button: 'Kirim Kode Reset',
        backToLogin: 'Kembali ke Login'
      },
      verifyResetOtp: {
        title: 'Verifikasi Kode',
        subtitle: 'Masukkan kode OTP yang telah dikirim ke email Anda',
        button: 'Verifikasi Kode',
        resend: 'Kirim Ulang Kode',
        resendIn: 'Kirim ulang dalam',
        back: 'Kembali',
        codeNotShowing: 'Kode tidak muncul?',
        spamHelpTitle: 'Tidak Menerima Kode?',
        spamHelpContent: [
          'Cek folder Spam atau Junk di email Anda',
          'Pastikan alamat email yang Anda masukkan sudah benar',
          'Tunggu beberapa menit, kadang email butuh waktu untuk sampai',
          'Gunakan tombol "Kirim Ulang Kode" setelah countdown selesai'
        ],
        spamHelpButton: 'Mengerti'
      },
      newPassword: {
        title: 'Buat Password Baru',
        subtitle: 'Masukkan password baru untuk akun Anda',
        button: 'Reset Password',
        success: 'Password berhasil direset! Silakan login.',
        newPasswordLabel: 'Password Baru',
        confirmPasswordLabel: 'Konfirmasi Password Baru',
        newPasswordPlaceholder: 'Masukkan password baru',
        confirmPasswordPlaceholder: 'Ulangi password baru'
      },
      form: {
        name: 'Nama Lengkap',
        email: 'Email',
        phone: 'Nomor Telepon',
        password: 'Kata Sandi',
        confirmPassword: 'Konfirmasi Kata Sandi',
        otp: 'Kode OTP',
        namePlaceholder: 'Masukkan nama lengkap',
        emailPlaceholder: 'nama@email.com',
        phonePlaceholder: '08xxxxxxxxxx',
        passwordPlaceholder: 'Masukkan kata sandi',
        confirmPlaceholder: 'Ulangi kata sandi',
        otpPlaceholder: 'Masukkan 6 digit kode',
        rememberMe: 'Ingat saya'
      },
      errors: {
        emptyFields: 'Mohon lengkapi semua field',
        passwordMismatch: 'Kata sandi tidak cocok',
        invalidEmail: 'Format email tidak valid',
        passwordTooShort: 'Kata sandi minimal 6 karakter',
        invalidOtp: 'Kode OTP harus 6 digit'
      },
      features: [
        'Akses 50+ alat diagnostik profesional',
        'Laporan visual dengan radar chart',
        'Rekomendasi berbasis AI'
      ]
    },
    en: {
      login: {
        title: 'Welcome Back',
        subtitle: 'Sign in to your account to continue your diagnosis',
        button: 'Sign In',
        noAccount: "Don't have an account?",
        register: 'Register now',
        forgotPassword: 'Forgot Password?'
      },
      register: {
        title: 'Create New Account',
        subtitle: 'Register to start your diagnostic journey',
        button: 'Send OTP Code',
        hasAccount: 'Already have an account?',
        login: 'Sign in'
      },
      verifyOtp: {
        title: 'Verify Email',
        subtitle: 'Enter the OTP code sent to your email',
        button: 'Verify & Register',
        resend: 'Resend Code',
        resendIn: 'Resend in',
        back: 'Back',
        codeNotShowing: 'Code not showing?',
        spamHelpTitle: "Didn't Receive the Code?",
        spamHelpContent: [
          'Check your Spam or Junk folder',
          'Make sure the email address you entered is correct',
          'Wait a few minutes, sometimes emails take time to arrive',
          'Use the "Resend Code" button after the countdown ends'
        ],
        spamHelpButton: 'Got it'
      },
      forgotPassword: {
        title: 'Forgot Password',
        subtitle: 'Enter your email to receive a reset code',
        button: 'Send Reset Code',
        backToLogin: 'Back to Login'
      },
      verifyResetOtp: {
        title: 'Verify Code',
        subtitle: 'Enter the OTP code sent to your email',
        button: 'Verify Code',
        resend: 'Resend Code',
        resendIn: 'Resend in',
        back: 'Back',
        codeNotShowing: 'Code not showing?',
        spamHelpTitle: "Didn't Receive the Code?",
        spamHelpContent: [
          'Check your Spam or Junk folder',
          'Make sure the email address you entered is correct',
          'Wait a few minutes, sometimes emails take time to arrive',
          'Use the "Resend Code" button after the countdown ends'
        ],
        spamHelpButton: 'Got it'
      },
      newPassword: {
        title: 'Create New Password',
        subtitle: 'Enter a new password for your account',
        button: 'Reset Password',
        success: 'Password reset successfully! Please login.',
        newPasswordLabel: 'New Password',
        confirmPasswordLabel: 'Confirm New Password',
        newPasswordPlaceholder: 'Enter new password',
        confirmPasswordPlaceholder: 'Repeat new password'
      },
      form: {
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        otp: 'OTP Code',
        namePlaceholder: 'Enter your full name',
        emailPlaceholder: 'name@email.com',
        phonePlaceholder: '08xxxxxxxxxx',
        passwordPlaceholder: 'Enter password',
        confirmPlaceholder: 'Repeat password',
        otpPlaceholder: 'Enter 6-digit code',
        rememberMe: 'Remember me'
      },
      errors: {
        emptyFields: 'Please fill in all fields',
        passwordMismatch: 'Passwords do not match',
        invalidEmail: 'Invalid email format',
        passwordTooShort: 'Password must be at least 6 characters',
        invalidOtp: 'OTP must be 6 digits'
      },
      features: [
        'Access 50+ professional diagnostic tools',
        'Visual reports with radar charts',
        'AI-powered recommendations'
      ]
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return t.login.title;
      case 'register': return t.register.title;
      case 'verify-otp': return t.verifyOtp.title;
      case 'forgot-password': return t.forgotPassword.title;
      case 'verify-reset-otp': return t.verifyResetOtp.title;
      case 'new-password': return t.newPassword.title;
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return t.login.subtitle;
      case 'register': return t.register.subtitle;
      case 'verify-otp': return t.verifyOtp.subtitle;
      case 'forgot-password': return t.forgotPassword.subtitle;
      case 'verify-reset-otp': return t.verifyResetOtp.subtitle;
      case 'new-password': return t.newPassword.subtitle;
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return t.login.button;
      case 'register': return t.register.button;
      case 'verify-otp': return t.verifyOtp.button;
      case 'forgot-password': return t.forgotPassword.button;
      case 'verify-reset-otp': return t.verifyResetOtp.button;
      case 'new-password': return t.newPassword.button;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Forgot Password - Send OTP
    if (mode === 'forgot-password') {
      if (!email.trim() || !validateEmail(email)) {
        setError(t.errors.invalidEmail);
        return;
      }

      setIsLoading(true);
      try {
        const result = await forgotPassword({ email });
        
        if (!result.success) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setMode('verify-reset-otp');
        setSuccessMessage(result.message);
        setResendCountdown(60);
      } catch (err) {
        setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Verify Reset OTP
    if (mode === 'verify-reset-otp') {
      if (!otp.trim() || otp.length !== 6) {
        setError(t.errors.invalidOtp);
        return;
      }

      setIsLoading(true);
      try {
        const result = await verifyResetOtp({ email, otp });
        
        if (!result.success) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setMode('new-password');
        setSuccessMessage(result.message);
      } catch (err) {
        setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // New Password
    if (mode === 'new-password') {
      if (!newPassword.trim() || !confirmNewPassword.trim()) {
        setError(t.errors.emptyFields);
        return;
      }
      if (newPassword.length < 6) {
        setError(t.errors.passwordTooShort);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError(t.errors.passwordMismatch);
        return;
      }

      setIsLoading(true);
      try {
        const result = await resetPassword({
          email,
          otp,
          password: newPassword,
          password_confirmation: confirmNewPassword
        });
        
        if (!result.success) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setSuccessMessage(t.newPassword.success);
        // Reset form and go to login after delay
        setTimeout(() => {
          setMode('login');
          setEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmNewPassword('');
          setSuccessMessage('');
        }, 2000);
      } catch (err) {
        setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'verify-otp') {
      // Verify OTP for registration
      if (!otp.trim() || otp.length !== 6) {
        setError(t.errors.invalidOtp);
        return;
      }

      setIsLoading(true);
      try {
        const result = await verifyOtp({ email, otp });
        
        if (!result.success) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        if (result.user) {
          loginUser(result.user);
        }
        navigate('/dashboard');
      } catch (err) {
        setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validation for register
    if (mode === 'register' && !name.trim()) {
      setError(t.errors.emptyFields);
      return;
    }
    if (mode === 'register' && !phone.trim()) {
      setError(t.errors.emptyFields);
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError(t.errors.emptyFields);
      return;
    }
    if (!validateEmail(email)) {
      setError(t.errors.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(t.errors.passwordTooShort);
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError(t.errors.passwordMismatch);
      return;
    }

    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        const result = await apiRegister({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          phone,
        });
        
        if (!result.success) {
          if (result.errors) {
            const errorMessages = Object.values(result.errors).flat();
            setError(errorMessages[0] || result.message);
          } else {
            setError(result.message);
          }
          setIsLoading(false);
          return;
        }

        // Switch to OTP verification mode
        setMode('verify-otp');
        setSuccessMessage(result.message);
        setResendCountdown(60);
      } else {
        setApiRememberMe(rememberMe);
        const result = await apiLogin({ email, password });
        
        if (!result.success) {
          setError(result.message);
          setIsLoading(false);
          return;
        }
        
        if (result.user) {
          loginUser(result.user);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const otpType = mode === 'verify-reset-otp' ? 'reset_password' : 'register';
      const result = await resendOtp({ email, type: otpType });
      
      if (result.success) {
        setSuccessMessage(result.message);
        setResendCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(language === 'id' ? 'Gagal mengirim ulang OTP.' : 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromOtp = () => {
    if (mode === 'verify-reset-otp') {
      setMode('forgot-password');
    } else {
      setMode('register');
    }
    setOtp('');
    setError('');
    setSuccessMessage('');
  };

  const handleBackFromNewPassword = () => {
    setMode('forgot-password');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleBackToLogin = () => {
    setMode('login');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccessMessage('');
  };

  const isOtpMode = mode === 'verify-otp' || mode === 'verify-reset-otp';
  const currentSpamHelp = mode === 'verify-reset-otp' ? t.verifyResetOtp : t.verifyOtp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 lg:bg-white flex flex-col lg:flex-row relative overflow-hidden">
      {/* Mobile Background Effects */}
      <div className="absolute inset-0 overflow-hidden lg:hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-64 w-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 h-48 w-48 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button - Positioned for mobile and desktop */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-white lg:text-white hover:text-slate-200 transition-colors z-20"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-semibold text-sm hidden sm:inline">{language === 'id' ? 'Kembali' : 'Back'}</span>
      </button>

      {/* Mobile Header with Branding */}
      <div className="lg:hidden relative z-10 pt-16 pb-6 px-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white">Diagnospace</span>
        </Link>
        <p className="text-sm text-slate-300 max-w-xs mx-auto">
          {language === 'id'
            ? 'Platform diagnostik profesional berbasis sains'
            : 'Science-based professional diagnostic platform'}
        </p>
      </div>

      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            {language === 'id' 
              ? 'Temukan Blindspot Bisnis & Kehidupan Anda' 
              : 'Discover Your Business & Life Blindspots'}
          </h2>
          
          <p className="text-lg text-slate-300 mb-10">
            {language === 'id'
              ? 'Platform diagnostik profesional berbasis sains untuk pengusaha dan profesional.'
              : 'Science-based professional diagnostic platform for entrepreneurs and professionals.'}
          </p>

          <div className="space-y-4">
            {t.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-left bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-6 sm:px-6 lg:px-8 lg:py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Form Card - Glass effect on mobile, white card on desktop */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 lg:bg-white lg:shadow-xl lg:border-slate-200/60 lg:backdrop-blur-none lg:p-10">
            {/* Logo - Desktop only */}
            <div className="hidden lg:block text-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900">Diagnospace</span>
              </Link>
            </div>
            
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {getTitle()}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                {getSubtitle()}
              </p>
              {(isOtpMode || mode === 'new-password') && (
                <p className="mt-1 text-sm text-indigo-600 font-medium">{email}</p>
              )}
            </div>

          {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {successMessage}
                </div>
              )}

              <div className="space-y-4">
              {/* OTP Verification Mode (Register or Reset) */}
              {isOtpMode && (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-bold text-slate-700 mb-2">
                      {t.form.otp}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="block w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-center text-xl sm:text-2xl font-bold tracking-[0.3em] sm:tracking-[0.5em]"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center space-y-2">
                    {resendCountdown > 0 ? (
                      <p className="text-sm text-slate-500">
                        {currentSpamHelp.resendIn} <span className="font-bold text-indigo-600">{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {currentSpamHelp.resend}
                      </button>
                    )}
                    
                    {/* Code not showing link */}
                    <button
                      type="button"
                      onClick={() => setShowSpamHelpModal(true)}
                      className="block w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors underline underline-offset-2"
                    >
                      {currentSpamHelp.codeNotShowing}
                    </button>
                  </div>
                </>
              )}

              {/* New Password Mode */}
              {mode === 'new-password' && (
                <>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 mb-2">
                      {t.newPassword.newPasswordLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                        placeholder={t.newPassword.newPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-bold text-slate-700 mb-2">
                      {t.newPassword.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="confirmNewPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                        placeholder={t.newPassword.confirmPasswordPlaceholder}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Spam Help Modal */}
              {showSpamHelpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setShowSpamHelpModal(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    {/* Modal content */}
                    <div className="text-center mb-6">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4">
                        <AlertCircle className="h-7 w-7 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {currentSpamHelp.spamHelpTitle}
                      </h3>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {currentSpamHelp.spamHelpContent.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => setShowSpamHelpModal(false)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30"
                    >
                      {currentSpamHelp.spamHelpButton}
                    </button>
                  </div>
                </div>
              )}

              {/* Name Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                    {t.form.name}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
                      placeholder={t.form.namePlaceholder}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                    {t.form.email}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
                      placeholder={t.form.emailPlaceholder}
                    />
                  </div>
                </div>
              )}

              {/* Phone Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                    {t.form.phone}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
                      placeholder={t.form.phonePlaceholder}
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                    {t.form.password}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-12 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
                      placeholder={t.form.passwordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
                    {t.form.confirmPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
                      placeholder={t.form.confirmPlaceholder}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password (Login mode only) */}
            {mode === 'login' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    {t.form.rememberMe}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                >
                  {t.login.forgotPassword}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base shadow-lg shadow-indigo-500/30"
            >
              {getButtonText()}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Back button for OTP mode */}
            {isOtpMode && (
              <button
                type="button"
                onClick={handleBackFromOtp}
                className="w-full text-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                ← {currentSpamHelp.back}
              </button>
            )}

            {/* Back button for new password mode */}
            {mode === 'new-password' && (
              <button
                type="button"
                onClick={handleBackFromNewPassword}
                className="w-full text-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                ← {language === 'id' ? 'Kembali' : 'Back'}
              </button>
            )}

            {/* Back to login for forgot password mode */}
            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                ← {t.forgotPassword.backToLogin}
              </button>
            )}

            {/* Switch Mode */}
            {(mode === 'login' || mode === 'register') && (
              <p className="text-center text-sm text-slate-600">
                {mode === 'login' ? t.login.noAccount : t.register.hasAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {mode === 'login' ? t.login.register : t.register.login}
                </button>
              </p>
            )}
          </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};
