import React from 'react';

const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaPressed = false,
  ariaDescribedBy,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? '#64748b' : '#2563eb',
      color: '#ffffff'
    },
    secondary: {
      backgroundColor: disabled ? '#64748b' : '#6b7280',
      color: '#ffffff'
    },
    danger: {
      backgroundColor: disabled ? '#64748b' : '#ef4444',
      color: '#ffffff'
    },
    success: {
      backgroundColor: disabled ? '#64748b' : '#22c55e',
      color: '#ffffff'
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-describedby={ariaDescribedBy}
      style={{
        ...variantStyles[variant],
        padding: '12px 16px',
        border: '2px solid transparent',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1,
        minHeight: '44px',
        ...props.style
      }}
      className={className}
      onFocus={(e) => {
        e.target.style.outline = '2px solid #3b82f6';
        e.target.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.target.style.outline = 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default AccessibleButton;
