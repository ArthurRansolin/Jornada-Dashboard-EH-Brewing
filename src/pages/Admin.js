import BeerTypeForm
from "../components/BeerTypeForm";

import BeerTypeList
from "../components/BeerTypeList";

import TankForm
from "../components/TankForm";

import TankList
from "../components/TankList";

export default function Admin() {

  return (

    <div className="grid">

      <div className="section">

        <BeerTypeForm />

        <BeerTypeList />

      </div>

      <div className="section">

        <TankForm />

        <TankList />

      </div>

    </div>

  );
}