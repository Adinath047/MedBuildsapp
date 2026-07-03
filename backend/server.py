from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ----------------------------- Models -----------------------------
class Patient(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    location: str
    avatar: str
    dob: str
    blood_group: str


class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    hospital: str
    avatar: Optional[str] = None
    rating: float
    experience_years: int
    consulted_count: int
    fee: int
    initials: Optional[str] = None
    color: Optional[str] = None


class Appointment(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    date: str  # ISO date
    time: str
    status: str  # confirmed | completed | cancelled
    reason: Optional[str] = None
    type: str  # In-Clinic | Video


class Prescription(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    date: str
    title: str
    medicines: List[dict]
    advice: str
    diagnosis: str


class HealthTip(BaseModel):
    id: str
    title: str
    subtitle: str
    image: str
    tag: str


class BookAppointmentRequest(BaseModel):
    doctor_id: str
    date: str
    time: str
    reason: Optional[str] = None
    type: str = "In-Clinic"


# ----------------------------- Seed Data -----------------------------
PATIENT = {
    "id": "patient-rahul",
    "name": "Rahul Patil",
    "phone": "+91 98765 43210",
    "email": "rahul.patil@example.com",
    "location": "Pune, Maharashtra",
    "avatar": "https://images.unsplash.com/photo-1625241152315-4a698f74ceb7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzMDczNjczfDA&ixlib=rb-4.1.0&q=85",
    "dob": "1994-06-12",
    "blood_group": "O+",
}

DOCTORS = [
    {
        "id": "doc-anjali",
        "name": "Dr. Anjali Mehta",
        "specialty": "Cardiologist",
        "hospital": "Ruby Hall Clinic",
        "avatar": "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBpbmRpYW4lMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODMwNzM2ODd8MA&ixlib=rb-4.1.0&q=85",
        "rating": 4.9,
        "experience_years": 14,
        "consulted_count": 6,
        "fee": 800,
        "initials": "AM",
        "color": "#2A7AF2",
    },
    {
        "id": "doc-karan",
        "name": "Dr. Karan Shah",
        "specialty": "Dermatologist",
        "hospital": "Sahyadri Hospital",
        "avatar": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBpbmRpYW4lMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODMwNzM2NzN8MA&ixlib=rb-4.1.0&q=85",
        "rating": 4.7,
        "experience_years": 9,
        "consulted_count": 3,
        "fee": 650,
        "initials": "KS",
        "color": "#10B981",
    },
    {
        "id": "doc-neha",
        "name": "Dr. Neha Kulkarni",
        "specialty": "General Physician",
        "hospital": "City Care Clinic",
        "avatar": None,
        "rating": 4.8,
        "experience_years": 11,
        "consulted_count": 8,
        "fee": 500,
        "initials": "NK",
        "color": "#8B5CF6",
    },
    {
        "id": "doc-arjun",
        "name": "Dr. Arjun Rao",
        "specialty": "Neurologist",
        "hospital": "Jehangir Hospital",
        "avatar": "https://images.unsplash.com/photo-1637059824899-a441006a6875?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBpbmRpYW4lMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODMwNzM2NzN8MA&ixlib=rb-4.1.0&q=85",
        "rating": 4.9,
        "experience_years": 17,
        "consulted_count": 2,
        "fee": 950,
        "initials": "AR",
        "color": "#F59E0B",
    },
]

APPOINTMENTS = [
    {
        "id": "apt-1",
        "doctor_id": "doc-anjali",
        "patient_id": "patient-rahul",
        "date": "2026-02-18",
        "time": "10:30 AM",
        "status": "confirmed",
        "reason": "Follow-up on BP medication",
        "type": "In-Clinic",
    },
    {
        "id": "apt-2",
        "doctor_id": "doc-neha",
        "patient_id": "patient-rahul",
        "date": "2026-02-22",
        "time": "4:00 PM",
        "status": "confirmed",
        "reason": "General check-up",
        "type": "Video",
    },
    {
        "id": "apt-3",
        "doctor_id": "doc-karan",
        "patient_id": "patient-rahul",
        "date": "2026-01-14",
        "time": "11:00 AM",
        "status": "completed",
        "reason": "Skin rash consultation",
        "type": "In-Clinic",
    },
    {
        "id": "apt-4",
        "doctor_id": "doc-anjali",
        "patient_id": "patient-rahul",
        "date": "2025-12-20",
        "time": "9:00 AM",
        "status": "completed",
        "reason": "Annual heart check-up",
        "type": "In-Clinic",
    },
    {
        "id": "apt-5",
        "doctor_id": "doc-arjun",
        "patient_id": "patient-rahul",
        "date": "2025-11-05",
        "time": "3:30 PM",
        "status": "completed",
        "reason": "Migraine consultation",
        "type": "In-Clinic",
    },
    {
        "id": "apt-6",
        "doctor_id": "doc-neha",
        "patient_id": "patient-rahul",
        "date": "2025-10-18",
        "time": "5:00 PM",
        "status": "completed",
        "reason": "Fever & cold",
        "type": "Video",
    },
]

PRESCRIPTIONS = [
    {
        "id": "rx-1",
        "doctor_id": "doc-anjali",
        "patient_id": "patient-rahul",
        "date": "2025-12-20",
        "title": "Cardio Follow-up",
        "diagnosis": "Mild hypertension, stable",
        "medicines": [
            {"name": "Telma 40", "dosage": "1-0-0", "duration": "30 days", "note": "After breakfast"},
            {"name": "Ecosprin 75", "dosage": "0-1-0", "duration": "30 days", "note": "After lunch"},
            {"name": "Rosuvas 10", "dosage": "0-0-1", "duration": "30 days", "note": "After dinner"},
        ],
        "advice": "Reduce salt intake. Walk 30 minutes daily. Monitor BP twice a week.",
    },
    {
        "id": "rx-2",
        "doctor_id": "doc-karan",
        "patient_id": "patient-rahul",
        "date": "2026-01-14",
        "title": "Dermatology Consult",
        "diagnosis": "Contact dermatitis on forearm",
        "medicines": [
            {"name": "Momate cream", "dosage": "Apply thin layer", "duration": "10 days", "note": "Twice daily"},
            {"name": "Cetzine 10", "dosage": "0-0-1", "duration": "7 days", "note": "At bedtime"},
        ],
        "advice": "Avoid new detergents. Keep area dry and clean. Return if itching persists.",
    },
    {
        "id": "rx-3",
        "doctor_id": "doc-arjun",
        "patient_id": "patient-rahul",
        "date": "2025-11-05",
        "title": "Neuro Consult",
        "diagnosis": "Tension-type headache",
        "medicines": [
            {"name": "Naxdom 250", "dosage": "1-0-1", "duration": "5 days", "note": "After meals"},
            {"name": "Vitamin B-complex", "dosage": "1-0-0", "duration": "30 days", "note": "Morning"},
        ],
        "advice": "Screen breaks every 45 min. 7-8 hours sleep. Reduce caffeine.",
    },
    {
        "id": "rx-4",
        "doctor_id": "doc-neha",
        "patient_id": "patient-rahul",
        "date": "2025-10-18",
        "title": "Fever & Cold",
        "diagnosis": "Viral URTI",
        "medicines": [
            {"name": "Paracetamol 650", "dosage": "1-1-1", "duration": "3 days", "note": "SOS for fever"},
            {"name": "Levocet-M", "dosage": "0-0-1", "duration": "5 days", "note": "At bedtime"},
            {"name": "Vitamin C", "dosage": "1-0-1", "duration": "10 days", "note": "After meals"},
        ],
        "advice": "Rest. Warm fluids. Return in 3 days if fever persists.",
    },
]

HEALTH_TIPS = [
    {
        "id": "tip-1",
        "title": "Fuel your day with fruits",
        "subtitle": "Add 2 fresh fruits every morning for better energy.",
        "image": "https://images.unsplash.com/photo-1713201427895-7d729f3cdf47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZGlldCUyMGV4ZXJjaXNlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzMDczNjc0fDA&ixlib=rb-4.1.0&q=85",
        "tag": "Nutrition",
    },
    {
        "id": "tip-2",
        "title": "Stay hydrated all day",
        "subtitle": "Sip 8 glasses of water to keep your body refreshed.",
        "image": "https://images.unsplash.com/photo-1579722820308-d74e571900a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZGlldCUyMGV4ZXJjaXNlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzMDczNjc0fDA&ixlib=rb-4.1.0&q=85",
        "tag": "Hydration",
    },
    {
        "id": "tip-3",
        "title": "Walk 30 minutes daily",
        "subtitle": "A brisk walk can lower your BP and lift your mood.",
        "image": "https://images.unsplash.com/photo-1713201427895-7d729f3cdf47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZGlldCUyMGV4ZXJjaXNlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzMDczNjc0fDA&ixlib=rb-4.1.0&q=85",
        "tag": "Fitness",
    },
]


# ----------------------------- Startup Seed -----------------------------
async def seed_database():
    # Patient
    await db.patients.delete_many({})
    await db.patients.insert_one(PATIENT.copy())
    # Doctors
    await db.doctors.delete_many({})
    await db.doctors.insert_many([d.copy() for d in DOCTORS])
    # Appointments
    await db.appointments.delete_many({})
    await db.appointments.insert_many([a.copy() for a in APPOINTMENTS])
    # Prescriptions
    await db.prescriptions.delete_many({})
    await db.prescriptions.insert_many([p.copy() for p in PRESCRIPTIONS])
    # Health tips
    await db.health_tips.delete_many({})
    await db.health_tips.insert_many([t.copy() for t in HEALTH_TIPS])


@app.on_event("startup")
async def on_startup():
    await seed_database()


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "Patient App API"}


@api_router.get("/patient", response_model=Patient)
async def get_patient():
    p = await db.patients.find_one({"id": "patient-rahul"}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Patient not found")
    return Patient(**p)


@api_router.get("/doctors", response_model=List[Doctor])
async def list_doctors():
    docs = await db.doctors.find({}, {"_id": 0}).to_list(100)
    return [Doctor(**d) for d in docs]


@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    d = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not d:
        raise HTTPException(404, "Doctor not found")
    return Doctor(**d)


@api_router.get("/appointments", response_model=List[Appointment])
async def list_appointments(doctor_id: Optional[str] = None):
    q = {}
    if doctor_id:
        q["doctor_id"] = doctor_id
    apts = await db.appointments.find(q, {"_id": 0}).to_list(200)
    apts.sort(key=lambda a: a["date"], reverse=True)
    return [Appointment(**a) for a in apts]


@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(body: BookAppointmentRequest):
    doctor = await db.doctors.find_one({"id": body.doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    apt = {
        "id": f"apt-{uuid.uuid4().hex[:8]}",
        "doctor_id": body.doctor_id,
        "patient_id": "patient-rahul",
        "date": body.date,
        "time": body.time,
        "status": "confirmed",
        "reason": body.reason or "Consultation",
        "type": body.type,
    }
    await db.appointments.insert_one(apt.copy())
    apt.pop("_id", None)
    return Appointment(**apt)


@api_router.get("/prescriptions", response_model=List[Prescription])
async def list_prescriptions(doctor_id: Optional[str] = None):
    q = {}
    if doctor_id:
        q["doctor_id"] = doctor_id
    rx = await db.prescriptions.find(q, {"_id": 0}).to_list(200)
    rx.sort(key=lambda r: r["date"], reverse=True)
    return [Prescription(**r) for r in rx]


@api_router.get("/prescriptions/{rx_id}", response_model=Prescription)
async def get_prescription(rx_id: str):
    r = await db.prescriptions.find_one({"id": rx_id}, {"_id": 0})
    if not r:
        raise HTTPException(404, "Prescription not found")
    return Prescription(**r)


@api_router.get("/health-tips", response_model=List[HealthTip])
async def list_health_tips():
    tips = await db.health_tips.find({}, {"_id": 0}).to_list(50)
    return [HealthTip(**t) for t in tips]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
