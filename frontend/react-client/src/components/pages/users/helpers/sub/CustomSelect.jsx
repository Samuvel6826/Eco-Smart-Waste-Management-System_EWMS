import React, { useEffect, useState, useRef } from 'react';

export const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    disabled = false,
    error,
    touched,
    helperText,
    name,
    onBlur
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionsRef = useRef([]);

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredOptions]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options
    useEffect(() => {
        setFilteredOptions(
            options.filter(option =>
                option.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, options]);

    const selectedOption = options.find(opt => opt.isoCode === value);

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
            optionsRef.current[highlightedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [highlightedIndex]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                return;
            }
        }

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : prev
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    onChange({
                        target: {
                            value: filteredOptions[highlightedIndex].isoCode,
                            name
                        }
                    });
                    setIsOpen(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                }
                break;
            case 'Tab':
                if (isOpen) {
                    setIsOpen(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className="relative mb-4" ref={dropdownRef}>
            {/* Label */}
            <label
                className="mb-1.5 block text-sm font-medium text-gray-700"
                htmlFor={`select-${name}`}
            >
                {label}
                <span className="ml-1 text-red-500">*</span>
            </label>

            {/* Main button */}
            <button
                id={`select-${name}`}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`
                    w-full px-4 py-2.5 
                    text-left
                    bg-white
                    border rounded-lg
                    flex items-center justify-between
                    transition-colors duration-200
                    ${touched && error ? 'border-red-500 hover:border-red-600' : 'border-gray-300 hover:border-gray-400'}
                    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : 'hover:bg-gray-50'}
                    focus:outline-none focus:ring-2 
                    ${touched && error ? 'focus:ring-red-200' : 'focus:ring-blue-200'}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                name={name}
            >
                <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.name : `Select ${label}`}
                </span>
                <svg
                    className={`w-5 h-5 transition-transform duration-200 
                        ${touched && error ? 'text-red-400' : 'text-gray-400'}
                        ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div
                    className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                    role="listbox"
                    onKeyDown={handleKeyDown}
                >
                    {/* Search input */}
                    <div className="border-b border-gray-200 p-2">
                        <input
                            type="text"
                            ref={searchInputRef}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder={`Search ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto overscroll-contain">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-center text-sm text-gray-500">
                                No results found
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredOptions.map((option, index) => (
                                    <div
                                        key={option.isoCode}
                                        ref={el => optionsRef.current[index] = el}
                                        className={`
                                            px-4 py-2.5 text-sm cursor-pointer
                                            flex items-center justify-between
                                            ${option.isoCode === value
                                                ? 'bg-blue-50 text-blue-700'
                                                : index === highlightedIndex
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }
                                        `}
                                        onClick={() => {
                                            onChange({ target: { value: option.isoCode, name } });
                                            setIsOpen(false);
                                            setSearchTerm('');
                                            setHighlightedIndex(-1);
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        role="option"
                                        aria-selected={option.isoCode === value}
                                    >
                                        <span className="truncate">{option.name}</span>
                                        {option.isoCode === value && (
                                            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error message */}
            {touched && error && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}

            {/* Helper text */}
            {helperText && (
                <p className="mt-1.5 text-sm text-gray-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default CustomSelect;