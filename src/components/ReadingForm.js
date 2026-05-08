import {
  useContext,
  useState
} from "react";

import { ReadingContext }
from "../contexts/ReadingContext";

import { TankContext }
from "../contexts/TankContext";

export default function ReadingForm() {

  const {
    readings,
    setReadings
  } = useContext(ReadingContext);

  const { tanks } =
    useContext(TankContext);

  const [tankId, setTankId] =
    useState("");

  const [temp, setTemp] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !tankId ||
      temp === ""
    ) {
      setError(
        "Preencha todos os campos."
      );
      return;
    }

    const newReading = {
      id: Date.now(),
      tankId,
      temp,
      date: new Date()
    };

    setReadings([
      ...readings,
      newReading
    ]);

    setTankId("");
    setTemp("");
    setError("");
  };

  return (
    <div >

      <h2>Leituras</h2>

      <form onSubmit={handleSubmit}>

        <select
          value={tankId}
          onChange={(e) =>
            setTankId(
              e.target.value
            )
          }
        >

          <option value="">
            Selecione
          </option>

          {tanks.map(tank => (

            <option
              key={tank.id}
              value={tank.id}
            >
              {tank.name}
            </option>

          ))}

        </select>

        <input
          type="number"
          placeholder="Temperatura"
          value={temp}
          onChange={(e) =>
            setTemp(
              e.target.value
            )
          }
        />

        <button type="submit">
          Salvar
        </button>

      </form>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

    </div>
  );
}