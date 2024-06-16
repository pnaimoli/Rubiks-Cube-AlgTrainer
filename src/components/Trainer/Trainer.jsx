import React, { useEffect, useState } from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import Timer from "./Timer";
import generateScramble from "../../util/generateScramble";
import CasePanel from "./CasePanel";
import HintPanel from "./HintPanel";
import StatsPanel from "./StatsPanel";
import TimesPanel from "./TimesPanel";
import SelectTimes from "./SelectTimes";
import saveAlgset from "../../util/saveAlgset";
import PropTypes from 'prop-types';

const Trainer = () => {
    const [algset, setAlgset] = useState(JSON.parse(localStorage.getItem("algset")) || null);
    const [time, setTime] = useState(0);
    const [runTimer, setRunTimer] = useState(false);
    const [scramble, setScramble] = useState("");
    const [highlighted, setHighlighted] = useState(false);
    const [savedTimes, setSavedTimes] = useState(algset?.times || []);
    const [alg, setAlg] = useState();
    const [showSelectAlgs, setShowSelectAlgs] = useState(false);
    const [back, setBack] = useState(0);

    //settings
    const [settings, setSettings] = useState(JSON.parse(localStorage.getItem("settings")) || {
        use3D: true,
        useAUF: true,
        showAlg: false,
        cn: false,
        hideCase: false,
    });

    let inBetween = false;
    let hold = true;

    const handleKeyDown = (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            if (inBetween && hold && !runTimer) {
                //stops timer
                setRunTimer(false);
                hold = false;
            } else if (hold) {
                setHighlighted(true);
            }
        }
    };

    const handleKeyUp = (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            if (runTimer) {
                setRunTimer(false);
            } else if (!inBetween) {
                setRunTimer(true);
                setHighlighted(false);
                inBetween = true;
            } else {
                inBetween = false;
                hold = true;
            }
        }
    };

    const getScramble = async (AUF, cn) => {
        if (algset) {
            const algs = algset.selectedAlgs;
            if (algs.length > 0) {
                const index = Math.floor(Math.random() * algs.length);
                setAlg(algs[index]);
                const generatedScramble = await generateScramble(algs[index].alg, AUF, cn);
                setScramble(generatedScramble);
            }
        }
    };

    useEffect(() => {
        getScramble(settings.useAUF, settings.cn);

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!runTimer && time !== 0) {
            const data = { time, scramble, alg: alg?.alg, name: alg?.name };
            setSavedTimes((prev) => [...prev, data]);
            saveTime([...savedTimes, data]);
            getScramble(settings.useAUF, settings.cn);
        }
    }, [runTimer]);

    const saveTime = (times) => {
        const updatedAlgset = { ...algset, times };
        localStorage.setItem("algset", JSON.stringify(updatedAlgset));
        saveAlgset(updatedAlgset);
    };

    const handleCheck = (name) => {
        setSettings((prevSettings) => {
            const newSettings = { ...prevSettings, [name]: !prevSettings[name] };
            localStorage.setItem("settings", JSON.stringify(newSettings));
            return newSettings;
        });
    };

    const handleBack = () => {
        if (back + 1 <= savedTimes.length) {
            setBack((prev) => {
                setScramble(savedTimes[savedTimes.length - prev - 1].scramble);
                return prev + 1;
            });
        }
    };

    const handleForward = () => {
        if (back > 0) {
            setBack((prev) => {
                setScramble(savedTimes[savedTimes.length - prev].scramble);
                return prev - 1;
            });
        } else {
            getScramble(settings.useAUF, settings.cn);
        }
    };

    return (
        <div className="lg:block hidden">
            <SelectTimes
                open={showSelectAlgs}
                onClose={() => setShowSelectAlgs(false)}
            />
            <div className="flex justify-center font-semibold text-5xl mt-3">
                Trainer
            </div>
            <div className="flex justify-center mt-4">
                <div className="w-[90vw] max-w-[1800px] h-[70vh] max-h-[830px] justify-between flex flex-col">
                    <div className="h-[8%] bg-gray-800 rounded-xl flex items-center justify-center text-3xl relative">
                        <button className="absolute left-0">
                            <IoMdArrowDropleft
                                className={`text-5xl ${
                                    back + 1 <= savedTimes.length
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                                onClick={handleBack}
                            />
                        </button>
                        {scramble}
                        <button className="absolute right-0">
                            <IoMdArrowDropright
                                className="text-5xl"
                                onClick={handleForward}
                            />
                        </button>
                    </div>
                    <div className="justify-between flex h-[90%]">
                        <div className="w-[57%] h-full bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center relative">
                            <div
                                className="absolute top-2 text-2xl text-blue-400 cursor-pointer hover:text-blue-600"
                                onClick={() => setShowSelectAlgs(true)}
                            >
                                {algset ? algset.selectedAlgs.length : 0}{" "}
                                {algset
                                    ? algset.selectedAlgs.length !== 1
                                        ? "cases selected"
                                        : "case selected"
                                    : "cases selected"}
                            </div>
                            <div
                                className={`font-["Roboto_Mono"] text-8xl font-semibold ${
                                    highlighted && alg && "text-green-500"
                                } `}
                            >
                                {alg ? (
                                    <Timer
                                        runTimer={runTimer}
                                        time={time}
                                        setTime={setTime}
                                    />
                                ) : (
                                    "--.--"
                                )}
                            </div>
                        </div>
                        <div className="w-[20%] h-full flex flex-col justify-between">
                            <CasePanel scramble={scramble} />
                            <HintPanel alg={alg?.alg || ""} />
                        </div>
                        <div className="w-[20%] h-full flex flex-col justify-between">
                            <StatsPanel times={savedTimes} />
                            <TimesPanel
                                times={savedTimes}
                                setSavedTimes={setSavedTimes}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center mt-3">
                <div className="font-bold mr-2 text-2xl">Settings:</div>
                {["use3D", "useAUF", "showAlg", "cn", "hideCase"].map((setting) => (
                    <div key={setting} className="border rounded-xl p-1 px-2 mr-2">
                        <input
                            type="checkbox"
                            className="mr-1"
                            checked={settings[setting]}
                            onChange={() => handleCheck(setting)}
                            id={setting}
                        />
                        <label className="text-xl capitalize">{setting.replace("use", "Use ").replace("cn", "Color Neutral").replace("AUF", "AUF").replace("show", "Show ").replace("Case", "Case")}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

Trainer.propTypes = {
    algset: PropTypes.object,
    time: PropTypes.number,
    runTimer: PropTypes.bool,
    scramble: PropTypes.string,
    highlighted: PropTypes.bool,
    savedTimes: PropTypes.array,
    alg: PropTypes.object,
    showSelectAlgs: PropTypes.bool,
    back: PropTypes.number,
    settings: PropTypes.object
};

export default Trainer;