import React, { useEffect, useState } from "react";
import { useEventListener, DEFAULT_KEY } from "../../Utils"
import styles from "./Style"

const CONSTANTS = {
  MIN: "min",
  SEC: "sec",
  TEXT_PRIMARY_COLOR: "#d0d0d0",
  TEXT_SECONDARY_COLOR: "#686868",
  MIN_STEP: 1,
  SEC_STEP: 5
}
let roundTime = (number) => Math.ceil(number / 5) * 5

const Timer = (props) => {
  const [time, setTime] = useState({ current: { min: 0, sec: 0 }, initial: { min: 0, sec: 0 } })
  const [running, setRunning] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [editSelected, setEditSelected] = useState(CONSTANTS.MIN)
  let interval

  const KEY_FUNCTIONS = {
    "Space": () => {
      setRunning(!running)
    },
    "KeyR": () => {
      setRunning(false)
      setTimer()
      setProgressPercentage(0)
      updateTab({}, true)
    },
    "ArrowUp": () => {
      if (editSelected === CONSTANTS.SEC && (time.current.sec + CONSTANTS.SEC_STEP) < 59) {
        setTime(prevTime => ({
          ...prevTime,
          current: { ...prevTime.current, sec: roundTime(prevTime.current.sec) + CONSTANTS.SEC_STEP },
          initial: { ...prevTime.initial, sec: roundTime(prevTime.initial.sec) + CONSTANTS.SEC_STEP }
        }))
      } else if (editSelected === CONSTANTS.MIN && (time.current.min + CONSTANTS.MIN_STEP) < 59) {
        setTime(prevTime => ({
          ...prevTime,
          current: { ...prevTime.current, min: prevTime.current.min + CONSTANTS.MIN_STEP },
          initial: { ...prevTime.initial, min: prevTime.initial.min + CONSTANTS.MIN_STEP }
        }))
      }
    },
    "ArrowDown": () => {
      if (editSelected === CONSTANTS.SEC && (time.current.sec - CONSTANTS.SEC_STEP) >= 0) {
        setTime(prevTime => ({
          ...prevTime,
          current: { ...prevTime.current, sec: roundTime(prevTime.current.sec) - CONSTANTS.SEC_STEP },
          initial: { ...prevTime.initial, sec: roundTime(prevTime.initial.sec) - CONSTANTS.SEC_STEP }
        }))
      } else if (editSelected === CONSTANTS.MIN && (time.current.min - CONSTANTS.MIN_STEP) >= 0) {
        setTime(prevTime => ({
          ...prevTime,
          current: { ...prevTime.current, min: prevTime.current.min - CONSTANTS.MIN_STEP },
          initial: { ...prevTime.initial, min: prevTime.initial.min - CONSTANTS.MIN_STEP }
        }))
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
  useEventListener("touchend", () => {
    KEY_FUNCTIONS["Space"]() || DEFAULT_KEY()
  })
  const setTimer = () => {
    const timeFromPath = getTimeFromPath()
    if (((timeFromPath.min > 0 || timeFromPath.sec > 0) && (time.current.sec === 0 && time.current.min === 0)) || (time.current.sec !== timeFromPath.sec || time.current.min !== timeFromPath.min)) {
      setTime(prevTime => ({
        ...prevTime,
        current: { ...prevTime.current, ...timeFromPath },
        initial: { ...prevTime.initial, ...timeFromPath }
      }))
    }
  }

  const calculatePercentage = () => {
    const { min, sec } = time.current
    const timeInSec = (min * 60) + sec
    const initialTimeInSec = (time.initial.min * 60) + time.initial.sec
    setProgressPercentage((timeInSec * 100) / initialTimeInSec)
  }
  const updateTab = (time, restore = false) => {
    const timeLabel = generateTimeLabel(time)
    document.title = restore ? "Best Timer" : `${timeLabel.min}:${timeLabel.sec} - Best Timer`
  }

  const generateTimeLabel = (time) => {

    return {
      min: time.current.min.toString().length > 1 ? time.current.min : `0${time.current.min}`,
      sec: time.current.sec.toString().length > 1 ? time.current.sec : `0${time.current.sec}`
    }
  }
  useEffect(() => {
    setTimer()
  }, [])

  useEffect(() => {
    if (running) {
      calculatePercentage()
      updateTab(time)
    }
  }, [time, running])

  useEffect(() => {
    if (running && !interval) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (prevTime.current.sec > 0) {
            return { ...prevTime, current: { ...prevTime.current, sec: prevTime.current.sec - 1 } }
          } else if (prevTime.current.sec === 0 && prevTime.current.min > 0) {
            return { ...prevTime, current: { min: prevTime.current.min - 1, sec: 59 } }
          } else {
            setRunning(false)
            clearInterval(interval)
            return { ...prevTime, current: { min: 0, sec: 0 } }
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
        pathname = pathname.replace("minutes", ".").replace("seconds", "").replace("minute", ".").replace("second", "").replace("min", ".").replace("sec", "")
      }

      return response
    }

  }
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
          {generateTimeLabel(time).min}
        </span>
        <span style={{ color: CONSTANTS.TEXT_PRIMARY_COLOR }}>
          :
        </span>
        <span
          style={{
            color: editSelected === CONSTANTS.SEC && !running ? CONSTANTS.TEXT_SECONDARY_COLOR : CONSTANTS.TEXT_PRIMARY_COLOR
          }}>
          {generateTimeLabel(time).sec}

        </span>
      </div>
    </div>
  )
}

export default Timer;
