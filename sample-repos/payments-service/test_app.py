from app import app


def client():
    return app.test_client()


def test_health():
    res = client().get("/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "ok"


def test_create_and_get_payment():
    c = client()
    created = c.post("/payments", json={"amount": 25.5}).get_json()
    fetched = c.get(f"/payments/{created['id']}").get_json()
    assert fetched["amount"] == 25.5
    assert fetched["status"] == "pending"


def test_rejects_invalid_amount():
    res = client().post("/payments", json={"amount": -1})
    assert res.status_code == 400
