# Frontend
This is the frontend of the app. It uses Vue 3 and is built with Vite.

## Requirements
- pnpm
- a Google Maps Api Key
- a [Google Maps Map ID](https://console.cloud.google.com/google/maps-apis/studio/maps)

## Setup
first install the packages using pnpm
```bash
pnpm install
```

Then, make sure you have an .env file that contains the following:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_GOOGLE_MAP_ID=your_map_id
```

## Run the frontend
To run the frontend, just do:
```bash
pnpm run serve
```
