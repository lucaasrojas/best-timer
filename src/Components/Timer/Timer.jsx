import React, { useCallback, useEffect, useState } from "react";
import { useEventListener, DEFAULT_KEY } from "../../Utils"
import styles from "./Style"
import moment from "moment"
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
  const [currentTime, setCurrentTime] = useState({ min: 0, sec: 0, date: undefined })
  const [initialTime, setInitialTime] = useState({ min: 0, sec: 0, date: undefined })
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
      setCurrentTime(initialTime)
      calculatePercentage(initialTime)
      updateTab({}, true)
    },
    "ArrowUp": useCallback(() => {
      if (editSelected === CONSTANTS.SEC && (currentTime?.sec + CONSTANTS.SEC_STEP) < 59) {
        const newTime = {
          sec: roundTime(currentTime.sec) + CONSTANTS.SEC_STEP,
          min: currentTime.min
        }
        setCurrentTime(newTime)
        setInitialTime(newTime)
      } else if (editSelected === CONSTANTS.MIN && (currentTime.min + CONSTANTS.MIN_STEP) < 59) {
        const newTime = {
          sec: currentTime.sec,
          min: currentTime.min + CONSTANTS.MIN_STEP
        }
        setCurrentTime(newTime)
        setInitialTime(newTime)
      }
    },[currentTime, editSelected]),
    "ArrowDown": useCallback(() => {
      if (editSelected === CONSTANTS.SEC && (currentTime.sec - CONSTANTS.SEC_STEP) >= 0) {
        const newTime = {
          sec: roundTime(currentTime.sec) - CONSTANTS.SEC_STEP,
          min: currentTime.min
        }
        setCurrentTime(newTime)
        setInitialTime(newTime)
      } else if (editSelected === CONSTANTS.MIN && (currentTime.min - CONSTANTS.MIN_STEP) >= 0) {
        const newTime = {
          sec: currentTime.sec,
          min: currentTime.min - CONSTANTS.MIN_STEP
        }
        setCurrentTime(newTime)
        setInitialTime(newTime)
      }
      setInitialTime(currentTime)
    },[currentTime, editSelected]),
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
    if (timeFromPath) {
      if (timeFromPath?.min > 0 || timeFromPath?.sec > 0) {

        setInitialTime({ ...timeFromPath })

        setCurrentTime(timeFromPath)
      }
    }
  }

  const calculatePercentage = (customTime) => {
    const { min, sec } = customTime || currentTime
    const timeInSec = (min * 60) + sec
    const initialTimeInSec = (initialTime.min * 60) + initialTime.sec
    setProgressPercentage((timeInSec * 100) / initialTimeInSec)
  }
  const updateTab = (time, restore = false) => {
    const timeLabel = generateTimeLabel(time)
    document.title = restore ? "Best Timer" : `${timeLabel.min}:${timeLabel.sec} - Best Timer`
  }

  const generateTimeLabel = (time) => {
    return {
      min: time?.min?.toString().length > 1 ? time?.min : `0${time?.min}`,
      sec: time?.sec?.toString().length > 1 ? time?.sec : `0${time?.sec}`
    }
  }
  useEffect(() => {
    setTimer()
  }, [])

  useEffect(() => {
    if (running) {
      calculatePercentage()
      updateTab(currentTime)
    }
  }, [currentTime, running])

  useEffect(() => {
    if (running && !interval) {
      let targetDate = moment().add(currentTime.min,"m").add(currentTime.sec, "s")
      interval = setInterval(() => {
        
        if(targetDate.diff(moment(),"s") >= 0){

          setCurrentTime({
            min: targetDate.diff(moment(), "minutes"),
            sec: targetDate.diff(moment(), "seconds") - (targetDate.diff(moment(), "minutes") * 60)
          })
        } else {
          clearInterval(interval)
        }
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
        pathname = pathname.split(".")
      }

      response = { min: Number(pathname[0]), sec: Number(pathname[1]), date: new Date() }

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
          {generateTimeLabel(currentTime).min}
        </span>
        <span style={{ color: CONSTANTS.TEXT_PRIMARY_COLOR }}>
          :
        </span>
        <span
          style={{
            color: editSelected === CONSTANTS.SEC && !running ? CONSTANTS.TEXT_SECONDARY_COLOR : CONSTANTS.TEXT_PRIMARY_COLOR
          }}>
          {generateTimeLabel(currentTime).sec}

        </span>
      </div>
    </div>
  )
}

export default Timer;
