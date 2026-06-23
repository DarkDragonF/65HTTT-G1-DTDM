import './AuthLayout.css';

const floatingEmojis = [
  { emoji: '🍜', duration: '5s', delay: '0s' },
  { emoji: '🍕', duration: '7s', delay: '0.5s' },
  { emoji: '🍔', duration: '6s', delay: '1s' },
  { emoji: '🍣', duration: '8s', delay: '1.5s' },
  { emoji: '🍱', duration: '5.5s', delay: '2s' },
  { emoji: '🧋', duration: '7.5s', delay: '0.8s' },
  { emoji: '🍰', duration: '6.5s', delay: '1.2s' },
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-left">
        <div className="auth-left-bg">
          <div className="auth-floating-circle" />
          <div className="auth-floating-circle" />
          <div className="auth-floating-circle" />
        </div>

        <div className="auth-branding">
          <span className="auth-brand-logo" role="img" aria-label="Food">
            🍜
          </span>
          <h1 className="auth-brand-name">TLU Food</h1>
          <p className="auth-brand-tagline">
            Delicious campus food, one click away.
            <br />
            Order from your favorite campus restaurants and enjoy meals delivered right to you.
          </p>

          <div className="auth-floating-emojis">
            {floatingEmojis.map(({ emoji, duration, delay }, i) => (
              <span
                key={i}
                className="auth-emoji"
                style={{ '--duration': duration, '--delay': delay }}
                role="img"
                aria-hidden="true"
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          {(title || subtitle) && (
            <div className="auth-form-header">
              {title && <h2 className="auth-form-title">{title}</h2>}
              {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
            </div>
          )}
          <div className="auth-form-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
