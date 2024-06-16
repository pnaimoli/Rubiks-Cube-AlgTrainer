import { useEffect, useState } from "react";
import Table from "./components/Table/Table";
import Trainer from "./components/Trainer/Trainer";
import TableMobile from "./components/Table/TableMobile";
import Welcome from "./components/Welcome";

const App = () => {
    const [view, setView] = useState("Algs");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("view")) {
            localStorage.clear();
            window.location.reload();
        }
        const algsets = JSON.parse(localStorage.getItem("algsets"));
        if (!algsets) {
            setOpen(true);
        }
        const algset = JSON.parse(localStorage.getItem("algset"));
        if (algset) {
            if (algset.algs[0]) {
                if (!algset.algs[0].convertedAlg) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }
    }, []);

    return (
        <div>
            <div className="flex justify-center mt-4 underline-offset-2">
                <div
                    className={`text-2xl text-center pr-2 border-r-2 mr-2 cursor-pointer ${
                        view === "Algs"
                            ? "underline"
                            : "hover:underline decoration-gray-400"
                    }`}
                    onClick={() => {
                        setView("Algs");
                    }}
                >
                    Algs
                </div>
                <div
                    className={`text-2xl text-center cursor-pointer ${
                        view === "Trainer"
                            ? "underline"
                            : "hover:underline decoration-gray-400"
                    }`}
                    onClick={() => {
                        setView("Trainer");
                    }}
                >
                    Trainer
                </div>
            </div>
            {view === "Algs" ? (
                <>
                    <Table />
                    <TableMobile />
                </>
            ) : (
                <>
                    <Trainer />
                </>
            )}
            <Welcome open={open} onClose={() => setOpen(false)} />
        </div>
    );
};

export default App;
