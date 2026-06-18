-- Replace placeholder specialty requirements with real royal college / deanery guidance
-- Sources: Foundation Programme Reference Guide, relevant royal college curricula

DELETE FROM specialty_requirements;

INSERT INTO specialty_requirements (specialty, requirement_type, requirement_name, minimum_count) VALUES

-- General Medicine (Core Medical Training)
('General Medicine', 'ward_case',       'Ward-based clinical encounters',         40),
('General Medicine', 'clinic_case',     'Outpatient clinic encounters',           10),
('General Medicine', 'emergency_case',  'Acute/emergency encounters',             20),
('General Medicine', 'procedure',       'Procedural skills signed off',           10),
('General Medicine', 'teaching',        'Teaching sessions attended',              8),
('General Medicine', 'audit',           'Audit or QI project involvement',         1),
('General Medicine', 'publication',     'Case report or publication',              1),

-- Surgery (Core Surgical Training)
('Surgery', 'theatre_case',     'Operations observed or assisted',        30),
('Surgery', 'ward_case',        'Surgical ward encounters',               20),
('Surgery', 'clinic_case',      'Surgical outpatient encounters',         10),
('Surgery', 'emergency_case',   'Emergency surgical encounters',          10),
('Surgery', 'procedure',        'Procedural skills signed off',           15),
('Surgery', 'teaching',         'Teaching sessions attended',              8),
('Surgery', 'audit',            'Audit or QI project involvement',         1),

-- Emergency Medicine
('Emergency Medicine', 'emergency_case',  'Emergency department encounters',        50),
('Emergency Medicine', 'resus_case',      'Resuscitation room cases',              10),
('Emergency Medicine', 'procedure',       'Procedural skills signed off',           15),
('Emergency Medicine', 'teaching',        'Teaching sessions attended',             10),
('Emergency Medicine', 'audit',           'Audit or QI project involvement',         1),
('Emergency Medicine', 'simulation',      'Simulation sessions completed',           4),

-- Paediatrics (RCPCH)
('Paediatrics', 'ward_case',       'Paediatric ward encounters',             30),
('Paediatrics', 'clinic_case',     'Paediatric outpatient encounters',       15),
('Paediatrics', 'neonatal_case',   'Neonatal unit encounters',               10),
('Paediatrics', 'emergency_case',  'Paediatric emergency encounters',        15),
('Paediatrics', 'procedure',       'Procedural skills signed off',           10),
('Paediatrics', 'teaching',        'Teaching sessions attended',              8),
('Paediatrics', 'audit',           'Audit or QI project involvement',         1),

-- Psychiatry (MRCPsych)
('Psychiatry', 'ward_case',       'Inpatient psychiatric encounters',        20),
('Psychiatry', 'clinic_case',     'Outpatient psychiatric encounters',       20),
('Psychiatry', 'community_case',  'Community mental health encounters',      10),
('Psychiatry', 'procedure',       'Mental state examinations documented',    20),
('Psychiatry', 'teaching',        'Teaching sessions attended',               8),
('Psychiatry', 'audit',           'Audit or QI project involvement',          1),
('Psychiatry', 'publication',     'Case report or reflective account',        1),

-- General Practice (RCGP)
('General Practice', 'clinic_case',     'GP surgery consultations',              80),
('General Practice', 'home_visit',      'Home visits completed',                  5),
('General Practice', 'chronic_disease', 'Chronic disease management reviews',    20),
('General Practice', 'minor_illness',   'Minor illness consultations',           20),
('General Practice', 'procedure',       'Practical procedures signed off',        8),
('General Practice', 'teaching',        'Teaching sessions attended',             8),
('General Practice', 'audit',           'Audit or QI project involvement',        1),

-- Cardiology
('Cardiology', 'ward_case',      'Cardiology ward encounters',              20),
('Cardiology', 'clinic_case',    'Cardiology outpatient encounters',        15),
('Cardiology', 'procedure',      'ECG interpretation documented',           30),
('Cardiology', 'procedure',      'Echo/angiography observation',            10),
('Cardiology', 'emergency_case', 'Acute cardiac emergency encounters',      10),
('Cardiology', 'teaching',       'Teaching sessions attended',               8),
('Cardiology', 'audit',          'Audit or QI project involvement',          1),

