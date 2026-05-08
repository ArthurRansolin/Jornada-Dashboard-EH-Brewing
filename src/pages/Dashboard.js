import ReadingForm
  from "../components/ReadingForm";

import ReadingList
  from "../components/ReadingList";

export default function Dashboard() {

  return (

    <div className="grid">

      <div className="section">

        <ReadingForm />

        <ReadingList />

      </div>

    </div>

  );
}