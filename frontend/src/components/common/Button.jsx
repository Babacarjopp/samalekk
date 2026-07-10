const Button = ({
  children,
  variante = 'primary',
  taille = 'md',
  chargement = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const variantes = {
    primaire:   'btn-primary',
    primary:    'btn-primary',
    secondaire: 'btn-secondary',
    secondary:  'btn-secondary',
    vert:       'btn-green',
    green:      'btn-green',
    danger:     'btn-danger',
    gris:       'btn-ghost',
    ghost:      'btn-ghost',
  };

  const tailles = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || chargement}
      className={`btn ${variantes[variante] || 'btn-primary'} ${tailles[taille] || ''} ${className}`}
    >
      {chargement && <i className="ti ti-loader-2 spinning" />}
      {children}
    </button>
  );
};

export default Button;


