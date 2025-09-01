import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../styles/DropdownMenu.css';

interface DropdownItem {
  label: string;
  onClick: () => void;
  customContent?: ReactNode;
  submenuContent?: ReactNode;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger: ReactNode;
  menuClassName?: string;
  wrapperClassName?: string;
}

type Pos = { top: number; left: number; minWidth?: number };

const MENU_MIN_WIDTH = 180;
const SUBMENU_MIN_WIDTH = 220;
const GUTTER = 8;

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  menuClassName = '',
  wrapperClassName = ''
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);
  const [submenuPos, setSubmenuPos] = useState<Pos | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const computeMenuPos = () => {
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

  const computeSubmenuPos = (index: number, width = SUBMENU_MIN_WIDTH) => {
    const li = itemRefs.current[index];
    if (!li) return;
    const r = li.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const preferRight = r.right + 8 + width + GUTTER <= vw;
    const left = preferRight ? r.right + 8 : Math.max(GUTTER, r.left - width - 8);
    const top = Math.min(Math.max(GUTTER, r.top), vh - GUTTER);

    setSubmenuPos({ top, left, minWidth: width });
  };

  useEffect(() => {
    if (!open) return;
    computeMenuPos();
    const onScroll = () => {
      computeMenuPos();
      if (openSubIndex !== null) computeSubmenuPos(openSubIndex);
    };
    const onResize = onScroll;
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, openSubIndex]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      const insideTrigger = !!triggerRef.current?.contains(t);
      const insideMenu = !!menuRef.current?.contains(t);
      const insideSubmenu = !!submenuRef.current?.contains(t);
      if (!insideTrigger && !insideMenu && !insideSubmenu) {
        setOpen(false);
        setOpenSubIndex(null);
      }
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
              {items.map((item, index) => {
                if (item.customContent && !item.submenuContent) {
                  return (
                    <li
                      key={index}
                      ref={el => (itemRefs.current[index] = el)}
                      className="dropdown-custom"
                    >
                      {item.customContent}
                    </li>
                  );
                }

                if (item.submenuContent) {
                  const isOpen = openSubIndex === index;
                  return (
                    <li
                      key={index}
                      ref={el => (itemRefs.current[index] = el)}
                      className={`dropdown-li--submenu ${isOpen ? 'open' : ''}`}
                      onMouseEnter={() => {
                        setOpenSubIndex(index);
                        computeSubmenuPos(index);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = openSubIndex === index ? null : index;
                        setOpenSubIndex(next);
                        if (next !== null) computeSubmenuPos(index);
                      }}
                    >
                      <button className="dropdown-item dropdown-submenu-toggle">
                        <span>{item.label}</span>
                        <span className="submenu-caret" aria-hidden>›</span>
                      </button>

                      {isOpen && submenuPos &&
                        createPortal(
                          <div
                            ref={submenuRef}
                            className="dropdown-menu dropdown-submenu-flyout"
                            style={{ top: submenuPos.top, left: submenuPos.left, minWidth: submenuPos.minWidth }}
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.submenuContent}
                          </div>,
                          document.body
                        )
                      }
                    </li>
                  );
                }

                return (
                  <li key={index} ref={el => (itemRefs.current[index] = el)}>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                        setOpenSubIndex(null);
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default DropdownMenu;
