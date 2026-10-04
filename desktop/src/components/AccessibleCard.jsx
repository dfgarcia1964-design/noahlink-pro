import React from 'react';

const AccessibleCard = ({
  title,
  description,
  children,
  ariaLabel,
  role = 'article',
  ...props
}) => {
  return (
    <article
      role={role}
      aria-label={ariaLabel || title}
      style={{
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        marginBottom: '16px'
      }}
      {...props}
    >
      {title && (
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '700',
          color: '#f1f5f9'
        }}>
          {title}
        </h2>
      )}

      {description && (
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '13px',
          color: '#cbd5e1',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      )}

      {children}
    </article>
  );
};

export default AccessibleCard;
