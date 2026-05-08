import BeerTypeForm from "../components/BeerTypeForm";
import BeerTypeList from "../components/BeerTypeList";
import CylinderForm from "../components/CylinderForm";
import CylinderList from "../components/CylinderList";

export default function Admin() {
  return (
    <div className="grid">
      <div className="section">
        <h2>Tipos de Cerveja</h2>
        <BeerTypeForm />
        <BeerTypeList />
      </div>

      <div className="section">
        <h2>Cilindros</h2>
        <CylinderForm />
        <CylinderList />
      </div>
    </div>
  );
}