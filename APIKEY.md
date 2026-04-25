# API Key Setup Instructions

This project uses the Google Maps JavaScript API to display maps and Street View. In the end, you should have a .env file in the frontend/ directory with the following content:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_GOOGLE_MAP_ID=your_map_id
```

1. Create or select a Google Cloud project for this app.

2. Enable these APIs:

- Maps JavaScript API
- Street View Static API is not required for your current setup
- Street View Publish API is not required
- If prompted by Maps features, also enable Geocoding API only if you later use it

3. Go to APIs & Services → Credentials.

4. Click Create credentials → API key.

5. Copy the key and restrict it:

- Application restrictions: HTTP referrers (websites)
- Add:
  - http://localhost:_/_
  - http://127.0.0.1:*/*
  - https://<your-github-username>.github.io/\*

6. Under API restrictions, limit the key to:

- Maps JavaScript API

7. Create a Map ID:

- Go to Google Maps Platform → Map Management
- Click Create Map ID
- Choose JavaScript
- Copy the Map ID

8. In frontend/, create a .env file with:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_GOOGLE_MAP_ID=your_map_id
```

9. Run:

```bash
pnpm dev
```

10. Open the app and verify:

- the province map loads
- Street View loads
- result map markers render
  Important:
- For GitHub Pages, the referrer must match your real URL exactly enough, for example:
  - https://alan.github.io/Reflejos-del-lago/*
- If the map stays blank, check browser console for:
  - RefererNotAllowedMapError
  - ApiNotActivatedMapError
  - invalid Map ID errors
