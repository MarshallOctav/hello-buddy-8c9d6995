import React, { useState, useEffect } from 'react';
import { X, Mail, KeyRound, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from './Button';
import {
  requestEmailChange,
  verifyCurrentEmailOtp,
  submitNewEmail,
  verifyNewEmailOtp,
  resendOtp
} from '../services/api';

type EmailChangeStep = 'verify-current' | 'enter-new' | 'verify-new' | 'success';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  language: string;
  onEmailChanged: (newEmail: string) => void;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  language,
  onEmailChanged
}) => {
  const [step, setStep] = useState<EmailChangeStep>('verify-current');
  const [otp, setOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showSpamHelp, setShowSpamHelp] = useState(false);

  const t = {
    id: {
      title: 'Ganti Email',
      step1Title: 'Verifikasi Email Saat Ini',
      step1Desc: 'Kami telah mengirim kode verifikasi ke email Anda saat ini',
      step2Title: 'Masukkan Email Baru',
      step2Desc: 'Masukkan alamat email baru yang ingin Anda gunakan',
      step3Title: 'Verifikasi Email Baru',
      step3Desc: 'Kami telah mengirim kode verifikasi ke email baru Anda',
      successTitle: 'Email Berhasil Diubah!',
      successDesc: 'Email Anda telah berhasil diperbarui.',
      otpLabel: 'Kode OTP',
      otpPlaceholder: 'Masukkan 6 digit kode',
      newEmailLabel: 'Email Baru',
      newEmailPlaceholder: 'Masukkan email baru',
      sendCode: 'Kirim Kode',
      verifyCode: 'Verifikasi Kode',
      continue: 'Lanjutkan',
      done: 'Selesai',
      resendCode: 'Kirim Ulang Kode',
      resendIn: 'Kirim ulang dalam',
      codeNotShowing: 'Kode tidak muncul?',
      spamHelpTitle: 'Tidak Menerima Kode?',
      spamHelpContent: [
        'Cek folder Spam atau Junk di email Anda',
        'Pastikan alamat email sudah benar',
        'Tunggu beberapa menit',
        'Gunakan tombol "Kirim Ulang Kode"'
      ],
      spamHelpButton: 'Mengerti',
      invalidOtp: 'Kode OTP harus 6 digit',
      invalidEmail: 'Format email tidak valid',
      sending: 'Mengirim...',
      verifying: 'Memverifikasi...'
    },
    en: {
      title: 'Change Email',
      step1Title: 'Verify Current Email',
      step1Desc: 'We have sent a verification code to your current email',
      step2Title: 'Enter New Email',
      step2Desc: 'Enter the new email address you want to use',
      step3Title: 'Verify New Email',
      step3Desc: 'We have sent a verification code to your new email',
      successTitle: 'Email Successfully Changed!',
      successDesc: 'Your email has been successfully updated.',
      otpLabel: 'OTP Code',
      otpPlaceholder: 'Enter 6-digit code',
      newEmailLabel: 'New Email',
      newEmailPlaceholder: 'Enter new email',
      sendCode: 'Send Code',
      verifyCode: 'Verify Code',
      continue: 'Continue',
      done: 'Done',
      resendCode: 'Resend Code',
      resendIn: 'Resend in',
      codeNotShowing: 'Code not showing?',
      spamHelpTitle: "Didn't Receive the Code?",
      spamHelpContent: [
        'Check your Spam or Junk folder',
        'Make sure the email address is correct',
        'Wait a few minutes',
        'Use the "Resend Code" button'
      ],
      spamHelpButton: 'Got it',
      invalidOtp: 'OTP must be 6 digits',
      invalidEmail: 'Invalid email format',
      sending: 'Sending...',
      verifying: 'Verifying...'
    }
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('verify-current');
      setOtp('');
      setNewEmail('');
      setError('');
      setSuccessMessage('');
      setShowSpamHelp(false);
      // Send OTP to current email
      handleSendCurrentEmailOtp();
    }
  }, [isOpen]);

  const handleSendCurrentEmailOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await requestEmailChange();
      if (result.success) {
        setSuccessMessage(result.message);
        setResendCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(language === 'id' ? 'Gagal mengirim kode.' : 'Failed to send code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCurrentEmail = async () => {
    if (otp.length !== 6) {
      setError(text.invalidOtp);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await verifyCurrentEmailOtp({ otp });
      if (result.success) {
        setOtp('');
        setStep('enter-new');
        setSuccessMessage('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(language === 'id' ? 'Verifikasi gagal.' : 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitNewEmail = async () => {
    if (!validateEmail(newEmail)) {
      setError(text.invalidEmail);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await submitNewEmail({ new_email: newEmail });
      if (result.success) {
        setStep('verify-new');
        setSuccessMessage(result.message);
        setResendCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(language === 'id' ? 'Gagal mengirim kode.' : 'Failed to send code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNewEmail = async () => {
    if (otp.length !== 6) {
      setError(text.invalidOtp);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await verifyNewEmailOtp({ new_email: newEmail, otp });
      if (result.success) {
        setStep('success');
        onEmailChanged(newEmail);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(language === 'id' ? 'Verifikasi gagal.' : 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsLoading(true);
    setError('');
    try {
      if (step === 'verify-current') {
        const result = await requestEmailChange();
        if (result.success) {
          setSuccessMessage(result.message);
          setResendCountdown(60);
        } else {
          setError(result.message);
        }
      } else if (step === 'verify-new') {
        const result = await submitNewEmail({ new_email: newEmail });
        if (result.success) {
          setSuccessMessage(result.message);
          setResendCountdown(60);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(language === 'id' ? 'Gagal mengirim ulang kode.' : 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['verify-current', 'enter-new', 'verify-new'].map((s, idx) => (
        <React.Fragment key={s}>
          <div 
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s 
                ? 'bg-indigo-600 text-white' 
                : step === 'success' || ['verify-current', 'enter-new', 'verify-new'].indexOf(step) > idx
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-500'
            }`}
          >
            {step === 'success' || ['verify-current', 'enter-new', 'verify-new'].indexOf(step) > idx ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              idx + 1
            )}
          </div>
          {idx < 2 && (
            <div className={`w-8 h-1 rounded ${
              ['verify-current', 'enter-new', 'verify-new'].indexOf(step) > idx || step === 'success'
                ? 'bg-green-500'
                : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-black text-slate-900 mb-4">{text.title}</h2>

        {step !== 'success' && renderStepIndicator()}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && step !== 'success' && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Step 1: Verify Current Email */}
        {step === 'verify-current' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-3">
                <Mail className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{text.step1Title}</h3>
              <p className="text-sm text-slate-500 mt-1">{text.step1Desc}</p>
              <p className="text-sm text-indigo-600 font-medium mt-1">{currentEmail}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{text.otpLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                />
              </div>
            </div>

            {/* Resend & Spam Help */}
            <div className="text-center space-y-2">
              {resendCountdown > 0 ? (
                <p className="text-sm text-slate-500">
                  {text.resendIn} <span className="font-bold text-indigo-600">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  {text.resendCode}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSpamHelp(true)}
                className="block w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors underline underline-offset-2"
              >
                {text.codeNotShowing}
              </button>
            </div>

            <Button
              variant="gradient"
              className="w-full h-14 rounded-xl"
              onClick={handleVerifyCurrentEmail}
              isLoading={isLoading}
            >
              {isLoading ? text.verifying : text.verifyCode}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Enter New Email */}
        {step === 'enter-new' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-3">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{text.step2Title}</h3>
              <p className="text-sm text-slate-500 mt-1">{text.step2Desc}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{text.newEmailLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder={text.newEmailPlaceholder}
                />
              </div>
            </div>

            <Button
              variant="gradient"
              className="w-full h-14 rounded-xl"
              onClick={handleSubmitNewEmail}
              isLoading={isLoading}
            >
              {isLoading ? text.sending : text.sendCode}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Verify New Email */}
        {step === 'verify-new' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-3">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{text.step3Title}</h3>
              <p className="text-sm text-slate-500 mt-1">{text.step3Desc}</p>
              <p className="text-sm text-green-600 font-medium mt-1">{newEmail}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{text.otpLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                />
              </div>
            </div>

            {/* Resend & Spam Help */}
            <div className="text-center space-y-2">
              {resendCountdown > 0 ? (
                <p className="text-sm text-slate-500">
                  {text.resendIn} <span className="font-bold text-indigo-600">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  {text.resendCode}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSpamHelp(true)}
                className="block w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors underline underline-offset-2"
              >
                {text.codeNotShowing}
              </button>
            </div>

            <Button
              variant="gradient"
              className="w-full h-14 rounded-xl"
              onClick={handleVerifyNewEmail}
              isLoading={isLoading}
            >
              {isLoading ? text.verifying : text.verifyCode}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{text.successTitle}</h3>
            <p className="text-slate-500 mb-6">{text.successDesc}</p>
            <p className="text-indigo-600 font-medium mb-6">{newEmail}</p>
            <Button
              variant="gradient"
              className="w-full h-14 rounded-xl"
              onClick={onClose}
            >
              {text.done}
            </Button>
          </div>
        )}

        {/* Spam Help Modal */}
        {showSpamHelp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
              <button
                type="button"
                onClick={() => setShowSpamHelp(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-3">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{text.spamHelpTitle}</h3>
              </div>
              <ul className="space-y-2 mb-4">
                {text.spamHelpContent.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="gradient"
                className="w-full rounded-xl"
                onClick={() => setShowSpamHelp(false)}
              >
                {text.spamHelpButton}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
