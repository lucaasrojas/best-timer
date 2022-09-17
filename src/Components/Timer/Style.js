const styles = {
  container: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#150e56"
  },
  helpText: {
    position: "absolute",
    top: 10,
    left: 20,
    fontSize: "clamp(0.5rem,1.5vw,8rem)",
    lineHeight: "0.4vw",
    zIndex: 1,
    color: "#d0d0d0"
  },
  textContainer: {
    fontSize: "clamp(0.5rem,15vw,10rem)",
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    inset: "unset"
  }
}

export default styles;