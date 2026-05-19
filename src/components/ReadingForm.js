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
    addReading
  } = useContext(ReadingContext);

  const {
    tanks
  } = useContext(TankContext);

  const [tankId, setTankId] =
    useState("");

  const [
    temperature,
    setTemperature
  ] = useState("");

  const [error, setError] =
    useState("");

  function handleSubmit(e) {

    e.preventDefault();

    if (
      !tankId ||
      temperature === ""
    ) {

      setError(
        "Preencha todos os campos."
      );

      return;
    }

    if (
      isNaN(temperature)
    ) {

      setError(
        "Temperatura inválida."
      );

      return;
    }

    addReading({

      id: Date.now(),

      tankId:
        Number(tankId),

      temperature:
        Number(temperature),

      date:
        new Date().toLocaleString("pt-BR")
    });

    /* RESET */

    setTankId("");
    setTemperature("");
    setError("");
  }

  return (

    <form
      onSubmit={handleSubmit}
    >

      {
        error && (
          <div className="error">
            {error}
          </div>
        )
      }

      {/* TANK */}

      <select
        value={tankId}
        onChange={e =>
          setTankId(
            e.target.value
          )
        }
      >

        <option value="">
          Selecione o tanque
        </option>

        {
          tanks.map(tank => (

            <option
              key={tank.id}
              value={tank.id}
            >
              {tank.name}
            </option>

          ))
        }

      </select>

      {/* TEMP */}

      <input
        type="number"
        step="0.1"
        placeholder="Temperatura °C"
        value={temperature}
        onChange={e =>
          setTemperature(
            e.target.value
          )
        }
      />

      <button type="submit">
        Registrar Leitura
      </button>

    </form>
  );
}