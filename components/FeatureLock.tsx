
import React from 'react';
import { Star, Crown } from 'lucide-react';
import { AccessLevel } from '../types';

interface FeatureLockProps {
  requiredLevel: AccessLevel;
  userLevel: AccessLevel;
  onLockedClick: () => void;
  children: React.ReactNode;
  className?: string;
}

// Helper to check if user has access
export const canAccess = (userLevel: AccessLevel, requiredLevel: AccessLevel): boolean => {
  const levelOrder = { [AccessLevel.FREE]: 0, [AccessLevel.PRO]: 1, [AccessLevel.PREMIUM]: 2 };
  return levelOrder[userLevel] >= levelOrder[requiredLevel];
};

export const FeatureLockBadge = ({ 
  requiredLevel, 
  onClick,
  className = ''
}: { 
  requiredLevel: AccessLevel; 
  onClick: () => void;
  className?: string;
}) => {
  const isPro = requiredLevel === AccessLevel.PRO;
  const isPremium = requiredLevel === AccessLevel.PREMIUM;

  if (!isPro && !isPremium) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center justify-center rounded-full p-1 transition-all hover:scale-110 ${
        isPro 
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
      } ${className}`}
      title={isPro ? 'Pro Feature' : 'Premium Feature'}
    >
      {isPro ? <Star className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
    </button>
  );
};

export const FeatureLock: React.FC<FeatureLockProps> = ({
  requiredLevel,
  userLevel,
  onLockedClick,
  children,
  className = ''
}) => {
  const hasAccess = canAccess(userLevel, requiredLevel);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onLockedClick}
    >
      {children}
      <div className="absolute top-2 right-2">
        <FeatureLockBadge requiredLevel={requiredLevel} onClick={onLockedClick} />
      </div>
    </div>
  );
};

export default FeatureLock;
