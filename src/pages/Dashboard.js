import ReadingForm from "../components/ReadingForm";
import ReadingList from "../components/ReadingList";

export default function Dashboard() {
  return (
    <div className="section">
      <h2>Leituras</h2>
      <ReadingForm />
      <ReadingList />
    </div>
  );
}