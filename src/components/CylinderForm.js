import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function CylinderForm() {
  const {
    cylinders,
    setCylinders,
    beerTypes
  } = useContext(AppContext);

  const initialState = {
    id: null,
    name: "",
    beerTypeId: "",
    capacity: "",
    targetTemp: "",
    status: "Fermentando",
    notes: ""
  };

  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Nome do cilindro obrigatório.");
      return;
    }

    if (!form.beerTypeId) {
      setError("Selecione um tipo de cerveja.");
      return;
    }

    if (form.id) {
      // editar
      setCylinders(
        cylinders.map(c =>
          c.id === form.id ? form : c
        )
      );
    } else {
      // criar
      setCylinders([
        ...cylinders,
        {
          ...form,
          id: Date.now()
        }
      ]);
    }

    setForm(initialState);
  };

  const handleEdit = (cylinder) => {
    setForm(cylinder);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="cylinder-form">

        <input
          placeholder="Nome do cilindro"
          value={form.name}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
        />

        <select
          value={form.beerTypeId}
          onChange={(e) =>
            handleChange("beerTypeId", e.target.value)
          }
        >
          <option value="">Tipo de cerveja</option>

          {beerTypes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Capacidade (L)"
          value={form.capacity}
          onChange={(e) =>
            handleChange("capacity", e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Temperatura ideal"
          value={form.targetTemp}
          onChange={(e) =>
            handleChange("targetTemp", e.target.value)
          }
        />

        <select
          value={form.status}
          onChange={(e) =>
            handleChange("status", e.target.value)
          }
        >
          <option>Fermentando</option>
          <option>Maturando</option>
          <option>Finalizado</option>
          <option>Pausado</option>
        </select>

        <textarea
          placeholder="Observações"
          value={form.notes}
          onChange={(e) =>
            handleChange("notes", e.target.value)
          }
        />

        <button>
          {form.id ? "Salvar alterações" : "Cadastrar cilindro"}
        </button>

        {error && (
          <div className="error">
            {error}
          </div>
        )}
      </form>

      <div className="edit-cylinder-list">
        {cylinders.map(c => (
          <div key={c.id} className="edit-cylinder-card">

            <div>
              <strong>{c.name}</strong>
            </div>

            <button onClick={() => handleEdit(c)}>
              Editar
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}