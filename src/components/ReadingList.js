import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function ReadingList() {
  const { readings, setReadings, cylinders } = useContext(AppContext);

  const handleDelete = (id) => {
    setReadings(readings.filter(r => r.id !== id));
  };

  const getCylinderName = (id) => {
    const c = cylinders.find(c => c.id == id);
    return c ? c.name : "Removido";
  };

  return (
    <div>
      {readings.map(r => (
        <div key={r.id} className="card list-item">
          <div>
            🌡 {r.temp}°C - {getCylinderName(r.cylinderId)}
          </div>

          <button className="delete-btn" onClick={() => handleDelete(r.id)}>
            ❌
          </button>
        </div>
      ))}
    </div>
  );
}