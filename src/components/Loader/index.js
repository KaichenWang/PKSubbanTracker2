import './Loader.css';

function Loader(props) {
  const { inverse } = props;
  return <div className={`Loader ${inverse ? 'Loader--inverse' : ''}`}></div>;
}

export default Loader;
