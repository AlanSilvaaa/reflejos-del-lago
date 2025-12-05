<div align=center>
  <img src="frontend/src/assets/images/logo.png" alt="Logo of Reflejos del lago" width="400">
</div>

<div align=center>
    <img src="https://img.shields.io/github/actions/workflow/status/sharedUSSRepo/Reflejos-del-lago/dockerhub.yml?logo=docker&label=Dockerhub" alt="Badge of dockerhub">
    <img src="https://img.shields.io/github/actions/workflow/status/sharedUSSRepo/Reflejos-del-lago/linter.yml?logo=eslint&label=Linter" alt="Badge of linter">
    <img src="https://img.shields.io/github/actions/workflow/status/sharedUSSRepo/Reflejos-del-lago/tests.yml?logo=jest&label=Tests" alt="Badge of tests">
    <img src="https://img.shields.io/github/actions/workflow/status/sharedUSSRepo/Reflejos-del-lago/deploy.yml?logo=iCloud&label=Deploy" alt="Badge of deploy">
</div>

**Reflejos del lago** is a Geoguessr game of the province of Llanquihue. Try to guess where you are, looking just a photo. Is it Puerto Varas?, Puerto Montt? or maybe Llanquihue? Try your best to make the best score you can!

Play the game [here!](https://alanuss.github.io/Reflejos-del-lago/#/)

## Install

### Locally
> [!IMPORTANT]
> the backend and frontend have `.env` files that should be filled with keys in order to the app to work. Go to the specific directories `backend` and `frontend` to see their README.md to more details.

First, clone the repository
```bash
https://github.com/sharedUSSRepo/Reflejos-del-lago.git
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
1. open a new terminal
2. go to `backend` and do `pnpm run serve`
3. open another terminal
4. go to `frontend` and do `pnpm run serve`

Now, with your database, backend and frontend running, you can go to http://localhost:8080/ and see the page in action.

### Docker
To run this project using docker, first, clone the repo and build the docker compose that is on the root.
```bash
docker compose up --build
```
This should set you up with the database populated and all. Make sure to have the `.env` files with the actual files before doing the compose up.

## Authors
- @[AlanSilvaaa](https://github.com/AlanSilvaaa)
- @[Vinbu](https://github.com/Vinbu)
