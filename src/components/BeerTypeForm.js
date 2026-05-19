import { useState, useContext } from "react";
import { BeerContext } from "../contexts/BeerContext";

export default function BeerTypeForm() {

  const {
    beerTypes,
    setBeerTypes
  } = useContext(BeerContext);

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!name.trim()) {
      setError(
        "Informe um nome válido."
      );
      return;
    }

    const newBeer = {
      id: Date.now(),
      name
    };

    setBeerTypes([
      ...beerTypes,
      newBeer
    ]);

    setName("");
    setError("");
  };

  return (
    <div>

      <h2>
        Tipo de Cerveja
      </h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
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