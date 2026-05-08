import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function BeerTypeList() {
  const { beerTypes, setBeerTypes } = useContext(AppContext);

  const remove = (id) => {
    setBeerTypes(beerTypes.filter(b => b.id !== id));
  };

  return (
    <div>
      {beerTypes.map(b => (
        <div key={b.id} className="card list-item">
          <div>
            <strong>{b.name}</strong> - {b.style}
          </div>

          <button 
            className="delete-btn"
            onClick={() => remove(b.id)}
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  );
}