import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function CylinderList() {
  const {
    cylinders,
    setCylinders,
    readings,
    setReadings,
    beerTypes
  } = useContext(AppContext);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Deseja excluir este cilindro?"
    );

    if (!confirmDelete) return;

    // remove cilindro
    setCylinders(cylinders.filter(c => c.id !== id));

    // remove leituras vinculadas
    setReadings(readings.filter(r => r.cylinderId !== id));
  };

  const getBeerName = (id) => {
    const beer = beerTypes.find(b => b.id == id);
    return beer ? beer.name : "Sem tipo";
  };

  return (
    <div className="cylinder-grid">
      {cylinders.map(c => (
        <div key={c.id} className="cylinder-card">

          {/* Imagem do cilindro */}
          <div className="cylinder-image-container">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
              alt="Cilindro"
              className="cylinder-image"
            />
          </div>

          {/* Informações */}
          <div className="cylinder-content">
            <h3>{c.name}</h3>

            <p>
              🍺 {getBeerName(c.beerTypeId)}
            </p>
          </div>

          {/* Botão */}
          <button
            className="delete-btn"
            onClick={() => handleDelete(c.id)}
          >
            ❌
          </button>

        </div>
      ))}
    </div>
  );
}