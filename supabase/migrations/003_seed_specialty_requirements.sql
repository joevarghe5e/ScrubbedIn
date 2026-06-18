-- ============================================================
-- Specialty Requirements Seed Data
-- Sources: GMC/JRCPTB/royal college indicative requirements
-- Note: These are indicative minimums for illustration; verify
-- against current royal college documentation before use.
-- ============================================================

insert into public.specialty_requirements (specialty, requirement_type, requirement_name, minimum_count) values

-- General Medicine / Internal Medicine
('General Medicine', 'case_log',          'Acute medical admissions logged', 20),
('General Medicine', 'procedure',         'ABG interpretation', 10),
('General Medicine', 'teaching_session',  'Teaching sessions attended', 10),
('General Medicine', 'audit',             'Audit or QIP', 1),
('General Medicine', 'presentation',      'Case presentation at MDT/Grand Round', 1),

-- Surgery (General)
('Surgery', 'case_log',          'Operative cases observed/assisted', 30),
('Surgery', 'procedure',         'Suturing / wound closure', 5),
('Surgery', 'teaching_session',  'Teaching sessions attended', 10),
('Surgery', 'audit',             'Audit or QIP', 1),
('Surgery', 'presentation',      'Morbidity & Mortality discussion', 2),
('Surgery', 'paper',             'Research or case report submitted', 1),

-- Paediatrics
('Paediatrics', 'case_log',          'Paediatric encounters logged', 20),
('Paediatrics', 'procedure',         'Neonatal examination', 5),
('Paediatrics', 'teaching_session',  'Teaching sessions attended', 10),
('Paediatrics', 'audit',             'Audit or QIP', 1),
('Paediatrics', 'presentation',      'Case presentation', 2),

-- Emergency Medicine
('Emergency Medicine', 'case_log',          'ED encounters logged', 40),
('Emergency Medicine', 'procedure',         'Airway management (BVM/intubation)', 5),
('Emergency Medicine', 'procedure',         'IV access / cannulation', 20),
('Emergency Medicine', 'teaching_session',  'Teaching sessions attended', 10),
('Emergency Medicine', 'audit',             'Audit or QIP', 1),

-- Psychiatry
('Psychiatry', 'case_log',          'Psychiatric assessments logged', 20),
('Psychiatry', 'teaching_session',  'Teaching sessions attended', 12),
('Psychiatry', 'audit',             'Audit or QIP', 1),
('Psychiatry', 'presentation',      'Case presentation', 2),
('Psychiatry', 'paper',             'Essay or case report', 1),

-- Cardiology
('Cardiology', 'case_log',          'Cardiology encounters logged', 20),
('Cardiology', 'procedure',         'ECG interpretation', 20),
('Cardiology', 'procedure',         'Echocardiography observation', 5),
('Cardiology', 'teaching_session',  'Teaching sessions attended', 10),
('Cardiology', 'audit',             'Audit or QIP', 1),
('Cardiology', 'paper',             'Research or case report', 1),

-- Neurology
('Neurology', 'case_log',          'Neurology encounters logged', 15),
('Neurology', 'procedure',         'Lumbar puncture observation/performance', 2),
('Neurology', 'teaching_session',  'Teaching sessions attended', 10),
('Neurology', 'audit',             'Audit or QIP', 1),
('Neurology', 'paper',             'Research or case report', 1),

-- Obstetrics & Gynaecology
('Obstetrics & Gynaecology', 'case_log',          'Obstetric/Gynaecology encounters', 20),
('Obstetrics & Gynaecology', 'procedure',         'Normal deliveries witnessed', 5),
('Obstetrics & Gynaecology', 'procedure',         'Speculum examination', 5),
('Obstetrics & Gynaecology', 'teaching_session',  'Teaching sessions attended', 10),
('Obstetrics & Gynaecology', 'audit',             'Audit or QIP', 1),

-- General Practice
('General Practice', 'case_log',          'GP consultations logged', 50),
('General Practice', 'teaching_session',  'Teaching sessions attended', 12),
('General Practice', 'audit',             'Audit or QIP', 1),
('General Practice', 'presentation',      'Case discussion/presentation', 2),
('General Practice', 'paper',             'Significant event analysis', 2),

-- Anaesthetics
('Anaesthetics', 'case_log',          'Anaesthetic cases logged', 20),
('Anaesthetics', 'procedure',         'Endotracheal intubation', 10),
('Anaesthetics', 'procedure',         'Spinal/regional block observation', 5),
('Anaesthetics', 'teaching_session',  'Teaching sessions attended', 10),
('Anaesthetics', 'audit',             'Audit or QIP', 1),

-- Orthopaedics
('Orthopaedics', 'case_log',          'Orthopaedic cases observed/assisted', 20),
('Orthopaedics', 'procedure',         'Joint aspiration/injection', 3),
('Orthopaedics', 'teaching_session',  'Teaching sessions attended', 10),
('Orthopaedics', 'audit',             'Audit or QIP', 1),
('Orthopaedics', 'paper',             'Research or case report', 1),

-- Radiology
('Radiology', 'case_log',          'Radiology cases reviewed', 30),
('Radiology', 'procedure',         'Plain film reporting', 20),
('Radiology', 'teaching_session',  'Teaching sessions attended', 12),
('Radiology', 'audit',             'Audit or QIP', 1),
('Radiology', 'paper',             'Research project or case report', 1),

-- Oncology
('Oncology', 'case_log',          'Oncology encounters logged', 15),
('Oncology', 'teaching_session',  'MDT attendance', 6),
('Oncology', 'teaching_session',  'Teaching sessions attended', 10),
('Oncology', 'audit',             'Audit or QIP', 1),
('Oncology', 'paper',             'Research or case report', 1),

-- Dermatology
('Dermatology', 'case_log',          'Dermatology encounters logged', 15),
('Dermatology', 'procedure',         'Skin biopsy / minor surgery observation', 3),
('Dermatology', 'teaching_session',  'Teaching sessions attended', 10),
('Dermatology', 'audit',             'Audit or QIP', 1),

-- ENT
('ENT', 'case_log',          'ENT encounters logged', 15),
('ENT', 'procedure',         'Otoscopy / nasal examination', 10),
('ENT', 'teaching_session',  'Teaching sessions attended', 10),
('ENT', 'audit',             'Audit or QIP', 1);
