import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back to List',
  className = 'btn btn-outline-secondary',
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
    >
      <i className="bi bi-arrow-left me-2"></i>
      {label}
    </button>
  );
};

export default BackButton;

