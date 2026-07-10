const Loader = ({ texte = 'Chargement...' }) => (
  <div className="loader-wrap">
    <div className="loader-ring" />
    <p className="loader-text">{texte}</p>
  </div>
);

export default Loader;


