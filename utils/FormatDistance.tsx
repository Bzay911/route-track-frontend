 // Helper function to convert meters to km
  const FormatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1) + " km";
  };

  export default FormatDistance;