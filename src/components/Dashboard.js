import { Line } from "react-chartjs-2";

const data = {
  labels: ["Dia 1", "Dia 2"],
  datasets: [{
    label: "Temperatura",
    data: [20, 18]
  }]
};

<Line data={data} />