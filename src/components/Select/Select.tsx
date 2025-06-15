import React, { forwardRef, useRef, useState } from "react";
import "./Select.css";
import { X } from "lucide-react";

type Option = {
  value: string;
  key?: string | number;
};

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: Option[];
  canCreateOption?: boolean;
  onOptionSelect?: (option: Option) => void;
  style?: React.CSSProperties;
}

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    { options, onOptionSelect, canCreateOption = false, style, ...props },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(props.value);
    const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
    const [showOptions, setShowOptions] = useState(false);

    const optionsRef = useRef<HTMLDivElement>(null);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (props.onChange) {
        props.onChange(e);
      }
      setInputValue(value);
      setFilteredOptions(
        options.filter((option) =>
          option.value.toLowerCase().includes(value.toLowerCase())
        )
      );
      setShowOptions(true);
    };

    const handleOptionChange = (option: Option) => {
      setShowOptions(false);
      setInputValue(option.value);
      if (onOptionSelect) {
        onOptionSelect(option);
      }
    };
    const handleClose = () => {
      setShowOptions(false);
    };
    return (
      <div style={style} className="select-container">
        <div className="search-container">
          <button onClick={handleClose} className="clear-search">
            <X size={16} />
          </button>
          <input
            ref={ref}
            type="text"
            onFocus={() => setShowOptions(true)}
            placeholder="Search scenarios..."
            value={inputValue}
            onChange={handleInputChange}
            {...props}
          />
        </div>

        {showOptions && (
          <div ref={optionsRef} className="options-list">
            {filteredOptions.map((option) => (
              <div
                role="button"
                key={option.key}
                onClick={() => handleOptionChange(option)}
                className="option-item"
              >
                {option.value}
              </div>
            ))}
            {inputValue &&
              canCreateOption &&
              !filteredOptions
                .map((item) => item.value)
                .includes(inputValue.toString().toLowerCase()) && (
                <li
                  className="option-item"
                  onClick={() =>
                    handleOptionChange({
                      value: inputValue.toString(),
                      key: options.length,
                    })
                  }
                >
                  "{inputValue}"
                </li>
              )}
          </div>
        )}
      </div>
    );
  }
);

export default Select;
