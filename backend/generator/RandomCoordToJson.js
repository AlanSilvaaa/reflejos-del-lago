// This script generates random lat/lon coordinates from a circle based on
// an established center and radius, then saves valid results to a JSON file.

var mongoose = require("mongoose");
var fs = require("fs/promises");
var path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

var mongodb = require("../helpers/mongodb.js");
var city = require("../schemas/cities.js");

const EarthRKm = 6371;
const OneDegree = ((EarthRKm * 2 * Math.PI) / 360) * 1000;
const OUTPUT_FILE = path.resolve(__dirname, "random_coordinates.json");

function random_point_in_disk(max_radius) {
  const r = max_radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    dx: r * Math.cos(theta),
    dy: r * Math.sin(theta),
  };
}

function random_location(lat, lon, max_radius) {
  const { dx, dy } = random_point_in_disk(max_radius);
  const delta_lat = dy / OneDegree;
  const delta_lon = dx / (OneDegree * Math.cos((lat * Math.PI) / 180));

  return {
    lat: lat + delta_lat,
    lon: lon + delta_lon,
  };
}

async function checkStreetView(lat, lon) {
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lon}&radius=1000&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(`Respuesta Street View: ${data.status}`);
  if (data.status === "OK" && data.copyright.includes("Google")) {
    return {
      ok: true,
      lat: data.location.lat,
      lon: data.location.lng,
    };
  }
  return { ok: false };
}

async function save_coordinates_to_json(coordinates) {
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(coordinates, null, 2));
}

async function main() {
  await mongodb();
  await mongoose.connection.asPromise();

  const cities_json = await city.find({}).exec();
  const coordinates = [];

  for (const city_data of cities_json) {
    const { latitude, longitude, cityname } = city_data;
    for (let i = 0; i < 2000; i++) {
      const { lat, lon } = random_location(latitude, longitude, 15000);
      console.log(`Ciudad: ${cityname}`);
      console.log(`→ Coordenada aleatoria: lat=${lat}, lon=${lon}`);

      const result = await checkStreetView(lat, lon);
      if (result.ok) {
        coordinates.push({
          cityname,
          latitude: result.lat,
          longitude: result.lon,
        });
        console.log(`Coordenadas reales: lat=${result.lat}, lon=${result.lon}`);
      }
      console.log(
        result.ok
          ? "✅ Hay Street View\n"
          : "❌ No hay Street View o no pertenece a Google\n",
      );
    }
  }

  await save_coordinates_to_json(coordinates);
  console.log(`Archivo JSON guardado en: ${OUTPUT_FILE}`);

  await mongoose.connection.close();
}

main().catch(console.error);
