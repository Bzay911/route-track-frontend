 const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return "Invalid Time";
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  export default formatTime;