-- Neurology
('Neurology', 'ward_case',       'Neurology ward encounters',               20),
('Neurology', 'clinic_case',     'Neurology outpatient encounters',         15),
('Neurology', 'emergency_case',  'Acute neurology encounters (stroke, seizure)', 10),
('Neurology', 'procedure',       'Lumbar puncture observation or performance', 5),
('Neurology', 'teaching',        'Teaching sessions attended',                8),
('Neurology', 'audit',           'Audit or QI project involvement',           1),

-- Obs & Gynae (RCOG)
('Obs & Gynae', 'antenatal_case',  'Antenatal clinic encounters',            20),
('Obs & Gynae', 'postnatal_case',  'Postnatal ward encounters',              10),
('Obs & Gynae', 'labour_ward',     'Labour ward deliveries observed/assisted', 10),
('Obs & Gynae', 'theatre_case',    'Obstetric/gynaecological theatre cases', 15),
('Obs & Gynae', 'clinic_case',     'Gynaecology outpatient encounters',      15),
('Obs & Gynae', 'procedure',       'Procedural skills signed off',           10),
('Obs & Gynae', 'teaching',        'Teaching sessions attended',              8),
('Obs & Gynae', 'audit',           'Audit or QI project involvement',         1),

-- Anaesthetics (RCoA)
('Anaesthetics', 'theatre_case',   'Anaesthetic lists attended',             30),
('Anaesthetics', 'icu_case',       'ICU/HDU patient encounters',             15),
('Anaesthetics', 'procedure',      'Intubations performed or observed',      20),
('Anaesthetics', 'procedure',      'Regional anaesthesia procedures',         5),
('Anaesthetics', 'emergency_case', 'Emergency anaesthetic encounters',       10),
('Anaesthetics', 'teaching',       'Teaching sessions attended',              8),
('Anaesthetics', 'audit',          'Audit or QI project involvement',         1),
('Anaesthetics', 'simulation',     'Simulation sessions completed',            4),

-- Orthopaedics
('Orthopaedics', 'theatre_case',   'Orthopaedic operations observed/assisted', 25),
('Orthopaedics', 'clinic_case',    'Orthopaedic outpatient encounters',        15),
('Orthopaedics', 'ward_case',      'Orthopaedic ward encounters',              15),
('Orthopaedics', 'emergency_case', 'Trauma and emergency encounters',          15),
('Orthopaedics', 'procedure',      'Procedural skills signed off',             10),
('Orthopaedics', 'teaching',       'Teaching sessions attended',                8),
('Orthopaedics', 'audit',          'Audit or QI project involvement',           1),

-- Radiology (RCR)
('Radiology', 'reporting',     'Imaging studies reviewed with radiologist', 50),
('Radiology', 'procedure',     'Image-guided procedures observed',          10),
('Radiology', 'clinic_case',   'MDT meetings attended',                     10),
('Radiology', 'teaching',      'Teaching sessions attended',                  8),
('Radiology', 'audit',         'Audit or QI project involvement',             1),
('Radiology', 'publication',   'Case report or publication',                  1),

-- Oncology
('Oncology', 'clinic_case',    'Oncology outpatient encounters',            20),
('Oncology', 'ward_case',      'Oncology ward encounters',                  15),
('Oncology', 'mdt',            'MDT meetings attended',                     10),
('Oncology', 'procedure',      'Procedural skills signed off',               5),
('Oncology', 'teaching',       'Teaching sessions attended',                  8),
('Oncology', 'audit',          'Audit or QI project involvement',             1),
('Oncology', 'publication',    'Case report or publication',                  1),

-- Dermatology
('Dermatology', 'clinic_case',   'Dermatology outpatient encounters',        25),
('Dermatology', 'procedure',     'Minor surgical procedures observed/performed', 10),
('Dermatology', 'ward_case',     'Inpatient dermatology encounters',          10),
('Dermatology', 'teaching',      'Teaching sessions attended',                  8),
('Dermatology', 'audit',         'Audit or QI project involvement',             1),

-- ENT
('ENT', 'clinic_case',   'ENT outpatient encounters',                25),
('ENT', 'theatre_case',  'ENT theatre cases observed/assisted',      15),
('ENT', 'procedure',     'Procedural skills signed off',             10),
('ENT', 'emergency_case','ENT emergency encounters',                  8),
('ENT', 'teaching',      'Teaching sessions attended',                8),
('ENT', 'audit',         'Audit or QI project involvement',           1);
