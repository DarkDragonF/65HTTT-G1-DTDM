import './InputField.css';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  icon,
  disabled = false,
  suffix,
  autoComplete,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`input-field ${icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && (
        <span className="input-error-text" id={`${name}-error`} role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};

export default InputField;
