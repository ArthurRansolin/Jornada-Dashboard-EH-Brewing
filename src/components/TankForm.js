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
    addTank
  } = useContext(TankContext);

  const {
    beerTypes
  } = useContext(BeerContext);

  const [name, setName] =
    useState("");

  const [
    beerTypeId,
    setBeerTypeId
  ] = useState("");

  const [
    capacity,
    setCapacity
  ] = useState("");

  const [
    idealTemp,
    setIdealTemp
  ] = useState("");

  const [status, setStatus] =
    useState("fermentando");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  function handleSubmit(e) {

    e.preventDefault();

    if (
      !name ||
      !beerTypeId ||
      !capacity ||
      !idealTemp
    ) {

      setError(
        "Preencha todos os campos."
      );

      return;
    }

    addTank({

      name,

      beerTypeId:
        Number(beerTypeId),

      capacity:
        Number(capacity),

      idealTemp:
        Number(idealTemp),

      status,

      notes
    });

    /* RESET */

    setName("");
    setBeerTypeId("");
    setCapacity("");
    setIdealTemp("");
    setStatus("fermentando");
    setNotes("");
    setError("");
  }

  return (

    <form
      className="cylinder-form"
      onSubmit={handleSubmit}
    >

      {
        error && (
          <div className="error">
            {error}
          </div>
        )
      }

      {/* NAME */}

      <input
        type="text"
        placeholder="Nome do tanque"
        value={name}
        onChange={e =>
          setName(
            e.target.value
          )
        }
      />

      {/* BEER */}

      <select
        value={beerTypeId}
        onChange={e =>
          setBeerTypeId(
            e.target.value
          )
        }
      >

        <option value="">
          Selecione o tipo
        </option>

        {
          beerTypes.map(beer => (

            <option
              key={beer.id}
              value={beer.id}
            >
              {beer.name}
            </option>

          ))
        }

      </select>

      {/* CAPACITY */}

      <input
        type="number"
        placeholder="Capacidade (L)"
        value={capacity}
        onChange={e =>
          setCapacity(
            e.target.value
          )
        }
      />

      {/* TEMP */}

      <input
        type="number"
        placeholder="Temperatura ideal °C"
        value={idealTemp}
        onChange={e =>
          setIdealTemp(
            e.target.value
          )
        }
      />

      {/* STATUS */}

      <select
        value={status}
        onChange={e =>
          setStatus(
            e.target.value
          )
        }
      >

        <option value="fermentando">
          Fermentando
        </option>

        <option value="maturando">
          Maturando
        </option>

        <option value="finalizado">
          Finalizado
        </option>

        <option value="pausado">
          Pausado
        </option>

      </select>

      {/* NOTES */}

      <textarea
        placeholder="Observações"
        value={notes}
        onChange={e =>
          setNotes(
            e.target.value
          )
        }
      />

      <button type="submit">
        Adicionar Tanque
      </button>

    </form>
  );
}