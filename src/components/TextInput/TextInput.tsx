import React, { forwardRef } from "react";
import "./TextInput.scss";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerStyle?: React.CSSProperties;
  icon?: React.ReactElement;
  description?: string | React.ReactNode | null;
  onIconClick?: () => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ icon, onIconClick, containerStyle, style, description, ...rest }, ref) => {
    return (
      <div className="input-container" style={containerStyle}>
        <input
          ref={ref}
          style={style}
          type="text"
          className="form-input"
          {...rest}
        />
        {icon && (
          <button type="button" onClick={onIconClick} className="icon">
            {icon}
          </button>
        )}
        {description && <p className="description">{description}</p>}
      </div>
    );
  }
);

export default TextInput;
