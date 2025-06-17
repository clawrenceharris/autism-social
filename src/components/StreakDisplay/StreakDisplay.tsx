import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useStreakStore } from '../../store/useStreakStore';
import './StreakDisplay.scss';

interface StreakDisplayProps {
  userId: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const StreakDisplay = ({ 
  userId, 
  showIcon = true, 
  showLabel = true,
  size = 'medium',
  className = ''
}: StreakDisplayProps) => {
  const { streakData, fetchStreak, loading, error } = useStreakStore();
  
  useEffect(() => {
    fetchStreak(userId);
  }, [fetchStreak, userId]);

  if (loading) {
    return (
      <div className={`streak-display ${size} ${className}`}>
        <div className="streak-loading">...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`streak-display ${size} ${className}`}>
        <div className="streak-error">!</div>
      </div>
    );
  }

  const currentStreak = streakData?.currentStreak || 0;
  
  return (
    <div className={`streak-display ${size} ${className}`}>
      {showIcon && (
        <div className={`streak-icon ${currentStreak > 0 ? 'active' : ''}`}>
          <Flame size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />
        </div>
      )}
      <div className="streak-count">{currentStreak}</div>
      {showLabel && <div className="streak-label">day streak</div>}
    </div>
  );
};

export default StreakDisplay;