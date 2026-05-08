import {
  useContext,
  useState
} from "react";

import { TankContext }
from "../contexts/TankContext";

import { BeerContext }
from "../contexts/BeerContext";

export default function TankForm() {

  const {
    tanks,
    setTanks
  } = useContext(TankContext);

  const { beerTypes } =
    useContext(BeerContext);

  const [name, setName] =
    useState("");

  const [beerTypeId,
    setBeerTypeId] =
    useState("");

  const [capacity,
    setCapacity] =
    useState("");

  const [targetTemp,
    setTargetTemp] =
    useState("");

  const [status,
    setStatus] =
    useState("Fermentando");

  const [notes,
    setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !name ||
      !beerTypeId
    ) {
      setError(
        "Preencha os campos obrigatórios."
      );
      return;
    }

    const newTank = {
      id: Date.now(),
      name,
      beerTypeId,
      capacity,
      targetTemp,
      status,
      notes
    };

    setTanks([
      ...tanks,
      newTank
    ]);

    setName("");
    setBeerTypeId("");
    setCapacity("");
    setTargetTemp("");
    setStatus(
      "Fermentando"
    );
    setNotes("");
    setError("");
  };

  return (
    <div >

      <h2>Tanques</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        <select
          value={beerTypeId}
          onChange={(e) =>
            setBeerTypeId(
              e.target.value
            )
          }
        >

          <option value="">
            Tipo de cerveja
          </option>

          {beerTypes.map(beer => (

            <option
              key={beer.id}
              value={beer.id}
            >
              {beer.name}
            </option>

          ))}

        </select>

        <input
          type="number"
          placeholder="Capacidade"
          value={capacity}
          onChange={(e) =>
            setCapacity(
              e.target.value
            )
          }
        />

        <input
          type="number"
          placeholder="Temperatura Ideal"
          value={targetTemp}
          onChange={(e) =>
            setTargetTemp(
              e.target.value
            )
          }
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
        >

          <option>
            Fermentando
          </option>

          <option>
            Maturando
          </option>

          <option>
            Finalizado
          </option>

          <option>
            Pausado
          </option>

        </select>

        <textarea
          placeholder="Observações"
          value={notes}
          onChange={(e) =>
            setNotes(
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