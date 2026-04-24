# AGENTS.md

## Context

This app is based on the popular game Geoguessr, where players are placed in a random location on Google Street View and must guess their location based on visual clues. The app uses the Google Street View API to fetch random locations and display them to the user. The user can then make a guess by entering a location, and the app will calculate the distance between the guessed location and the actual location, providing feedback on how close the guess was. This app is limited to the province of Llanquihue, and has all the cities from this land.

## Frameworks

- This project uses Vue3 with composition API, alongside with the Google Maps JavaScript API to fetch and display Street View images.
- For visuals, it uses Tailwind CSS and Primevue for UI components. Always prefer to use this Primevue components when possible, like buttons, inputs, modals, etc. to maintain a consistent design across the app.
- The database is located on a single file called reflejos.sqlite3, and it uses sqlite3 to query the data.
