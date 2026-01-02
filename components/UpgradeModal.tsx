
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Crown, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import Button from './Button';
import { AccessLevel } from '../types';
import { useLanguage } from '../services/languageContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredLevel: AccessLevel;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  requiredLevel
}) => {
  const navigate = useNavigate();
  const { content, language } = useLanguage();
  const isPro = requiredLevel === AccessLevel.PRO;

  const handleViewPlans = () => {
    onClose();
    navigate('/plans');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader>
      <div className="text-center p-6">
        {/* Icon */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
          isPro 
            ? 'bg-gradient-to-br from-blue-100 to-blue-200' 
            : 'bg-gradient-to-br from-purple-100 to-purple-200'
        }`}>
          {isPro ? (
            <Star className="h-10 w-10 text-blue-600" />
          ) : (
            <Crown className="h-10 w-10 text-purple-600" />
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-black mb-3 ${
          isPro ? 'text-blue-600' : 'text-purple-600'
        }`}>
          {isPro ? content.featureLock.proTitle : content.featureLock.premiumTitle}
        </h2>

        {/* Message */}
        <p className="text-slate-600 mb-8 leading-relaxed max-w-sm mx-auto">
          {isPro ? content.featureLock.proMessage : content.featureLock.premiumMessage}
        </p>

        {/* Benefits Preview */}
        <div className={`mb-8 p-4 rounded-2xl ${
          isPro ? 'bg-blue-50' : 'bg-purple-50'
        }`}>
          <p className="text-sm font-bold text-slate-700 mb-3">
            {language === 'id' ? 'Keuntungan yang Anda dapatkan:' : 'Benefits you get:'}
          </p>
          <ul className="text-sm text-slate-600 space-y-2">
            {isPro ? (
              <>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  {language === 'id' ? 'Akses semua tes Pro' : 'Access all Pro tests'}
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  {language === 'id' ? 'Laporan PDF detail' : 'Detailed PDF reports'}
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  {language === 'id' ? 'Rekomendasi personal' : 'Personal recommendations'}
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  {language === 'id' ? 'Akses semua fitur' : 'Access all features'}
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  {language === 'id' ? 'Laporan konsolidasi' : 'Consolidated reports'}
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  {language === 'id' ? 'Konsultasi AI premium' : 'Premium AI consultation'}
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleViewPlans}
            variant={isPro ? 'primary' : 'gradient'}
            className={`w-full h-12 text-base font-bold rounded-xl ${
              isPro 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            {content.featureLock.viewPlans}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {language === 'id' ? 'Nanti saja' : 'Maybe later'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
