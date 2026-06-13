import {
    useContext,
    useState
} from "react";

import { TankContext } from "../contexts/TankContext";

export default function TemperatureSchedule({
    tank
}) {

    const {
        addTemperatureSchedule,
        removeTemperatureSchedule
    } = useContext(TankContext);

    const [time, setTime] =
        useState("");

    const [temperature,
        setTemperature] =
        useState("");

    function handleSubmit(e) {

        e.preventDefault();

        if (
            !time ||
            !temperature
        ) return;

        addTemperatureSchedule(
            tank.id,
            {
                time,
                temperature:
                    Number(temperature)
            }
        );

        setTime("");
        setTemperature("");
    }

    const schedules =
        (tank.temperatureSchedule || [])
            .sort((a, b) =>
                a.time.localeCompare(b.time)
            );

    return (

        <div className="details-card">

            <h2>
                Programação Térmica
            </h2>

            <form
                onSubmit={handleSubmit}
                className="schedule-form"
            >

                <input
                    type="time"
                    value={time}
                    onChange={e =>
                        setTime(
                            e.target.value
                        )
                    }
                />

                <input
                    type="number"
                    placeholder="Temperatura °C"
                    value={temperature}
                    onChange={e =>
                        setTemperature(
                            e.target.value
                        )
                    }
                />

                <button type="submit">
                    Adicionar
                </button>

            </form>

            <div className="schedule-list">

                {
                    schedules.length === 0
                        ? (
                            <p className="reading-empty">
                                Nenhuma programação cadastrada.
                            </p>
                        )
                        : (
                            schedules.map(item => (

                                <div
                                    key={item.id}
                                    className="schedule-card"
                                >

                                    <div>

                                        <strong>
                                            {item.time}
                                        </strong>

                                        <p>
                                            {item.temperature}°C
                                        </p>

                                    </div>

                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            removeTemperatureSchedule(
                                                tank.id,
                                                item.id
                                            )
                                        }
                                    >
                                        Remover
                                    </button>

                                </div>

                            ))
                        )
                }

            </div>

        </div>

    );
}