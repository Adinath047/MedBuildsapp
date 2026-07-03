"""Backend API tests for Patient App."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://patient-dash-10.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Patient ----------
class TestPatient:
    def test_patient(self, client):
        r = client.get(f"{API}/patient", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"] == "patient-rahul"
        assert data["name"] == "Rahul Patil"
        assert data["location"] == "Pune, Maharashtra"
        assert "_id" not in data


# ---------- Doctors ----------
class TestDoctors:
    def test_list_doctors(self, client):
        r = client.get(f"{API}/doctors", timeout=15)
        assert r.status_code == 200
        docs = r.json()
        assert len(docs) == 4
        names = {d["name"]: d["specialty"] for d in docs}
        assert names.get("Dr. Anjali Mehta") == "Cardiologist"
        assert names.get("Dr. Karan Shah") == "Dermatologist"
        assert names.get("Dr. Neha Kulkarni") == "General Physician"
        assert names.get("Dr. Arjun Rao") == "Neurologist"
        for d in docs:
            assert "_id" not in d

    def test_get_doctor(self, client):
        r = client.get(f"{API}/doctors/doc-anjali", timeout=15)
        assert r.status_code == 200
        assert r.json()["name"] == "Dr. Anjali Mehta"

    def test_get_doctor_404(self, client):
        r = client.get(f"{API}/doctors/unknown-xyz", timeout=15)
        assert r.status_code == 404


# ---------- Appointments ----------
class TestAppointments:
    def test_list_appointments(self, client):
        r = client.get(f"{API}/appointments", timeout=15)
        assert r.status_code == 200
        apts = r.json()
        assert len(apts) >= 6
        for a in apts:
            assert "_id" not in a

    def test_filter_by_doctor(self, client):
        r = client.get(f"{API}/appointments", params={"doctor_id": "doc-anjali"}, timeout=15)
        assert r.status_code == 200
        apts = r.json()
        assert len(apts) >= 2
        assert all(a["doctor_id"] == "doc-anjali" for a in apts)

    def test_create_appointment_success(self, client):
        payload = {
            "doctor_id": "doc-neha",
            "date": "2026-03-05",
            "time": "11:00 AM",
            "reason": "TEST_booking",
            "type": "In-Clinic",
        }
        r = client.post(f"{API}/appointments", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "confirmed"
        assert data["doctor_id"] == "doc-neha"
        assert data["reason"] == "TEST_booking"
        assert "_id" not in data
        # Verify persistence via GET filter
        r2 = client.get(f"{API}/appointments", params={"doctor_id": "doc-neha"}, timeout=15)
        assert any(a["id"] == data["id"] for a in r2.json())

    def test_create_appointment_unknown_doctor(self, client):
        payload = {"doctor_id": "doc-fake", "date": "2026-03-06", "time": "12:00 PM"}
        r = client.post(f"{API}/appointments", json=payload, timeout=15)
        assert r.status_code == 404


# ---------- Prescriptions ----------
class TestPrescriptions:
    def test_list_prescriptions(self, client):
        r = client.get(f"{API}/prescriptions", timeout=15)
        assert r.status_code == 200
        rx = r.json()
        assert len(rx) == 4
        for p in rx:
            assert "_id" not in p
            assert isinstance(p["medicines"], list) and len(p["medicines"]) >= 1

    def test_get_prescription(self, client):
        r = client.get(f"{API}/prescriptions/rx-1", timeout=15)
        assert r.status_code == 200
        assert r.json()["diagnosis"] == "Mild hypertension, stable"

    def test_filter_prescription_by_doctor(self, client):
        r = client.get(f"{API}/prescriptions", params={"doctor_id": "doc-anjali"}, timeout=15)
        assert r.status_code == 200
        rx = r.json()
        assert len(rx) >= 1
        assert all(p["doctor_id"] == "doc-anjali" for p in rx)


# ---------- Health tips ----------
class TestHealthTips:
    def test_list(self, client):
        r = client.get(f"{API}/health-tips", timeout=15)
        assert r.status_code == 200
        tips = r.json()
        assert len(tips) >= 3
        for t in tips:
            assert "_id" not in t
