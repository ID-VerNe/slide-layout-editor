import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgendaField } from '../AgendaField';
import React from 'react';

// Mock FieldWrapper to be a simple pass-through (avoids ZineStylePanel complexity)
vi.mock('../FieldWrapper', () => ({
  FieldWrapper: ({ children, label, icon: Icon }: any) => (
    <div data-testid="field-wrapper">
      <span data-testid="wrapper-label">{label}</span>
      {Icon && <Icon data-testid="wrapper-icon" size={12} />}
      {children}
    </div>
  ),
}));

// Mock lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
  };
});

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  title: 'Test Page',
  agenda: [
    {
      id: 'agenda-1',
      title: 'Introduction',
      subtitle: 'Overview',
      time: '2024-01',
      location: 'Room A',
      description: 'Opening remarks',
      items: [],
    },
    {
      id: 'agenda-2',
      title: 'Keynote',
      subtitle: 'Main talk',
      time: '2024-02',
      location: 'Hall B',
      description: 'Featured presentation',
      items: [],
    },
  ],
};

const emptyPage: any = {
  id: 'p2',
  type: 'slide',
  layoutId: 'modern-feature',
  title: 'Empty Agenda',
};

const noop = () => {};

describe('AgendaField', () => {
  it('renders label with default value when no label prop given', () => {
    render(<AgendaField page={basePage} onUpdate={noop} />);
    expect(screen.getByTestId('wrapper-label')).toHaveTextContent(
      'Agenda Sections',
    );
  });

  it('renders all agenda items from page data', () => {
    render(<AgendaField page={basePage} onUpdate={noop} />);
    expect(screen.getByDisplayValue('Introduction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Keynote')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Room A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hall B')).toBeInTheDocument();
  });

  it('renders "Add Entry" button', () => {
    render(<AgendaField page={basePage} onUpdate={noop} />);
    expect(screen.getByText('Add Entry')).toBeInTheDocument();
  });

  it('calls onUpdate with new entry when Add Entry is clicked', () => {
    const onUpdate = vi.fn();
    render(<AgendaField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Add Entry'));

    expect(onUpdate).toHaveBeenCalledOnce();
    const updatedPage = onUpdate.mock.calls[0][0];
    expect(updatedPage.agenda).toHaveLength(3);
    expect(updatedPage.agenda[2].title).toBe('New Entry');
    expect(updatedPage.agenda[2].subtitle).toBe('Sub-entry details');
  });

  it('adds entry to empty agenda list', () => {
    const onUpdate = vi.fn();
    render(<AgendaField page={emptyPage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Add Entry'));

    expect(onUpdate).toHaveBeenCalledOnce();
    const updatedPage = onUpdate.mock.calls[0][0];
    expect(updatedPage.agenda).toHaveLength(1);
    expect(updatedPage.agenda[0].title).toBe('New Entry');
  });

  it('edits an agenda field value and calls onUpdate', () => {
    const onUpdate = vi.fn();
    render(<AgendaField page={basePage} onUpdate={onUpdate} />);

    const titleInput = screen.getByDisplayValue('Introduction');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    expect(onUpdate).toHaveBeenCalledOnce();
    const updatedPage = onUpdate.mock.calls[0][0];
    expect(updatedPage.agenda[0].title).toBe('Updated Title');
    // Other items should remain unchanged
    expect(updatedPage.agenda[1].title).toBe('Keynote');
  });

  it('removes an agenda item when remove button is clicked', () => {
    const onUpdate = vi.fn();
    render(<AgendaField page={basePage} onUpdate={onUpdate} />);

    // Find all remove buttons (X icons inside buttons)
    const removeButtons = document.querySelectorAll(
      'button.absolute.-top-2.-right-2',
    );
    expect(removeButtons.length).toBe(2);

    // Click first remove button
    fireEvent.click(removeButtons[0]);

    expect(onUpdate).toHaveBeenCalledOnce();
    const updatedPage = onUpdate.mock.calls[0][0];
    expect(updatedPage.agenda).toHaveLength(1);
    expect(updatedPage.agenda[0].id).toBe('agenda-2');
  });

  it('renders custom label when provided', () => {
    render(
      <AgendaField page={basePage} onUpdate={noop} label="Custom Label" />,
    );
    expect(screen.getByTestId('wrapper-label')).toHaveTextContent(
      'Custom Label',
    );
  });
});
