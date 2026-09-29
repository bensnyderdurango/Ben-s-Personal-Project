# user-service

Sample Node.js/Express microservice that manages user profiles.
Part of a small demo catalog used to showcase the Cortex GitHub integration.

## Run locally

```bash
npm install
npm start      # http://localhost:5002
npm test
```

## Endpoints

| Method | Path          | Description      |
|--------|---------------|------------------|
| GET    | /health       | Liveness check   |
| GET    | /users        | List users       |
| POST   | /users        | Create a user    |
| GET    | /users/:id    | Fetch a user     |
| DELETE | /users/:id    | Delete a user    |
