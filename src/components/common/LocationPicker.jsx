import React, { useState, useEffect, useMemo, useRef } from "react";
import { Country, State, City } from "country-state-city";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Select from "./Select";
import Input from "./Input";
import { MapPin, Search } from "lucide-react/dist/esm/lucide-react.mjs";

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapEvents({ setPosition, onChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      handleMapClick(lat, lng, onChange);
    },
  });
  return null;
}

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

const handleMapClick = async (lat, lng, onChange) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    
    if (data && data.address) {
      const { country, state, city, town, village, county, suburb, neighbourhood, road } = data.address;
      
      const foundCountry = Country.getAllCountries().find(c => c.name.toLowerCase() === country?.toLowerCase());
      const countryCode = foundCountry ? foundCountry.isoCode : "";
      
      let stateCode = "";
      if (countryCode && state) {
        const foundState = State.getStatesOfCountry(countryCode).find(s => s.name.toLowerCase() === state.toLowerCase());
        stateCode = foundState ? foundState.isoCode : "";
      }

      let cityName = city || town || village || county || "";
      let areaName = neighbourhood || suburb || road || "";

      onChange({
        country: countryCode,
        state: stateCode,
        city: cityName,
        area: areaName,
        latitude: lat,
        longitude: lng,
      });
    } else {
      onChange({ latitude: lat, longitude: lng });
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    onChange({ latitude: lat, longitude: lng });
  }
};

export default function LocationPicker({ value, onChange }) {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => {
    return value.country ? State.getStatesOfCountry(value.country) : [];
  }, [value.country]);
  const cities = useMemo(() => {
    return value.country && value.state ? City.getCitiesOfState(value.country, value.state) : [];
  }, [value.country, value.state]);

  const [position, setPosition] = useState(
    value.latitude && value.longitude ? [value.latitude, value.longitude] : [20.5937, 78.9629] // Default India
  );

  useEffect(() => {
    if (value.latitude && value.longitude) {
      setPosition([value.latitude, value.longitude]);
    }
  }, [value.latitude, value.longitude]);

  const handleCountryChange = (e) => {
    onChange({ ...value, country: e.target.value, state: "", city: "" });
  };

  const handleStateChange = (e) => {
    onChange({ ...value, state: e.target.value, city: "" });
  };

  const handleCityChange = (e) => {
    onChange({ ...value, city: e.target.value });
  };

  const handleAreaChange = (e) => {
    onChange({ ...value, area: e.target.value });
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          handleMapClick(lat, lng, onChange);
        },
        (err) => {
          console.error(err);
          alert("Could not get your location.");
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Country
          <Select value={value.country || ""} onChange={handleCountryChange} className="rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </Select>
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          State
          <Select value={value.state || ""} onChange={handleStateChange} disabled={!value.country} className="rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          City
          {cities.length > 0 ? (
            <Select value={value.city || ""} onChange={handleCityChange} disabled={!value.state} className="rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </Select>
          ) : (
            <Input type="text" value={value.city || ""} onChange={handleCityChange} placeholder="Enter City" disabled={!value.state} />
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Area / Locality
          <Input type="text" value={value.area || ""} onChange={handleAreaChange} placeholder="Enter Area" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin size={16} /> Choose from Map (Optional)
          </label>
          <button type="button" onClick={locateMe} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Search size={12} /> Use My Location
          </button>
        </div>
        <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300 z-10">
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {value.latitude && value.longitude && (
              <Marker position={[value.latitude, value.longitude]} />
            )}
            <MapEvents setPosition={setPosition} onChange={onChange} />
            <MapUpdater position={position} />
          </MapContainer>
        </div>
        <p className="text-xs text-gray-500">Click anywhere on the map to autofill location details.</p>
      </div>
    </div>
  );
}
