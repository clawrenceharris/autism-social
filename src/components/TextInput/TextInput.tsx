import React, { forwardRef } from "react";
import "./TextInput.css";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerStyle?: React.CSSProperties;
  icon?: React.ReactNode;
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
      description,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="input-container" style={containerStyle}>
        <input
          ref={ref}
          style={style}
          type="text"
          className="text-input"
          {...rest}
        />
        <button type="button" onClick={onIconClick} className="icon">
          {icon && icon}
        </button>

        {description && <p className="description">{description}</p>}
      </div>
    );
  }
);

export default TextInput;
