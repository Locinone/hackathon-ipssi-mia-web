😁😁😁😁😁😁😁😁😁😁😁❤️❤️❤️❤️❤️❤️❤️❤️❤️ Hello world !!! ✅✅✅✅✅😍😍
# Hackathon MIA 2025

## Team 15

This repository contains the code for a MERN stack application with additional services for Facial Emotion Recognition (FER) and Natural Language Processing (NLP) in a twitter app. Follow the instructions below to run the project using Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Services](#services)
- [License](#license)

## Prerequisites

Make sure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```

2. Build and start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Usage

Once the services are up and running, you can access them at the following URLs:

- **MongoDB**: `mongodb://localhost:27017`
- **Backend (Node.js)**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`
- **Backend Flask (FER)**: `http://localhost:5050`
- **NLP Service**: `http://localhost:5010`

## Services

### MongoDB

MongoDB is used as the database for the application.

### Backend (Node.js)

The backend service is a Node.js Express application that connects to MongoDB.

### Frontend

The frontend service is a React application. Using Vite and Tailwind framework.

### Backend Flask (FER)

The backend-flask service is a Flask application for Facial Emotion Recognition.

### NLP Service

The NLP service is used for Natural Language Processing tasks.

## Trello

Lien du trello:
[Trello Board](https://trello.com/invite/b/67ced365469affb08ce8c137/ATTI93e4d481184f1fb70f0cac7298dae6c951027DEC/hackathon-mia-2025)

## License

This project is licensed under the MIT License. See the LICENSE file for details.
