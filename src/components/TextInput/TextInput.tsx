import React, { forwardRef } from "react";
import "./TextInput.css";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerStyle?: React.CSSProperties;
  icon?: React.ReactElement;
  iconStyle?: React.CSSProperties;
  iconSize?: number | string;
  description?: string | React.ReactNode | null;
  onIconClick?: () => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      icon,
      onIconClick,
      containerStyle,
      style,
      iconStyle,
      iconSize,
      description,
      ...rest
    },
    ref
  ) => {
    const iconElement = icon && React.isValidElement(icon)
      ? React.cloneElement(icon, {
          style: { ...iconStyle },
          size: iconSize,
        })
      : null;

    return (
      <div className="input-container" style={containerStyle}>
        <input
          ref={ref}
          style={style}
          type="text"
          className="form-input"
          {...rest}
        />
        {iconElement && (
          <button type="button" onClick={onIconClick} className="icon">
            {iconElement}
          </button>
        )}
        {description && <p className="description">{description}</p>}
      </div>
    );
  }
);

export default TextInput;