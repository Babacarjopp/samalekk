
import { useEffect } from 'react';

const Modal = ({ estOuvert, onFermer, titre, children }) => {
  useEffect(() => {
    if (estOuvert) document.body.style.overflow = 'hidden';
    else           document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [estOuvert]);

  if (!estOuvert) return null;

  return (
    <div className="modal-backdrop" onClick={onFermer}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{titre}</span>
          <button className="modal-close" onClick={onFermer}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
