# payments-service

Sample Python/Flask microservice that creates and looks up payments.
Part of a small demo catalog used to showcase the Cortex GitHub integration.

## Run locally

```bash
pip install -r requirements.txt
python app.py            # http://localhost:5001
pytest                   # run tests
```

## Endpoints

| Method | Path              | Description          |
|--------|-------------------|----------------------|
| GET    | /health           | Liveness check       |
| POST   | /payments         | Create a payment     |
| GET    | /payments/<id>    | Fetch a payment      |
