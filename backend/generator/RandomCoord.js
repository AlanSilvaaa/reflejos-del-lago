// This is a code that generate a random lat and lon coordinates, from a circle generated based on an established center and radius.

var mongoose = require("mongoose");
var path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

var mongodb = require("../helpers/mongodb.js");
var city = require("../schemas/cities.js");
var all_coordinates = require("../schemas/allcoordinates.js");

const EarthRKm = 6371;
const OneDegree = ((EarthRKm * 2 * Math.PI) / 360) * 1000;

function random_point_in_disk(max_radius) {
  r = max_radius * Math.sqrt(Math.random());
  theta = Math.random() * 2 * Math.PI;
  return {
    dx: r * Math.cos(theta),
    dy: r * Math.sin(theta),
  };
}

function random_location(lat, lon, max_radius) {
  const { dx, dy } = random_point_in_disk(max_radius);
  delta_lat = dy / OneDegree;
  delta_lon = dx / (OneDegree * Math.cos((lat * Math.PI) / 180));

  random_lat = lon + delta_lat;
  random_lon = lat + delta_lon;
  return {
    lat: random_lon,
    lon: random_lat,
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

async function save_true_coordinates(city, lat, lon) {
  await mongodb();
  await mongoose.connection.asPromise();

  const data_json = { cityname: city, latitude: lat, longitude: lon };

  try {
    await all_coordinates.create(data_json);
  } catch (err) {
    if (err.code === 11000) {
      console.warn("⚠️ Coordenada duplicada, no se guarda:", lat, lon);
    } else {
      throw err;
    }
  }
}

async function main() {
  await mongodb();
  await mongoose.connection.asPromise();

  const cities_json = await city.find({}).exec();

  for (const city of cities_json) {
    const { latitude, longitude, cityname } = city;
    for (let i = 0; i < 2000; i++) {
      const { lat, lon } = random_location(latitude, longitude, 15000);
      console.log(`Ciudad: ${cityname}`);
      console.log(`→ Coordenada aleatoria: lat=${lat}, lon=${lon}`);

      const result = await checkStreetView(lat, lon);
      if (result.ok) {
        await save_true_coordinates(cityname, result.lat, result.lon);
        console.log(`Coordenadas reales: lat=${result.lat}, lon=${result.lon}`);
      }
      console.log(
        result.ok
          ? "✅ Hay Street View\n"
          : "❌ No hay Street View o no pertenece a Google\n",
      );
    }
  }

  await mongoose.connection.close();
}

main().catch(console.error);
