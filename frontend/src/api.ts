const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  avatar: string | null;
  rating: number;
  experience_years: number;
  consulted_count: number;
  fee: number;
  initials?: string | null;
  color?: string | null;
};

export type Appointment = {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  status: string;
  reason?: string | null;
  type: string;
};

export type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  note: string;
};

export type Prescription = {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  title: string;
  medicines: Medicine[];
  advice: string;
  diagnosis: string;
};

export type HealthTip = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
};

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatar: string;
  dob: string;
  blood_group: string;
};

export const api = {
  patient: () => req<Patient>('/patient'),
  doctors: () => req<Doctor[]>('/doctors'),
  doctor: (id: string) => req<Doctor>(`/doctors/${id}`),
  appointments: (doctorId?: string) =>
    req<Appointment[]>(`/appointments${doctorId ? `?doctor_id=${doctorId}` : ''}`),
  createAppointment: (body: { doctor_id: string; date: string; time: string; reason?: string; type?: string }) =>
    req<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  prescriptions: (doctorId?: string) =>
    req<Prescription[]>(`/prescriptions${doctorId ? `?doctor_id=${doctorId}` : ''}`),
  prescription: (id: string) => req<Prescription>(`/prescriptions/${id}`),
  healthTips: () => req<HealthTip[]>('/health-tips'),
};
