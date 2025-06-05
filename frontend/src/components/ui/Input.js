import React from 'react';

/**
 * Input Component - A reusable UI input field.
 *
 * Props:
 *  - label (String): Text for the input field's label.
 *  - type (String): HTML input type (e.g., 'text', 'email', 'password'). Defaults to 'text'.
 *  - name (String): Name attribute for the input field.
 *  - value (String | Number): Current value of the input field.
 *  - onChange (Function): Handler for value changes.
 *  - placeholder (String): Placeholder text for the input field.
 *  - error (String): Error message to display below the input. If provided, input border turns red.
 *  - className (String): Additional Tailwind classes for the wrapper div.
 *  - inputClassName (String): Additional Tailwind classes for the input element itself.
 *  - disabled (Boolean): If true, the input is disabled. Defaults to false.
 *  - required (Boolean): If true, adds a visual indicator (asterisk) and HTML5 required attribute.
 *  - leadingIcon (Node): Optional icon to display inside the input, on the left.
 *  - trailingIcon (Node): Optional icon to display inside the input, on the right (e.g., password visibility toggle).
 */
const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      name,
      value,
      onChange,
      placeholder,
      error,
      className = '',
      inputClassName = '',
      disabled = false,
      required = false,
      leadingIcon = null,
      trailingIcon = null,
      ...props
    },
    ref
  ) => {
    const baseInputStyles =
      'block w-full appearance-none bg-primary-bg border rounded-lg shadow-sm placeholder-text-medium/70 focus:outline-none sm:text-sm';
    
    const focusStyles = 'focus:ring-2 focus:ring-accent focus:border-accent';
    const errorStyles = error ? 'border-error text-error focus:ring-error focus:border-error' : 'border-border-color';
    const disabledStyles = disabled ? 'bg-border-color/30 cursor-not-allowed opacity-70' : '';

    const paddingStyles = leadingIcon && trailingIcon ? 'px-10 py-2.5' 
                        : leadingIcon ? 'pl-10 pr-3 py-2.5' 
                        : trailingIcon ? 'pr-10 pl-3 py-2.5' 
                        : 'px-3 py-2.5';

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-text-medium mb-1">
            {label} {required && <span className="text-accent">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leadingIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              {React.cloneElement(leadingIcon, { className: `h-5 w-5 ${error ? 'text-error' : 'text-text-medium'}` })}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              ${baseInputStyles}
              ${paddingStyles}
              ${errorStyles}
              ${focusStyles}
              ${disabledStyles}
              ${inputClassName}
            `}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {React.cloneElement(trailingIcon, { className: `h-5 w-5 ${error ? 'text-error' : 'text-text-medium'}` })}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
