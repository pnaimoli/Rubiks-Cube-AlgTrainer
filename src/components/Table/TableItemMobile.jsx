import React, { useEffect, useState } from "react";
import convertAlg from "../../util/convertAlg";
import formatTime from "../../util/formatTime";

const TableItemMobile = ({ data }) => {
    const [bestTime, setBestTime] = useState("-");
    const [avgTime, setAvgTime] = useState("-");
    const [times, setTimes] = useState([]);

    useEffect(() => {
        const timeData = JSON.parse(localStorage.getItem("times"));
        if (timeData) {
            for (let i = 0; i < timeData.length; i++) {
                if (timeData[i].name === data.name) {
                    setTimes((prev) => [...prev, timeData[i]]);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (times.length > 0) {
            let lowest = times[0].time;
            let total = 0;
            for (let i = 0; i < times.length; i++) {
                total += times[i].time;
                if (times[i].time < lowest) {
                    lowest = times[i].time;
                }
            }
            setBestTime(lowest);
            setAvgTime((total / times.length).toFixed(0));
        }
    }, [times]);

    return (
        <div className="bg-gray-700 rounded-xl overflow-hidden mb-2">
            <div className="text-center bg-gray-800 text-lg border-b border-gray-600">
                {data.name}
            </div>
            <div className="flex items-center h-[68%] overflow-hidden">
                <img
                    src={`http://cube.rider.biz/visualcube.php?fmt=svg&bg=t&size=200&view=plan&case=${convertAlg(
                        data.alg
                    )}`}
                    alt={data.name}
                    className="w-[35%] borde"
                />
                <div className="w-[65%] text-center border border-gray-600 h-full flex items-center justify-center">
                    {data.alg}
                </div>
            </div>
            <div className="flex h-[32%]">
                <div className="text-center w-[50%] border-gray-600 border">
                    Best: {bestTime !== "-" ? formatTime(bestTime) : bestTime}
                </div>
                <div className="text-center w-[50%] border-gray-600 border">
                    Avg: {avgTime !== "-" ? formatTime(avgTime) : avgTime}
                </div>
            </div>
        </div>
    );
};

export default TableItemMobile;