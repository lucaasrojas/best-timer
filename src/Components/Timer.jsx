import React, { useEffect, useRef, useCallback } from 'react';

const Timer = (props) => {
    //console.log("TIMER", props)
    const [time, setTime] = React.useState({ min: 0, sec: 0 })
    const [initialTime, setInitialTime] = React.useState({ min: 0, sec: 0 })
    const [running, setRunning] = React.useState(false)
    const [progressPercentage, setProgressPercentage] = React.useState(0)
    const [editSelected, setEditSelected] = React.useState("min")
    let interval

    const KEY_FUNCTIONS = {
        "Space": () => {
            setRunning(!!!running)
        },
        "KeyR": () => {
            setRunning(false)
            setTime({ min: 0, sec: 0 })
            setProgressPercentage(0)
        },
        "ArrowUp": () => {
            if (editSelected === "sec" && (time.sec + 5) < 59) {
                setInitialTime(prevTime => ({ ...prevTime, sec: prevTime.sec + 5 }))
                setTime(prevTime => ({ ...prevTime, sec: prevTime.sec + 5 }))
            } else if (editSelected === "min" && (time.min + 5) < 59) {
                setInitialTime(prevTime => ({ ...prevTime, min: prevTime.min + 5 }))
                setTime(prevTime => ({ ...prevTime, min: prevTime.min + 5 }))
            }
        },
        "ArrowDown": () => {
            if (editSelected === "sec" && (time.sec - 5) > 0) {
                setInitialTime(prevTime => ({ ...prevTime, sec: prevTime.sec + 5 }))
                setTime(prevTime => ({ ...prevTime, sec: prevTime.sec - 5 }))
            } else if (editSelected === "min" && (time.min - 5) > 0) {
                setInitialTime(prevTime => ({ ...prevTime, min: prevTime.min + 5 }))
                setTime(prevTime => ({ ...prevTime, min: prevTime.min - 5 }))
            }
        },
        "ArrowLeft": () => {
            if (editSelected === "sec") {
                setEditSelected("min")
            }
        },
        "ArrowRight": () => {
            if (editSelected === "min") {
                setEditSelected("sec")
            }
        }
    }
    const DEFAULT_KEY = () => null
    function useEventListener(eventName, handler, element = window) {
        // Create a ref that stores handler
        const savedHandler = useRef();
        // Update ref.current value if handler changes.
        // This allows our effect below to always get latest handler ...
        // ... without us needing to pass it in effect deps array ...
        // ... and potentially cause effect to re-run every render.
        useEffect(() => {
            savedHandler.current = handler;
        }, [handler]);
        useEffect(
            () => {
                // Make sure element supports addEventListener
                // On
                const isSupported = element && element.addEventListener;
                if (!isSupported) return;
                // Create event listener that calls handler function stored in ref
                const eventListener = (event) => savedHandler.current(event);
                // Add event listener
                element.addEventListener(eventName, eventListener);
                // Remove event listener on cleanup
                return () => {
                    element.removeEventListener(eventName, eventListener);
                };
            },
            [eventName, element] // Re-run if eventName or element changes
        );
    }
    useEventListener("keydown", (key) => {
        console.log("KEY", key)
        if(KEY_FUNCTIONS[key.code]) {
            KEY_FUNCTIONS[key.code]() 
        }
    })
    useEventListener("touchend", (key) => {
        KEY_FUNCTIONS["Space"]() || DEFAULT_KEY()
    })
    const calculatePercentage = () => {
        const { min, sec } = time
        const timeInSec = (min * 60) + sec
        const initialTimeInSec = (initialTime.min * 60) + initialTime.sec
        setProgressPercentage((timeInSec * 100) / initialTimeInSec)
    }
    React.useEffect(() => {
        const timeFromPath = getTimeFromPath()
        if (timeFromPath.min > 0 || timeFromPath.sec > 0) {
            setInitialTime(timeFromPath)
            setTime(timeFromPath)
        }
    }, [])

    React.useEffect(() => {
        //console.log('TIME CHANGED', time);
        calculatePercentage()
    }, [time])

    React.useEffect(() => {
        if (running && !interval) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime.sec > 0) {
                        return { ...prevTime, sec: prevTime.sec - 1 }
                    } else if (prevTime.sec === 0 && prevTime.min > 0) {
                        return { min: prevTime.min - 1, sec: 59 }
                    } else {
                        setRunning(false)
                        clearInterval(interval)
                        return { min: 0, sec: 0 }
                    }
                })
            }, 1000)
        }

        return () => {
            clearInterval(interval)
        }

    }, [running])

    const getTimeFromPath = () => {
        let response = { min: 0, sec: 0 }
        if (props.match.params && props.match.params.time) {
            let pathname = props.match.params.time;

            if (pathname.trim()) {
                pathname = pathname.replace("minutes", '.').replace("seconds", "").replace("minute", '.').replace("second", "").replace("min", '.').replace("sec", "")
                const [min, sec] = pathname.split(".")
                response = { min: parseInt(min), sec: parseInt(sec) }
            }
        }

        return response
    }
    return (
        <div className="App"
            style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                backgroundColor: "#150e56"
            }}
        >
            <div id="help-text"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    paddingLeft: 10,
                    fontSize: "1.5vw",
                    zIndex: 1
                }}
            >
                <p>Touch screen: Start/Pause Timer</p>
                <p>Space: Start/Pause Timer</p>
                <p>R: Reset Timer</p>
                <p>Left/Right Arrow: Select edit</p>
                <p>Up/Down Arrow: Change value</p>
            </div>
            <div style={{
                background: "rgb(111, 74, 161)",
                height: "inherit",
                transition: "width .2s ease-in",
                position: "absolute",
                left: 0,
                width: `${progressPercentage}%`
            }}></div>
            <div
                style={{
                    fontSize: "10vw",
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                    inset: "unset"
                }}
            >
                <span
                    style={{
                        color: editSelected === "min" && !running ? "#686868" : "#d0d0d0"
                    }}
                >
                    {time.min.toString().length > 1 ? time.min : `0${time.min}`}
                </span>
                <span style={{color: "#faf3f3"}}>
                    :
                </span>
                <span
                    style={{
                        color: editSelected === "sec" && !running  ? "#686868" : "#d0d0d0"
                    }}>

                    {time.sec.toString().length > 1 ? time.sec : `0${time.sec}`}
                </span>
            </div>
        </div>
    )
}

export default Timer
