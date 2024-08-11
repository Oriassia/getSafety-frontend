import React, { useEffect, useState, useCallback, useMemo } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import MyLocationBtn from "../components/MyLocationBtn";
import axios from "axios";
import { IRoom } from "@/context/AuthContext";
import ColorMap from "@/components/ColorMap";

interface Location {
  lat: number;
  lng: number;
}

const libraries: "places"[] = ["places"];
const containerStyle = {
  width: "100vw",
  height: "90vh",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  clickableIcons: false, // Disable clicking on places other than the bomb shelters
};

const pinIcons = {
  blue: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  red: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  orange: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
  green: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
};

function MapPage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDwY1nKLe_qB7XyA6_8uBsBkOG_uNdtxgg", // Replace with your actual Google Maps API key
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [shelters, setShelters] = useState<IRoom[]>([]);

  const getShelters = useCallback(
    async (loc: Location) => {
      if (!loc || !map) return;
      try {
        const response = await axios.get("http://localhost:3000/api/room");
        console.log("Shelters Data:", response.data.rooms);
        setShelters(response.data.rooms);
      } catch (err) {
        console.log(err);
      }
    },
    [map]
  );

  const centerMap = useCallback(() => {
    if (location && map) {
      map.panTo(new google.maps.LatLng(location.lat, location.lng));
      map.setZoom(20);
    }
  }, [location, map]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(currentLocation);
          if (map) {
            map.setCenter(
              new google.maps.LatLng(currentLocation.lat, currentLocation.lng)
            );
            map.setZoom(20);
            getShelters(currentLocation);
          }
        },
        (error) => {
          console.error("Error obtaining location: ", error);
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, [map, getShelters]);

  const getPinColor = useCallback((shelter: IRoom) => {
    if (!shelter.available) {
      return pinIcons.red;
    }
    return shelter.isPublic ? pinIcons.orange : pinIcons.green;
  }, []);

  const handleMarkerClick = useCallback((shelter: IRoom) => {
    alert(`Clicked on shelter: ${shelter.available}`);
  }, []);

  return (
    <div>
      {isLoaded && location ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            location
              ? new google.maps.LatLng(location.lat, location.lng)
              : undefined
          }
          zoom={15}
          onLoad={setMap}
          options={mapOptions}
        >
          <MarkerF
            key={1}
            position={new google.maps.LatLng(location.lat, location.lng)}
            icon={{
              url: pinIcons.blue,
              scaledSize: new google.maps.Size(25, 25),
            }}
          />

          {shelters.map((shelter: IRoom, index) =>
            shelter.location ? (
              <MarkerF
                key={`${shelter.roomId}${index}`}
                position={{
                  lat: shelter.location.lat,
                  lng: shelter.location.lng,
                }}
                icon={{
                  url: getPinColor(shelter),
                  scaledSize: new google.maps.Size(25, 25),
                }}
                onClick={() => handleMarkerClick(shelter)}
              />
            ) : null
          )}
          <MyLocationBtn centerMap={centerMap} />
          <ColorMap />
        </GoogleMap>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default MapPage;
