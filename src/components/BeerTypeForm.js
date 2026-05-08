import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function BeerTypeForm() {
  const { beerTypes, setBeerTypes } = useContext(AppContext);
  const [form, setForm] = useState({ name: "", style: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // validação
    if (!form.name.trim() || !form.style.trim()) {
      setError("Preencha todos os campos!");
      return;
    }

    setBeerTypes([...beerTypes, { ...form, id: Date.now() }]);

    setForm({ name: "", style: "" });
    setError(""); // limpa erro
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nome" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Estilo" value={form.style}
        onChange={e => setForm({ ...form, style: e.target.value })} />
      <button>Cadastrar</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
  
}
