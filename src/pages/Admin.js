import BeerTypeForm from "../components/BeerTypeForm";
import BeerTypeList from "../components/BeerTypeList";
import TankForm from "../components/TankForm";
import TankList from "../components/TankList";
import ReadingForm from "../components/ReadingForm";
import ReadingList from "../components/ReadingList";

export default function Admin() {

  return (

    <div className="grid">

      {/* BEERS */}

      <div className="section">

        <h2>
          Tipos de Cerveja
        </h2>

        <BeerTypeForm />

        <BeerTypeList />

      </div>

      {/* TANKS */}

      <div className="section">

        <h2>
          Tanques
        </h2>

        <TankForm />

        <TankList />

      </div>

      {/* READINGS */}

      <div className="section">

        <h2>
          Leituras
        </h2>

        <ReadingForm />

        <ReadingList />

      </div>

    </div>

  );
}