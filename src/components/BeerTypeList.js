import { useContext }
from "react";

import { BeerContext }
from "../contexts/BeerContext";

export default function BeerTypeList() {

  const {
    beerTypes,
    setBeerTypes
  } = useContext(BeerContext);

  const removeBeer = (id) => {

    setBeerTypes(
      beerTypes.filter(
        beer =>
          beer.id !== id
      )
    );
  };

  return (
<div className="section-content">
      {beerTypes.map(beer => (

        <div
          key={beer.id}
          className="card"
        >

          <span>
            {beer.name}
          </span>

          <button
            onClick={() =>
              removeBeer(beer.id)
            }
          >
            Excluir
          </button>

        </div>

      ))}

    </div>
  );
}