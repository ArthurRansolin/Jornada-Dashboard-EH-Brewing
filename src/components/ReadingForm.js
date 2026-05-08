import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function ReadingForm() {
  const { readings, setReadings, cylinders } = useContext(AppContext);

  const [data, setData] = useState({ cylinderId: "", temp: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.cylinderId) {
      setError("Selecione um cilindro!");
      return;
    }

    const tempNumber = parseFloat(data.temp);

    if (isNaN(tempNumber)) {
      setError("Digite uma temperatura válida!");
      return;
    }

    setReadings([
      ...readings,
      {
        ...data,
        temp: tempNumber,
        id: Date.now(),
        date: new Date()
      }
    ]);

    // limpar
    setData({ cylinderId: "", temp: "" });
    setError("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={data.cylinderId}
        onChange={(e) => {
          setData({ ...data, cylinderId: e.target.value });
          setError("");
        }}
      >
        <option value="">Selecione um cilindro</option>
        {cylinders.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Temperatura"
        value={data.temp}
        onChange={(e) => {
          setData({ ...data, temp: e.target.value });
          setError("");
        }}
      />

      <button>Salvar</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}