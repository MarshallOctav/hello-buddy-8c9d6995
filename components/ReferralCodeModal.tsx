import React, { useState } from 'react';
import { Modal } from './Modal';
import { Gift, ArrowRight, Loader2, CheckCircle2, XCircle, Tag, Percent, Ticket } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../services/languageContext';
import { validateReferralCode, validateVoucherCode, ValidateCodeResponse, VoucherValidationResponse } from '../services/api';

interface ReferralCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (referralCode: string | null, voucherCode: string | null) => void;
  planName: string;
  planPrice: number;
  isLoading?: boolean;
}

export const ReferralCodeModal: React.FC<ReferralCodeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
  planPrice,
  isLoading = false
}) => {
  const { language } = useLanguage();
  const [referralCode, setReferralCode] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [referralResult, setReferralResult] = useState<{
    valid: boolean;
    message: string;
    discount_percent?: number;
  } | null>(null);
  const [voucherResult, setVoucherResult] = useState<{
    valid: boolean;
    message: string;
    discount_percent?: number;
  } | null>(null);

  const content = {
    id: {
      title: 'Punya Kode Promo?',
      subtitle: 'Masukkan kode referral atau voucher untuk mendapatkan diskon',
      referralPlaceholder: 'Kode Referral (opsional)',
      voucherPlaceholder: 'Kode Voucher (opsional)',
      skip: 'Lewati & Lanjut Bayar',
      apply: 'Cek',
      continue: 'Lanjut ke Pembayaran',
      validating: 'Memvalidasi...',
      validCode: 'Kode valid!',
      invalidCode: 'Kode tidak valid',
      processing: 'Memproses...',
      priceDetails: 'Rincian Harga',
      originalPrice: 'Harga Asli',
      referralDiscount: 'Diskon Referral',
      voucherDiscount: 'Diskon Voucher',
      totalPayable: 'Total Bayar'
    },
    en: {
      title: 'Have a Promo Code?',
      subtitle: 'Enter a referral or voucher code to get a discount',
      referralPlaceholder: 'Referral Code (optional)',
      voucherPlaceholder: 'Voucher Code (optional)',
      skip: 'Skip & Pay Now',
      apply: 'Check',
      continue: 'Continue to Payment',
      validating: 'Validating...',
      validCode: 'Valid code!',
      invalidCode: 'Invalid code',
      processing: 'Processing...',
      priceDetails: 'Price Details',
      originalPrice: 'Original Price',
      referralDiscount: 'Referral Discount',
      voucherDiscount: 'Voucher Discount',
      totalPayable: 'Total Payable'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const handleValidateReferral = async () => {
    if (!referralCode.trim()) return;
    setIsValidatingReferral(true);
    setReferralResult(null);
    try {
      const response = await validateReferralCode(referralCode.trim());
      if (response.success && response.data) {
        setReferralResult({ valid: true, message: t.validCode, discount_percent: response.data.discount_percentage });
      } else {
        setReferralResult({ valid: false, message: response.message || t.invalidCode });
      }
    } catch {
      setReferralResult({ valid: false, message: t.invalidCode });
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherResult(null);
    try {
      const response = await validateVoucherCode(voucherCode.trim());
      if (response.success && response.data) {
        setVoucherResult({ valid: true, message: t.validCode, discount_percent: response.data.discount_percent });
      } else {
        setVoucherResult({ valid: false, message: response.message || t.invalidCode });
      }
    } catch {
      setVoucherResult({ valid: false, message: t.invalidCode });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const referralDiscount = referralResult?.valid && referralResult.discount_percent 
    ? Math.round(planPrice * referralResult.discount_percent / 100) : 0;
  const voucherDiscountAmount = voucherResult?.valid && voucherResult.discount_percent 
    ? Math.round(planPrice * voucherResult.discount_percent / 100) : 0;
  const totalDiscount = referralDiscount + voucherDiscountAmount;
  const finalPrice = Math.max(0, planPrice - totalDiscount);

  const handleConfirm = () => {
    onConfirm(
      referralResult?.valid ? referralCode.trim() : null,
      voucherResult?.valid ? voucherCode.trim() : null
    );
  };

  const handleSkip = () => onConfirm(null, null);

  const handleClose = () => {
    setReferralCode('');
    setVoucherCode('');
    setReferralResult(null);
    setVoucherResult(null);
    onClose();
  };

  const hasValidCode = referralResult?.valid || voucherResult?.valid;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t.title}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <p className="text-slate-600">{t.subtitle}</p>
          <p className="mt-2 text-sm font-medium text-indigo-600">{language === 'id' ? 'Untuk paket' : 'For'} {planName}</p>
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Gift className="h-4 w-4" /> {language === 'id' ? 'Kode Referral' : 'Referral Code'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralResult(null); }}
              placeholder={t.referralPlaceholder}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-mono uppercase tracking-widest focus:border-indigo-500 focus:outline-none transition-all"
              disabled={isLoading || isValidatingReferral}
            />
            <Button variant="secondary" onClick={handleValidateReferral} disabled={!referralCode.trim() || isValidatingReferral || isLoading} className="px-4">
              {isValidatingReferral ? <Loader2 className="h-5 w-5 animate-spin" /> : t.apply}
            </Button>
          </div>
          {referralResult && !referralResult.valid && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-700 text-sm">
              <XCircle className="h-4 w-4" /> {referralResult.message}
            </div>
          )}
          {referralResult?.valid && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4" /> {referralResult.message} ({referralResult.discount_percent}% off)
            </div>
          )}
        </div>

        {/* Voucher Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Ticket className="h-4 w-4" /> {language === 'id' ? 'Kode Voucher' : 'Voucher Code'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherResult(null); }}
              placeholder={t.voucherPlaceholder}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-mono uppercase tracking-widest focus:border-indigo-500 focus:outline-none transition-all"
              disabled={isLoading || isValidatingVoucher}
            />
            <Button variant="secondary" onClick={handleValidateVoucher} disabled={!voucherCode.trim() || isValidatingVoucher || isLoading} className="px-4">
              {isValidatingVoucher ? <Loader2 className="h-5 w-5 animate-spin" /> : t.apply}
            </Button>
          </div>
          {voucherResult && !voucherResult.valid && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-700 text-sm">
              <XCircle className="h-4 w-4" /> {voucherResult.message}
            </div>
          )}
          {voucherResult?.valid && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4" /> {voucherResult.message} ({voucherResult.discount_percent}% off)
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        {hasValidCode && (
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <Tag className="h-5 w-5" /> {t.priceDetails}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.originalPrice}</span>
                <span className="line-through">Rp {planPrice.toLocaleString('id-ID')}</span>
              </div>
              {referralDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t.referralDiscount} ({referralResult?.discount_percent}%)</span>
                  <span>- Rp {referralDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {voucherDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t.voucherDiscount} ({voucherResult?.discount_percent}%)</span>
                  <span>- Rp {voucherDiscountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-slate-800">{t.totalPayable}</span>
                <span className="text-xl font-bold text-green-600">Rp {finalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <Button variant="gradient" className="w-full h-14 rounded-2xl shadow-lg shadow-indigo-500/30" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.processing}</> : <>{t.continue}<ArrowRight className="ml-2 h-5 w-5" /></>}
          </Button>
          {!hasValidCode && (
            <button onClick={handleSkip} disabled={isLoading} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2 transition-colors disabled:opacity-50">
              {t.skip}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};