import uuid

from flask import Flask, jsonify, request

app = Flask(__name__)
PAYMENTS = {}


@app.get("/health")
def health():
    return jsonify(status="ok", service="payments-service")


@app.post("/payments")
def create_payment():
    body = request.get_json(silent=True) or {}
    amount = body.get("amount")
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify(error="amount must be a positive number"), 400
    payment = {
        "id": str(uuid.uuid4()),
        "amount": amount,
        "currency": body.get("currency", "USD"),
        "status": "pending",
    }
    PAYMENTS[payment["id"]] = payment
    return jsonify(payment), 201


@app.get("/payments/<payment_id>")
def get_payment(payment_id):
    payment = PAYMENTS.get(payment_id)
    if payment is None:
        return jsonify(error="not found"), 404
    return jsonify(payment)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
