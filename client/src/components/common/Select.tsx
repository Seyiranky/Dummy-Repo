import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

const Select = ({ value, onChange, options, placeholder, id }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedLabel = options[selectedIndex]?.label;

  const commit = (index: number) => {
    if (index < 0 || index >= options.length) return;
    onChange(options[index].value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) commit(highlighted >= 0 ? highlighted : selectedIndex);
      else setOpen(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlighted((i) => Math.min(i + 1, options.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <div className="select" ref={containerRef}>
      <button
        type="button"
        id={id}
        className="select-trigger"
        onClick={() => {
          setOpen((o) => !o);
          setHighlighted(selectedIndex);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selectedLabel ?? placeholder ?? 'Select...'}</span>
        <span className="select-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className="select-options" role="listbox">
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={[
                'select-option',
                option.value === value ? 'selected' : '',
                index === highlighted ? 'highlighted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setHighlighted(index)}
              onClick={(e) => {
                // These forms wrap controls in <label>...</label>. A native browser
                // behavior forwards clicks on any non-form-control descendant of a
                // <label> to the label's associated control (our trigger button),
                // which would re-open the dropdown right after this closes it.
                // preventDefault() here suppresses that forwarded default action.
                e.preventDefault();
                commit(index);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
