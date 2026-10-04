import React, { useState } from 'react';
import useLazyLoad from '../hooks/useLazyLoad';

const OptimizedImage = ({ src, alt, width, height, placeholder, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, isVisible } = useLazyLoad();

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {!loaded && placeholder && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '12px'
        }}>
          {placeholder}
        </div>
      )}

      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0.5,
            transition: 'opacity 0.3s ease'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
