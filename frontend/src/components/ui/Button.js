import React from 'react';

/**
 * Button Component - A reusable UI button.
 *
 * Props:
 *  - children (Node): The content of the button.
 *  - onClick (Function): Click event handler.
 *  - type (String): HTML button type ('button', 'submit', 'reset'). Defaults to 'button'.
 *  - variant (String): Style variant ('primary', 'secondary', 'outline', 'danger', 'ghost'). Defaults to 'primary'.
 *  - size (String): Size of the button ('sm', 'md', 'lg'). Defaults to 'md'.
 *  - className (String): Additional Tailwind classes for customization.
 *  - disabled (Boolean): If true, the button is disabled. Defaults to false.
 *  - fullWidth (Boolean): If true, button takes full width of its container. Defaults to false.
 *  - leadingIcon (Node): Optional icon to display before the text.
 *  - trailingIcon (Node): Optional icon to display after the text.
 */
const Button = React.forwardRef(
  (
    {
      children,
      onClick,
      type = 'button',
      variant = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      fullWidth = false,
      leadingIcon = null,
      trailingIcon = null,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-bg transition-all duration-150 ease-in-out';

    const variantStyles = {
      primary: `bg-accent text-white hover:bg-red-700 focus:ring-accent ${disabled ? 'bg-accent/60 hover:bg-accent/60 cursor-not-allowed' : ''}`,
      secondary: `bg-secondary-bg text-text-light hover:bg-opacity-80 border border-border-color focus:ring-border-color ${disabled ? 'bg-opacity-60 hover:bg-opacity-60 cursor-not-allowed' : ''}`,
      outline: `bg-transparent text-accent hover:bg-accent hover:text-white border-2 border-accent focus:ring-accent ${disabled ? 'text-accent/60 border-accent/60 hover:bg-transparent hover:text-accent/60 cursor-not-allowed' : ''}`,
      danger: `bg-error text-white hover:bg-red-700 focus:ring-error ${disabled ? 'bg-error/60 hover:bg-error/60 cursor-not-allowed' : ''}`,
      ghost: `bg-transparent text-accent hover:bg-accent/10 focus:ring-accent ${disabled ? 'text-accent/60 hover:bg-transparent cursor-not-allowed' : ''}`,
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyle}
          ${className}
        `}
        {...props}
      >
        {leadingIcon && <span className="mr-2 -ml-1 h-5 w-5">{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className="ml-2 -mr-1 h-5 w-5">{trailingIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
