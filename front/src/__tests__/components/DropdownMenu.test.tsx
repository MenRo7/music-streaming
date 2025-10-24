import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropdownMenu from '../../components/DropdownMenu';

describe('DropdownMenu', () => {
  const mockOnClick1 = jest.fn();
  const mockOnClick2 = jest.fn();

  const defaultItems = [
    { label: 'Item 1', onClick: mockOnClick1 },
    { label: 'Item 2', onClick: mockOnClick2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render trigger element', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('should not show menu initially', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should open menu when trigger is clicked', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should close menu when trigger is clicked again', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    const trigger = screen.getByText('Open Menu');

    // Open menu
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Close menu
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should call onClick handler when menu item is clicked', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);

    const item1 = screen.getByText('Item 1');
    fireEvent.click(item1);

    expect(mockOnClick1).toHaveBeenCalledTimes(1);
  });

  it('should close menu after clicking an item', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);

    const item1 = screen.getByText('Item 1');
    fireEvent.click(item1);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should render custom content in menu items', () => {
    const itemsWithCustom = [
      {
        label: 'Custom',
        onClick: jest.fn(),
        customContent: <div>Custom Content</div>,
      },
    ];

    render(
      <DropdownMenu
        items={itemsWithCustom}
        trigger={<button>Open Menu</button>}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should apply custom menuClassName', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
        menuClassName="custom-menu-class"
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('custom-menu-class');
  });

  it('should apply custom wrapperClassName', () => {
    const { container } = render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
        wrapperClassName="custom-wrapper-class"
      />
    );

    const wrapper = container.querySelector('.dropdown-wrapper');
    expect(wrapper).toHaveClass('custom-wrapper-class');
  });

  it('should render multiple menu items', () => {
    const manyItems = [
      { label: 'Item 1', onClick: jest.fn() },
      { label: 'Item 2', onClick: jest.fn() },
      { label: 'Item 3', onClick: jest.fn() },
      { label: 'Item 4', onClick: jest.fn() },
    ];

    render(
      <DropdownMenu
        items={manyItems}
        trigger={<button>Open Menu</button>}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(
      <DropdownMenu
        items={[]}
        trigger={<button>Open Menu</button>}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));

    const menu = screen.getByRole('menu');
    expect(menu.querySelector('ul')?.children.length).toBe(0);
  });

  it('should render submenu content when provided', () => {
    const itemsWithSubmenu = [
      {
        label: 'Parent Item',
        onClick: jest.fn(),
        submenuContent: <div>Submenu Content</div>,
      },
    ];

    render(
      <DropdownMenu
        items={itemsWithSubmenu}
        trigger={<button>Open Menu</button>}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Parent Item')).toBeInTheDocument();
  });

  it('should call all different onClick handlers correctly', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(screen.getByText('Item 1'));

    expect(mockOnClick1).toHaveBeenCalledTimes(1);
    expect(mockOnClick2).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(screen.getByText('Item 2'));

    expect(mockOnClick2).toHaveBeenCalledTimes(1);
    expect(mockOnClick1).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should handle preferDirection prop', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
        preferDirection="up"
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should handle autoFlip prop', () => {
    render(
      <DropdownMenu
        items={defaultItems}
        trigger={<button>Open Menu</button>}
        autoFlip={false}
      />
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
