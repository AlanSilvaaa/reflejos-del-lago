<div align=center>
  <img src="src/assets/images/logo.png" alt="Logo of Reflejos del lago" width="400">
</div>

<div align=center>
    <img src="https://img.shields.io/github/actions/workflow/status/AlanSilvaaa/reflejos-del-lago/linter.yml?logo=eslint&label=Linter" alt="Badge of linter">
    <img src="https://img.shields.io/github/actions/workflow/status/AlanSilvaaa/reflejos-del-lago/tests.yml?logo=jest&label=Tests" alt="Badge of tests">
    <img src="https://img.shields.io/github/actions/workflow/status/AlanSilvaaa/reflejos-del-lago/deploy.yml?logo=iCloud&label=Deploy" alt="Badge of deploy">
</div>

**Reflejos del lago** is a Geoguessr game of the province of Llanquihue. Try to guess where you are by looking just to a photo. Is it Puerto Varas?, Puerto Montt? Or maybe Llanquihue? Try your best and explore every corner of this beautiful land!

Play the game [here!](https://AlanSilvaaa.github.io/reflejos-del-lago/#/)

## Install

### Locally

> [!IMPORTANT]
> the project uses a `.env` file that is not commited to the repository for accessing the API keys. The instructions to create this file are on [this](./APIKEY.md) file.

First, clone the repository

```bash
git clone git@github.com:AlanSilvaaa/reflejos-del-lago.git
```

then go to `frontend` and `backend` and install the dependencies. Make sure you have `pnpm` installed. And do

```bash
pnpm install
```

Then go to the `database` and do

```bash
docker compose up --build
```

While the server is running, populate it with the cities and coordinates. Go to the `backend/helpers` and there do

```bash
node populateCoordinates.js
node populateCities.js
```

At this point, you should have one terminal running the database. You'll need two more, one for the backend and another for the frontend.

1. Open a new terminal
2. Go to `backend` and do `pnpm run serve`
3. Open another terminal
4. Go to `frontend` and do `pnpm run serve`

Now, with your database, backend and frontend running, you can go to http://localhost:8080/ and see the page in action.

### Docker

To run this project using docker, first, clone the repo and build the docker compose that is on the root.

```bash
docker compose up --build
```

This should set you up with the database populated and all. Make sure to have the `.env` files with the actual files before doing the compose up.

## Authors

- [@AlanSilvaaa](https://github.com/AlanSilvaaa)
- [@Vinbu](https://github.com/Vinbu)

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
