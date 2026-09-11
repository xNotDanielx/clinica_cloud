from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_root_is_public():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Backend funcionando"


def test_admin_patient_list_requires_bearer_token():
    response = client.get("/pacientes")

    assert response.status_code == 401
    assert "Authorization" in response.json()["detail"]


def test_admin_patient_creation_requires_bearer_token():
    response = client.post(
        "/pacientes",
        json={
            "identificacion": "123",
            "tipo_identificacion": "cedula_chilena",
            "nombre_completo": "Prueba",
            "telefono": "123456789",
            "email": "test@example.com",
            "direccion": "Dirección",
            "sexo": "femenino",
        },
    )

    assert response.status_code == 401


def test_public_appointment_route_does_not_require_auth():
    response = client.post(
        "/citas/publica",
        json={},
    )

    # El payload vacío debe fallar por validación, no por autenticación.
    assert response.status_code == 422
