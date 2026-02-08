# Restaurant FAQ – Full Stack Web Application

A full-stack web application that provides a restaurant FAQ service using a **React frontend** and a **Node.js + Express backend**. The application is deployed on **Render** with a clear separation between frontend and backend services.

---

## Overview

This project demonstrates a production-ready full-stack setup where:

* The backend exposes REST API endpoints
* The frontend consumes these APIs as a static web application
* Deployment follows modern DevOps and CI/CD practices

---

## Project Structure

```
restaurant-faq/
├── backend   # Node.js + Express REST API
└── frontend  # React (Create React App)
```

---

## Tech Stack

### Backend

* Node.js
* Express.js
* CORS
* dotenv
* Render Web Service

### Frontend

* React (Create React App)
* Fetch API
* Environment variables
* Render Static Site

---

## Backend (Local Setup)

```bash
cd backend
npm install
node index.js
```

Runs on:

```
http://localhost:5000
```

(or the port defined in environment variables)

### API Endpoints

* `GET /health` – Health check
* `GET /faq` – FAQ endpoint

---

## Frontend (Local Setup)

```bash
cd frontend
npm install
npm start
```

Runs on:

```
http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
```

Optional:

```
GOOGLE_API_KEY=your_api_key_here
```

### Frontend (`frontend/.env`)

```
REACT_APP_API_URL=https://<backend-render-url>
```

> Environment files are excluded from version control.

---

## Deployment

### Backend

* Deployed as a Render **Web Service**
* Uses dynamic port handling (`process.env.PORT`)
* Environment variables managed via Render dashboard

### Frontend

* Deployed as a Render **Static Site**
* Build command: `npm install && npm run build`
* Publish directory: `build`

---

## Current Status

* Backend deployed and stable
* `/faq` and `/health` endpoints operational
* Frontend configured to consume backend API
* Production-ready project structure

---

## Future Improvements

* Database-backed FAQ storage
* AI-powered FAQ responses
* Authentication and authorization
* UI/UX enhancements
* Logging and monitoring
