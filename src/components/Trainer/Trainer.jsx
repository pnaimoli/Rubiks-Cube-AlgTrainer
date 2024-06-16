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
import './Trainer.css'; // Import the CSS file

const defaultSettings = {
    use3D: true,
    useAUF: true,
    showAlg: false,
    cn: false,
    hideCase: false,
};

const Trainer = () => {
    // State variables
    const [algset, setAlgset] = useState(JSON.parse(localStorage.getItem("algset")) || null);
    const [time, setTime] = useState(0);
    const [runTimer, setRunTimer] = useState(false);
    const [scramble, setScramble] = useState("");
    const [highlighted, setHighlighted] = useState(false);
    const [savedTimes, setSavedTimes] = useState(algset?.times || []);
    const [alg, setAlg] = useState(null);
    const [showSelectAlgs, setShowSelectAlgs] = useState(false);
    const [back, setBack] = useState(0);
    const [view, setView] = useState("Timer");

    // Settings state
    const [settings, setSettings] = useState(
        JSON.parse(localStorage.getItem("settings")) || defaultSettings
    );

    // Timer control variables
    let inBetween = false;
    let hold = true;
    let holdTimeout;
    let hold1Second = false;

    // Handle key down event for space bar
    const handleKeyDown = (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            if (inBetween && hold && !runTimer) {
                setRunTimer(false);
                hold = false;
            } else if (hold) {
                setHighlighted(true);
            }
        }
    };

    // Handle key up event for space bar
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

    // Handle touch start event
    const handleTouchStart = (event) => {
        event.preventDefault();
        if (inBetween && hold && !runTimer) {
            setRunTimer(false);
            hold = false;
        } else if (hold) {
            setHighlighted("red");
            holdTimeout = setTimeout(() => {
                setHighlighted("green");
                hold1Second = true;
            }, 300);
        }
    };

    // Handle touch end event
    const handleTouchEnd = (event) => {
        event.preventDefault();
        if (runTimer) {
            setRunTimer(false);
        } else if (!inBetween) {
            setHighlighted("");
            clearTimeout(holdTimeout);
            if (hold1Second) {
                hold1Second = false;
                setRunTimer(true);
                inBetween = true;
            }
        } else {
            inBetween = false;
            hold = true;
        }
    };

    // Handle context menu event to prevent default behavior on touch devices
    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    // Fetch a new scramble based on settings
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

    // Initialize scramble and event listeners
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
        const targetDiv = document.getElementById("timer");
        if (targetDiv) {
            targetDiv.addEventListener("touchstart", handleTouchStart);
            targetDiv.addEventListener("touchend", handleTouchEnd);
            targetDiv.addEventListener("contextmenu", handleContextMenu);
        }
        return () => {
            if (targetDiv) {
                targetDiv.removeEventListener("touchstart", handleTouchStart);
                targetDiv.removeEventListener("touchend", handleTouchEnd);
                targetDiv.removeEventListener("contextmenu", handleContextMenu);
            }
        };
    }, [view]);

    // Save time and fetch new scramble when timer stops
    useEffect(() => {
        if (!runTimer && time !== 0) {
            const data = { time, scramble, alg: alg?.alg, name: alg?.name };
            setSavedTimes((prev) => [...prev, data]);
            saveTime([...savedTimes, data]);
            getScramble(settings.useAUF, settings.cn);
        }
    }, [runTimer]);

    // Save times to local storage and backend
    const saveTime = (times) => {
        const updatedAlgset = { ...algset, times };
        localStorage.setItem("algset", JSON.stringify(updatedAlgset));
        saveAlgset(updatedAlgset);
    };

    // Handle settings checkbox change
    const handleCheck = (name) => {
        setSettings((prevSettings) => {
            const newSettings = { ...prevSettings, [name]: !prevSettings[name] };
            localStorage.setItem("settings", JSON.stringify(newSettings));
            return newSettings;
        });
    };

    // Navigate back through saved times
    const handleBack = () => {
        if (back + 1 <= savedTimes.length) {
            setBack((prev) => {
                setScramble(savedTimes[savedTimes.length - prev - 1].scramble);
                return prev + 1;
            });
        }
    };

    // Navigate forward through saved times
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
        <div className="trainer-container">
            <SelectTimes open={showSelectAlgs} onClose={() => setShowSelectAlgs(false)} />
            <div className="trainer-title">Trainer</div>
            <div className="trainer-contents">
                <div className="trainer-inner-container">
                    <div className="scramble-panel">
                        <button className="timer-button-left">
                            <IoMdArrowDropleft
                                className={`text-5xl ${back + 1 <= savedTimes.length ? "text-white" : "text-gray-600"}`}
                                onClick={handleBack}
                            />
                        </button>
                        {scramble}
                        <button className="timer-button-right">
                            <IoMdArrowDropright className="text-5xl" onClick={handleForward} />
                        </button>
                    </div>
                    <div className="bottom-panels">
                        <div className={`timer-panel ${view !== "Timer" ? "hidden" : ""} lg:flex`} id="timer">
                            <div
                                className="timer-panel-header"
                                onClick={() => setShowSelectAlgs(true)}
                            >
                                {algset ? algset.selectedAlgs.length : 0}{" "}
                                {algset
                                    ? algset.selectedAlgs.length !== 1
                                        ? "cases selected"
                                        : "case selected"
                                    : "cases selected"}
                            </div>
                            <div className={`timer-panel-text ${highlighted && alg && "highlight"}`}>
                                {alg ? <Timer runTimer={runTimer} time={time} setTime={setTime} /> : "--.--"}
                            </div>
                        </div>
                        <div className={`stats-panels ${view !== "Panels" ? "hidden" : ""} lg:grid`}>
                            <CasePanel scramble={scramble} />
                            <StatsPanel times={savedTimes} />
                            <HintPanel alg={alg?.alg || ""} />
                            <TimesPanel times={savedTimes} setSavedTimes={setSavedTimes} />
                        </div>
                    </div>
                <div className="view-toggle-buttons">
                    <button
                        className="view-toggle-button"
                        onClick={() => setView("Timer")}
                    >
                        Timer
                    </button>
                    <button
                        className="view-toggle-button"
                        onClick={() => setView("Panels")}
                    >
                        Panels
                    </button>
                </div>
                </div>
            </div>
            <div className="settings">
                <div className="settings-title">Settings:</div>
                {Object.keys(settings).map((setting) => (
                    <div key={setting} className="settings-item">
                        <input
                            type="checkbox"
                            className="mr-1"
                            checked={settings[setting]}
                            onChange={() => handleCheck(setting)}
                            id={setting}
                        />
                        <label className="settings-label">
                            {setting.replace("use3D", "Use 3D Cube").replace("useAUF", "Use AUF")
                                    .replace("cn", "Color Neutral").replace("AUF", "AUF").replace("show", "Show ")
                                    .replace("hide", "Hide ")}
                        </label>
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
    settings: PropTypes.object,
};

export default Trainer;
