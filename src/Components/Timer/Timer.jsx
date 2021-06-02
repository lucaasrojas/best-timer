import React, { useEffect, useRef, useCallback } from 'react';
import { useEventListener, DEFAULT_KEY } from '../../Utils'
import styles from './Style'

const CONSTANTS = {
    MIN: "min",
    SEC: "sec",
    TEXT_PRIMARY_COLOR: "#d0d0d0",
    TEXT_SECONDARY_COLOR: "#686868",
    MIN_STEP: 5,
    SEC_STEP: 5
}

const Timer = (props) => {
    const [time, setTime] = React.useState({ min: 0, sec: 0 })
    const [initialTime, setInitialTime] = React.useState({ min: 0, sec: 0 })
    const [running, setRunning] = React.useState(false)
    const [progressPercentage, setProgressPercentage] = React.useState(0)
    const [editSelected, setEditSelected] = React.useState(CONSTANTS.MIN)
    let interval
    console.log("REFRESH?",props)
    const KEY_FUNCTIONS = {
        "Space": () => {
            setRunning(!!!running)
        },
        "KeyR": () => {
            setRunning(false)
            setTime(initialTime)
            setProgressPercentage(0)
        },
        "ArrowUp": () => {
            if (editSelected === CONSTANTS.SEC && (time.sec + CONSTANTS.SEC_STEP) < 59) {
                setInitialTime(prevTime => ({ ...prevTime, sec: prevTime.sec + CONSTANTS.SEC_STEP }))
                setTime(prevTime => ({ ...prevTime, sec: prevTime.sec + CONSTANTS.SEC_STEP }))
            } else if (editSelected === CONSTANTS.MIN && (time.min + CONSTANTS.MIN_STEP) < 59) {
                setInitialTime(prevTime => ({ ...prevTime, min: prevTime.min + CONSTANTS.MIN_STEP }))
                setTime(prevTime => ({ ...prevTime, min: prevTime.min + CONSTANTS.MIN_STEP }))
            }
        },
        "ArrowDown": () => {
            if (editSelected === CONSTANTS.SEC && (time.sec - CONSTANTS.SEC_STEP) > 0) {
                setInitialTime(prevTime => ({ ...prevTime, sec: prevTime.sec - CONSTANTS.SEC_STEP }))
                setTime(prevTime => ({ ...prevTime, sec: prevTime.sec - CONSTANTS.SEC_STEP }))
            } else if (editSelected === CONSTANTS.MIN && (time.min - CONSTANTS.MIN_STEP) > 0) {
                setInitialTime(prevTime => ({ ...prevTime, min: prevTime.min - CONSTANTS.MIN_STEP }))
                setTime(prevTime => ({ ...prevTime, min: prevTime.min - CONSTANTS.MIN_STEP }))
            }
        },
        "ArrowLeft": () => {
            if (editSelected === CONSTANTS.SEC) {
                setEditSelected(CONSTANTS.MIN)
            }
        },
        "ArrowRight": () => {
            if (editSelected === CONSTANTS.MIN) {
                setEditSelected(CONSTANTS.SEC)
            }
        }
    }
    useEventListener("keydown", (key) => {
        if (KEY_FUNCTIONS[key.code]) {
            KEY_FUNCTIONS[key.code]()
        }
    })
    useEventListener("touchend", (key) => {
        KEY_FUNCTIONS["Space"]() || DEFAULT_KEY()
    })
    const setTimer = () => {
        const timeFromPath = getTimeFromPath()
        if (((timeFromPath.min > 0 || timeFromPath.sec > 0) && (time.sec === 0 && time.min === 0)) || (time.sec !== timeFromPath.sec || time.min !== timeFromPath.min)) {
            setInitialTime(timeFromPath)
            setTime(timeFromPath)
        }
    }

    const calculatePercentage = () => {
        const { min, sec } = time
        const timeInSec = (min * 60) + sec
        const initialTimeInSec = (initialTime.min * 60) + initialTime.sec
        setProgressPercentage((timeInSec * 100) / initialTimeInSec)
    }

    React.useEffect(() => {
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
    setTimer()

    return (
        <div style={styles.container}>
            <div id="help-text" style={styles.helpText}>
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
            <div style={styles.textContainer}>
                <span
                    style={{
                        color: editSelected === CONSTANTS.MIN && !running ? CONSTANTS.TEXT_SECONDARY_COLOR : CONSTANTS.TEXT_PRIMARY_COLOR
                    }}
                >
                    {time.min.toString().length > 1 ? time.min : `0${time.min}`}
                </span>
                <span style={{ color: CONSTANTS.TEXT_PRIMARY_COLOR }}>
                    :
                </span>
                <span
                    style={{
                        color: editSelected === CONSTANTS.SEC && !running ? CONSTANTS.TEXT_SECONDARY_COLOR : CONSTANTS.TEXT_PRIMARY_COLOR
                    }}>

                    {time.sec.toString().length > 1 ? time.sec : `0${time.sec}`}
                </span>
            </div>
        </div>
    )
}

export default Timer
