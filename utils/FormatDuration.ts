 const FormatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return minutes + " min";
  };

  export default FormatDuration;