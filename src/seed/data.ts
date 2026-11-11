import type { Specialization } from '../constants/index.js';

export interface DoctorSeed {
  name: string;
  specialization: Specialization;
  hospital: string;
  phone: string;
  email: string;
  // Days before today the doctor was added, so date filters have real spread.
  joinedDaysAgo: number;
  // How many demo patients this doctor gets.
  patients: number;
}

export const DOCTOR_SEEDS: DoctorSeed[] = [
  {
    name: 'Farhana Rahman',
    specialization: 'Cardiology',
    hospital: 'Square Hospital',
    phone: '01711-204518',
    email: 'farhana.rahman@squarehospital.com',
    joinedDaysAgo: 342,
    patients: 6,
  },
  {
    name: 'Tanvir Ahmed',
    specialization: 'Neurology',
    hospital: 'Evercare Hospital Dhaka',
    phone: '01819-337240',
    email: 'tanvir.ahmed@evercarebd.com',
    joinedDaysAgo: 318,
    patients: 5,
  },
  {
    name: 'Nusrat Jahan',
    specialization: 'Pediatrics',
    hospital: 'United Hospital',
    phone: '01713-582961',
    email: 'nusrat.jahan@uhlbd.com',
    joinedDaysAgo: 296,
    patients: 5,
  },
  {
    name: 'Mahmudul Hasan',
    specialization: 'Orthopedics',
    hospital: 'Labaid Specialized Hospital',
    phone: '01912-460735',
    email: 'mahmudul.hasan@labaidgroup.com',
    joinedDaysAgo: 265,
    patients: 4,
  },
  {
    name: 'Sabrina Chowdhury',
    specialization: 'Gynecology',
    hospital: 'Square Hospital',
    phone: '01715-918342',
    email: 'sabrina.chowdhury@squarehospital.com',
    joinedDaysAgo: 241,
    patients: 4,
  },
  {
    name: 'Rafiqul Islam',
    specialization: 'Endocrinology',
    hospital: 'BIRDEM General Hospital',
    phone: '01818-274609',
    email: 'rafiqul.islam@birdembd.org',
    joinedDaysAgo: 212,
    patients: 3,
  },
  {
    name: 'Shirin Akter',
    specialization: 'Dermatology',
    hospital: 'Ibn Sina Hospital',
    phone: '01716-643187',
    email: 'shirin.akter@ibnsinatrust.com',
    joinedDaysAgo: 183,
    patients: 3,
  },
  {
    name: 'Kamrul Hossain',
    specialization: 'Gastroenterology',
    hospital: 'Evercare Hospital Dhaka',
    phone: '01914-725803',
    email: 'kamrul.hossain@evercarebd.com',
    joinedDaysAgo: 151,
    patients: 3,
  },
  {
    name: 'Ayesha Siddiqua',
    specialization: 'Cardiology',
    hospital: 'United Hospital',
    phone: '01712-390476',
    email: 'ayesha.siddiqua@uhlbd.com',
    joinedDaysAgo: 122,
    patients: 2,
  },
  {
    name: 'Imran Kabir',
    specialization: 'Neurology',
    hospital: 'Labaid Specialized Hospital',
    phone: '01817-506214',
    email: 'imran.kabir@labaidgroup.com',
    joinedDaysAgo: 94,
    patients: 2,
  },
  {
    name: 'Tahmina Begum',
    specialization: 'Pediatrics',
    hospital: 'BIRDEM General Hospital',
    phone: '01719-861530',
    email: 'tahmina.begum@birdembd.org',
    joinedDaysAgo: 54,
    patients: 2,
  },
  {
    name: 'Shafiqul Alam',
    specialization: 'Orthopedics',
    hospital: 'Popular Medical College Hospital',
    phone: '01915-142867',
    email: 'shafiqul.alam@popularmch.com',
    joinedDaysAgo: 37,
    patients: 1,
  },
  {
    name: 'Nazia Haque',
    specialization: 'Cardiology',
    hospital: 'Ibn Sina Hospital',
    phone: '01714-735092',
    email: 'nazia.haque@ibnsinatrust.com',
    joinedDaysAgo: 19,
    patients: 1,
  },
  {
    name: 'Arif Mahmud',
    specialization: 'General Medicine',
    hospital: 'Popular Medical College Hospital',
    phone: '01816-428751',
    email: 'arif.mahmud@popularmch.com',
    joinedDaysAgo: 6,
    patients: 1,
  },
];

export const DIAGNOSES: Record<Specialization, string[]> = {
  Cardiology: ['Hypertension', 'Coronary Artery Disease', 'Arrhythmia', 'Heart Failure'],
  Dermatology: ['Eczema', 'Psoriasis', 'Acne Vulgaris'],
  Endocrinology: ['Type 2 Diabetes', 'Hypothyroidism', 'Thyroid Nodule'],
  Gastroenterology: ['Gastritis', 'Irritable Bowel Syndrome', 'Fatty Liver'],
  'General Medicine': ['Viral Fever', 'Dengue Fever'],
  Gynecology: ['Polycystic Ovary Syndrome', 'Prenatal Care', 'Endometriosis'],
  Nephrology: ['Chronic Kidney Disease', 'Kidney Stones'],
  Neurology: ['Migraine', 'Epilepsy', 'Stroke Recovery', 'Peripheral Neuropathy'],
  Oncology: ['Breast Cancer', 'Lymphoma'],
  Orthopedics: ['Knee Osteoarthritis', 'Lumbar Disc Herniation', 'Fractured Wrist'],
  Pediatrics: ['Bronchiolitis', 'Childhood Asthma', 'Typhoid Fever'],
  Psychiatry: ['Generalized Anxiety Disorder'],
  Pulmonology: ['Asthma', 'COPD', 'Pneumonia'],
  Urology: ['Urinary Tract Infection'],
};

export const MALE_NAMES = [
  'Rahim',
  'Karim',
  'Sakib',
  'Fahim',
  'Nayeem',
  'Rakib',
  'Shuvo',
  'Hasib',
  'Jubayer',
  'Tareq',
  'Mehedi',
  'Rifat',
];
export const FEMALE_NAMES = [
  'Sadia',
  'Tasnim',
  'Mim',
  'Riya',
  'Lamia',
  'Nabila',
  'Sumaiya',
  'Farzana',
  'Jannatul',
  'Afroza',
  'Maliha',
  'Sharmin',
];
export const LAST_NAMES = [
  'Hossain',
  'Rahman',
  'Islam',
  'Ahmed',
  'Khan',
  'Chowdhury',
  'Sarker',
  'Uddin',
  'Mia',
  'Akter',
  'Biswas',
  'Das',
];

export const NOTES = [
  'Follow up in two weeks.',
  'Responding well to medication.',
  'Advised a low sodium diet.',
  'Needs a repeat blood test next visit.',
  'Family history noted.',
];
