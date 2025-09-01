import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
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

type Pos = { top: number; left: number; minWidth?: number };

const MENU_MIN_WIDTH = 180;
const GUTTER = 8;

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  menuClassName = '',
  wrapperClassName = ''
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const computePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = Math.min(r.bottom + GUTTER, vh - GUTTER);
    let left = Math.min(
      Math.max(GUTTER, r.right - MENU_MIN_WIDTH),
      vw - MENU_MIN_WIDTH - GUTTER
    );

    setPos({ top, left, minWidth: Math.max(MENU_MIN_WIDTH, r.width) });
  };

  useEffect(() => {
    if (!open) return;
    computePos();
    const onScroll = () => computePos();
    const onResize = () => computePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      const insideTrigger = !!triggerRef.current?.contains(t);
      const insideMenu = !!menuRef.current?.contains(t);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  return (
    <div className={`dropdown-wrapper ${wrapperClassName}`}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger}
      </div>

      {open && pos &&
        createPortal(
          <div
            ref={menuRef}
            className={`dropdown-menu dropdown-portal-menu ${menuClassName}`}
            style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}
            role="menu"
          >
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  {item.customContent ? (
                    item.customContent
                  ) : (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default DropdownMenu;
