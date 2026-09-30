# BlueSentinel

**Empowering Citizens. Protecting Communities.**

BlueSentinel is a citizen science platform that connects citizens with environmental monitoring and public health infrastructure.

The system combines spatial risk analysis, alternative routing, citizen verification, AI-assisted image analysis, and HL7 FHIR reporting. The main idea is simple: identify areas that may have an environmental risk, let people on the ground verify them, and provide authorities with structured information they can act on.

## Overview

BlueSentinel has two main parts.

The first is the **Calm Route**. Instead of only finding the shortest or fastest route, it considers nearby blue spaces such as rivers, canals, lakes, and streams. Research on nature and blue-space exposure has associated these environments with reduced perceived stress and improved mood, with some studies also reporting changes in physiological stress markers such as cortisol.

The second is the **Sentinel Grid**. The system uses spatial and weather data to identify locations that may be more likely to develop environmental risks such as stagnant water after rainfall.

These locations are shown as Sentinel Nodes. They are predictions, not confirmed hazards. Citizens can visit these locations and provide observations from the ground.

## How It Works

The system follows a simple flow:

```text
Weather + OSM Data
        |
        v
Risk Analysis
        |
        v
Sentinel Nodes
        |
        v
Citizen Verification
        |
        +------> Image
        |          |
        |          v
        |      Gemini AI
        |
        v
Environmental Report
        |
        v
Admin Review
        |
        v
FHIR Observation
        |
        v
Resolved
```

### 1. Risk Detection

The Python risk engine collects spatial information from OpenStreetMap and weather information from Open-Meteo.

It uses factors such as recent rainfall, water-related features, and geographic location to identify areas that could potentially develop environmental risks.

The resulting locations are stored as Sentinel Nodes.

### 2. Calm Route

When a user selects a destination, BlueSentinel generates a route and can provide an alternative Calm Route.

The Calm Route considers nearby blue spaces rather than optimizing only for distance.

The purpose is to give users another routing option that may provide greater exposure to natural surroundings while still reaching the destination.

### 3. Citizen Verification

When a user's route comes close to an active Sentinel Node, the system can show the user that there is a potential risk nearby.

The user can then verify the location by submitting:

- An image
- Water status
- Mosquito presence
- Additional observations

This gives the system information that cannot be obtained reliably from spatial data alone.

### 4. AI Image Analysis

The submitted image is analyzed using the Gemini Vision API.

The AI checks whether the image is relevant and determines whether the visible water appears to be:

```text
STAGNANT
FLOWING
REJECTED
```

For example, irrelevant images can be rejected before they reach the administrator.

The AI result is treated as an additional verification signal. It does not replace the citizen's observation or the administrator's review.

### 5. Admin Review

Submitted reports appear in the Admin Command Center.

An administrator can review:

- The Sentinel Node
- Citizen observations
- Uploaded images
- AI result
- Water status
- Mosquito presence

The administrator can then verify the report and take the required action.

### 6. FHIR Report

After a report has been verified, BlueSentinel generates a structured HL7 FHIR `Observation`.

The FHIR payload is stored with the verification and can be used as a standardized representation of the environmental observation.

## Key Features

- Alternative Calm Route based on nearby blue spaces
- OpenStreetMap-based spatial analysis
- Weather-based environmental risk detection
- Sentinel Nodes for predicted risk locations
- Route-based proximity detection
- Citizen verification and reporting
- Image upload for field observations
- Gemini Vision AI image analysis
- Gamification and citizen points
- Admin Command Center
- Report verification and resolution
- HL7 FHIR `Observation` generation
- Automatic lifecycle management for temporary risk nodes

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS

### Backend

- Next.js API Routes / Server Logic
- Python
- FastAPI

### Database

- PostgreSQL
- Supabase
- Prisma

### Spatial and Risk Engine

- OSMnx
- NetworkX
- GeoPandas
- OpenStreetMap
- Open-Meteo

### AI

- Google Gemini Vision API
- `@google/generative-ai`

### Background Processing

- APScheduler

### Interoperability

- HL7 FHIR

## Architecture

```text
                         BlueSentinel
                              |
             +----------------+----------------+
             |                                 |
             v                                 v
        Next.js App                       Python Engine
             |                                 |
       +-----+------+                    +-----+------+
       |            |                    |            |
    Routing      Citizen             OSM Data    Weather Data
       |         Reports                 |            |
       |            |                    +-----+------+
       |            |                          |
       |            |                          v
       |            |                    Risk Analysis
       |            |                          |
       |            |                          v
       |            |                   Sentinel Nodes
       |            |                          |
       +------------+--------------------------+
                    |
                    v
              PostgreSQL
                    |
                    v
              Admin Panel
                    |
              +-----+------+
              |            |
              v            v
          Verification   FHIR Report
```

### Node

Represents a predicted

## Local Setup

### Requirements

- Node.js 18+
- Python 3.9+
- PostgreSQL
- Supabase account
- Google Gemini API key

### Next.js Application

Clone the repository:

```bash
git clone https://github.com/your-username/bluesentinel.git
cd bluesentinel
```

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
DATABASE_URL="your-postgresql-connection-string"

GEMINI_API_KEY="your-gemini-api-key"

NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"

NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Generate Prisma Client:

```bash
npx prisma generate
```

For a new development database:

```bash
npx prisma db push
```

Start the application:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Python Risk Engine

Move into the Python engine:

```bash
cd python-engine
```

Create a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install requirements.txt
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

## Risk Node Lifecycle

Sentinel Nodes represent temporary environmental predictions.

A simplified lifecycle is:

```text
Predicted
    |
    v
Citizen Verification
    |
    v
Pending Admin Review
    |
    v
Verified
    |
    v
Resolved
```

Predicted nodes can also expire when they are no longer relevant.

## Future Work

Some areas that can be extended in future versions include:

- More detailed heat and blue-space analysis
- Real-time weather updates
- Authority notifications
- Historical risk analysis
- More citizen reporting options
- Integration with municipal systems

## Project Goal

BlueSentinel is built around a simple idea:

> A city should not only tell people where to go. It should also help them understand what is happening around them.

By combining spatial data, environmental signals, citizens, AI, and administrative review, BlueSentinel creates a complete loop from **prediction to verification to action**.

