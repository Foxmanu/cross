import React, { useState, useRef } from "react";

function Location() {
  const [values, setValues] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const watchIdRef = useRef(null);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log("Lat:", latitude);
        console.log("Lng:", longitude);
        console.log("Accuracy:", accuracy);

        // ✅ Accept only GOOD accuracy
        if (accuracy <= 13) {
          setValues({ latitude, longitude, accuracy });

          // ✅ Stop watching once we get precise location
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      },
      (error) => {
        console.error(error);
        alert("Please allow precise location");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <h3>Latitude: {values.latitude}</h3>
      <h3>Longitude: {values.longitude}</h3>
      <h3>Accuracy: {values.accuracy && `${values.accuracy} meters`}</h3>

      <button onClick={requestLocationPermission}>
        Allow Location
      </button>
    </>
  );
}

export default Location;
