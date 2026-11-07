# ParkingPilot SD

A React + Vite website for finding San Diego street parking with an interactive Leaflet map.

## Run locally

Requires Node.js 22.12+ (or a newer supported version).

    npm install
    npm run dev

Open the local URL printed by Vite.

## Build

    npm run build
    npm run preview

Deploy the generated dist directory to a static website host. This repository contains the frontend; the parking backend is hosted separately.

## Configuration

The frontend defaults to https://san-diego-parking-backend.onrender.com.
To use another backend, copy .env.example to .env and change VITE_API_URL.
The backend must allow the frontend origin through CORS.

## Features

- Address search within San Diego and browser location lookup
- Interactive map with parking pins and click-to-search
- Distance filtering up to 2 km
- Arrival time, length of stay, and free/paid filters
- Availability estimates, meter details, and directions
- Parking assistant chat using structured API results

Arrival date input currently uses the displayed Pacific standard time offset (UTC-08:00). Check the offset when planning dates during daylight saving time.

Parking predictions use historical City of San Diego payment transactions, not live space sensors. Availability is not guaranteed. Check posted restrictions and signs.

Map tiles and address search use OpenStreetMap services. Parking data and chat use the configured backend.
