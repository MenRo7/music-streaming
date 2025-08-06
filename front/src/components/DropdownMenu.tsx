import React, { useState, useRef, useEffect, ReactNode } from 'react';
import '../styles/DropdownMenu.css';

interface DropdownItem {
  label: string;
  onClick: () => void;
  customContent?: ReactNode;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger: ReactNode;
  menuClassName?: string;
  wrapperClassName?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  menuClassName = '',
  wrapperClassName = ''
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown-wrapper ${wrapperClassName}`}>
      <div ref={triggerRef} onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {open && (
        <div ref={menuRef} className={`dropdown-menu ${menuClassName}`}>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.customContent ? (
                  item.customContent
                ) : (
                  <button className="dropdown-item" onClick={() => { item.onClick?.(); setOpen(false); }}>
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
