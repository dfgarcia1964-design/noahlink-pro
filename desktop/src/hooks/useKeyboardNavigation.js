import { useEffect, useRef } from 'react';

const useKeyboardNavigation = (items = [], onSelect = null) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect?.(items[selectedIndex]);
          break;
        default:
          break;
      }
    };

    containerRef.current?.addEventListener('keydown', handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, selectedIndex, onSelect]);

  return {
    containerRef,
    selectedIndex,
    setSelectedIndex
  };
};

export default useKeyboardNavigation;
