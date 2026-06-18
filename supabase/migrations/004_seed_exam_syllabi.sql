-- ============================================================
-- Exam Syllabi Seed Data — MSRA, MRCS, MRCP Part 1, MRCGP AKT, MRCEM Primary
-- High-yield topics curated from published syllabi.
-- Overlap score is implicit: topics appearing in multiple exams
-- will be surfaced by the frontend query.
-- ============================================================

insert into public.exam_syllabi (exam, topic, subtopic, tags) values

-- ══════════════════════════════════════════════════════
-- MSRA (Multi-Specialty Recruitment Assessment)
-- ══════════════════════════════════════════════════════
('MSRA', 'Acute coronary syndrome',          'STEMI, NSTEMI, management',            '{"Cardiovascular","Acute"}'),
('MSRA', 'Heart failure',                    'Acute and chronic, management',         '{"Cardiovascular","Chronic"}'),
('MSRA', 'Atrial fibrillation',              'Rate vs rhythm, anticoagulation',       '{"Cardiovascular","Arrhythmia"}'),
('MSRA', 'Pneumonia',                        'CAP, HAP, CURB-65',                    '{"Respiratory","Infection"}'),
('MSRA', 'Pulmonary embolism',               'Diagnosis, Wells score, treatment',     '{"Respiratory","Acute"}'),
('MSRA', 'Asthma',                           'Acute severe, stepwise management',     '{"Respiratory","Chronic"}'),
('MSRA', 'COPD',                             'Exacerbation, NIV, long-term',          '{"Respiratory","Chronic"}'),
('MSRA', 'Stroke and TIA',                   'FAST, thrombolysis, secondary prevention','{"Neurology","Acute"}'),
('MSRA', 'Seizures and epilepsy',            'First seizure, status epilepticus',     '{"Neurology","Acute"}'),
('MSRA', 'Meningitis',                       'Bacterial, viral, management',          '{"Neurology","Infection"}'),
('MSRA', 'Acute abdomen',                    'Differential diagnosis, surgical ref.', '{"GI","Acute"}'),
('MSRA', 'Upper GI bleed',                   'Rockall, endoscopy timing',             '{"GI","Acute"}'),
('MSRA', 'Inflammatory bowel disease',       'Crohns, UC, management',               '{"GI","Chronic"}'),
('MSRA', 'Diabetic ketoacidosis',            'DKA protocol, fluids, insulin',         '{"Endocrine","Acute"}'),
('MSRA', 'Hypoglycaemia',                    'Recognition and treatment',             '{"Endocrine","Acute"}'),
('MSRA', 'Thyroid disorders',                'Hypo/hyperthyroidism, thyroid crisis',  '{"Endocrine","Chronic"}'),
('MSRA', 'Acute kidney injury',              'RIFLE criteria, causes, management',    '{"Renal","Acute"}'),
('MSRA', 'Chronic kidney disease',           'Staging, complications, referral',      '{"Renal","Chronic"}'),
('MSRA', 'Urinary tract infection',          'Simple, complicated, pyelonephritis',   '{"Renal","Infection"}'),
('MSRA', 'Sepsis',                           'Sepsis-3, bundle, source control',      '{"Acute","Infection"}'),
('MSRA', 'Anaphylaxis',                      'Recognition, adrenaline, management',   '{"Acute","Allergy"}'),
('MSRA', 'Mental health assessment',         'Risk assessment, MSE',                  '{"Psychiatry"}'),
('MSRA', 'Depression and anxiety',           'Diagnosis, management, SSRI',           '{"Psychiatry","Chronic"}'),
('MSRA', 'Psychosis',                        'Schizophrenia, antipsychotics',         '{"Psychiatry","Chronic"}'),
('MSRA', 'Safeguarding',                     'Adult and child safeguarding principles','{"Ethics","Safeguarding"}'),
('MSRA', 'Medical ethics',                   'Consent, capacity, confidentiality',    '{"Ethics"}'),
('MSRA', 'Prescribing safety',               'Drug calculations, interactions',       '{"Pharmacology"}'),

-- ══════════════════════════════════════════════════════
-- MRCS (Membership of Royal Colleges of Surgeons)
-- ══════════════════════════════════════════════════════
('MRCS', 'Acute abdomen',                   'Differential, imaging, management',     '{"GI","Acute","Surgery"}'),
('MRCS', 'Appendicitis',                    'Alvarado score, laparoscopic appendicectomy','{"GI","Surgery"}'),
('MRCS', 'Bowel obstruction',               'Small bowel, large bowel, volvulus',    '{"GI","Surgery","Acute"}'),
('MRCS', 'Colorectal cancer',               'Staging, resection, stoma',             '{"GI","Surgery","Oncology"}'),
('MRCS', 'Hernia',                          'Inguinal, femoral, incisional, repair', '{"Surgery"}'),
('MRCS', 'Trauma and shock',                'ATLS principles, haemorrhage control',  '{"Acute","Surgery","Trauma"}'),
('MRCS', 'Surgical anatomy',                'Abdominal wall, neck, thorax, pelvis',  '{"Anatomy","Surgery"}'),
('MRCS', 'Wound healing',                   'Phases, complications, dehiscence',     '{"Surgery","Physiology"}'),
('MRCS', 'Fluids and electrolytes',         'IV fluid management, AKI, balance',     '{"Surgery","Physiology"}'),
('MRCS', 'Perioperative care',              'Pre-op assessment, VTE prophylaxis',    '{"Surgery","Perioperative"}'),
('MRCS', 'Sepsis',                          'Sepsis-3, surgical sources, drainage',  '{"Acute","Infection","Surgery"}'),
('MRCS', 'Vascular disease',                'AAA, PAD, DVT, acute limb ischaemia',  '{"Vascular","Surgery"}'),
('MRCS', 'Head injury',                     'GCS, CT criteria, neurosurgical ref.',  '{"Neurosurgery","Trauma","Acute"}'),
('MRCS', 'Burns',                           'Wallace rule of nines, fluid resus',    '{"Surgery","Trauma"}'),
('MRCS', 'Breast disease',                  'Breast cancer, triple assessment',      '{"Surgery","Oncology"}'),
('MRCS', 'Thyroid and parathyroid',         'Goitre, thyroidectomy, Ca²⁺ disorders','{"Endocrine","Surgery"}'),
('MRCS', 'Acute coronary syndrome',         'Perioperative MI, risk stratification', '{"Cardiovascular","Perioperative","Surgery"}'),
('MRCS', 'Prescribing safety',              'Analgesics, antibiotics, anticoagulants','{"Pharmacology","Surgery"}'),
('MRCS', 'Medical ethics',                  'Consent, capacity, DNR in surgical context','{"Ethics"}'),

-- ══════════════════════════════════════════════════════
-- MRCP Part 1 (Membership of Royal College of Physicians)
-- ══════════════════════════════════════════════════════
('MRCP Part 1', 'Acute coronary syndrome',         'Pathophysiology, management, complications','{"Cardiovascular","Acute"}'),
('MRCP Part 1', 'Heart failure',                   'Pharmacology, devices, palliative',         '{"Cardiovascular","Chronic"}'),
('MRCP Part 1', 'Arrhythmias',                     'AF, SVT, VT, WPW, management',             '{"Cardiovascular","Arrhythmia"}'),
('MRCP Part 1', 'Hypertension',                    'Secondary causes, antihypertensives',       '{"Cardiovascular","Chronic"}'),
('MRCP Part 1', 'Pneumonia',                       'Atypical organisms, management',            '{"Respiratory","Infection"}'),
('MRCP Part 1', 'Pulmonary embolism',              'Diagnosis, CTPA, thrombolysis',             '{"Respiratory","Acute"}'),
('MRCP Part 1', 'Interstitial lung disease',       'ILD patterns, causes, management',          '{"Respiratory","Chronic"}'),
('MRCP Part 1', 'Asthma',                          'Pathophysiology, stepwise treatment',       '{"Respiratory","Chronic"}'),
('MRCP Part 1', 'COPD',                            'Pathophysiology, spirometry, management',   '{"Respiratory","Chronic"}'),
('MRCP Part 1', 'Stroke and TIA',                  'Pathophysiology, imaging, prevention',      '{"Neurology","Acute"}'),
('MRCP Part 1', 'Epilepsy',                        'Classification, AEDs, status epilepticus',  '{"Neurology","Chronic"}'),
('MRCP Part 1', 'Multiple sclerosis',              'Types, DMTs, relapse management',           '{"Neurology","Chronic"}'),
('MRCP Part 1', 'Meningitis',                      'Causes, CSF findings, management',          '{"Neurology","Infection"}'),
('MRCP Part 1', 'Diabetic ketoacidosis',           'Pathophysiology, protocol',                 '{"Endocrine","Acute"}'),
('MRCP Part 1', 'Thyroid disorders',               'Autoimmune, thyroid function tests',        '{"Endocrine","Chronic"}'),
('MRCP Part 1', 'Adrenal disorders',               'Addisons, Cushings, phaeochromocytoma',     '{"Endocrine","Chronic"}'),
('MRCP Part 1', 'Acute kidney injury',             'Classification, causes, management',        '{"Renal","Acute"}'),
('MRCP Part 1', 'Chronic kidney disease',          'Complications, anaemia of CKD, RRT',        '{"Renal","Chronic"}'),
('MRCP Part 1', 'Glomerulonephritis',              'Nephrotic/nephritic, patterns',             '{"Renal","Chronic"}'),
('MRCP Part 1', 'Inflammatory bowel disease',      'Crohns vs UC, extra-intestinal, biologics', '{"GI","Chronic"}'),
('MRCP Part 1', 'Liver disease',                   'Cirrhosis, hepatitis, acute liver failure', '{"GI","Hepatology"}'),
('MRCP Part 1', 'Rheumatoid arthritis',            'DMARDs, biologic therapy',                  '{"Rheumatology","Chronic"}'),
('MRCP Part 1', 'Systemic lupus erythematosus',    'Features, ANA, management',                 '{"Rheumatology","Chronic"}'),
('MRCP Part 1', 'Sepsis',                          'Pathophysiology, bundle',                   '{"Acute","Infection"}'),
('MRCP Part 1', 'Prescribing safety',              'Drug interactions, renal/hepatic dosing',   '{"Pharmacology"}'),
('MRCP Part 1', 'Medical ethics',                  'Consent, capacity, confidentiality',        '{"Ethics"}'),

-- ══════════════════════════════════════════════════════
-- MRCGP AKT (Applied Knowledge Test)
-- ══════════════════════════════════════════════════════
('MRCGP AKT', 'Acute coronary syndrome',        'NICE guidelines, referral',               '{"Cardiovascular","Acute"}'),
('MRCGP AKT', 'Hypertension',                   'NICE thresholds, first-line treatment',   '{"Cardiovascular","Chronic"}'),
('MRCGP AKT', 'Heart failure',                  'Diagnosis, referral, NICE',               '{"Cardiovascular","Chronic"}'),
('MRCGP AKT', 'Diabetes mellitus',              'Type 1, type 2, NICE management',        '{"Endocrine","Chronic"}'),
('MRCGP AKT', 'Asthma',                         'BTS/SIGN stepwise, inhalers',             '{"Respiratory","Chronic"}'),
('MRCGP AKT', 'COPD',                           'Spirometry, NICE guidelines',             '{"Respiratory","Chronic"}'),
('MRCGP AKT', 'Mental health',                  'Depression, anxiety, IAPT referral',      '{"Psychiatry","Chronic"}'),
('MRCGP AKT', 'Safeguarding',                   'Children and adult at risk',              '{"Ethics","Safeguarding"}'),
('MRCGP AKT', 'Cancer red flags',               'NICE 2WW referral criteria',              '{"Oncology","Acute"}'),
('MRCGP AKT', 'Dermatology in primary care',    'Common rashes, skin cancer, referral',    '{"Dermatology"}'),
('MRCGP AKT', 'Contraception and sexual health','OCP, LARC, STI management',              '{"Reproductive"}'),
('MRCGP AKT', 'Antenatal and postnatal care',   'Screening, complications, referral',      '{"Reproductive"}'),
('MRCGP AKT', 'Prescribing safety',             'Polypharmacy, drug calculations',         '{"Pharmacology"}'),
('MRCGP AKT', 'Medical ethics',                 'Consent, confidentiality, capacity',      '{"Ethics"}'),
('MRCGP AKT', 'Sepsis',                         'Community recognition, referral',         '{"Acute","Infection"}'),
('MRCGP AKT', 'Chronic kidney disease',         'NICE staging, referral criteria',         '{"Renal","Chronic"}'),
('MRCGP AKT', 'Stroke and TIA',                 'ABCD2 score, NICE referral',              '{"Neurology","Acute"}'),
('MRCGP AKT', 'Thyroid disorders',              'Diagnosis, levothyroxine, referral',      '{"Endocrine","Chronic"}'),
('MRCGP AKT', 'Inflammatory bowel disease',     'Diagnosis, referral, monitoring',         '{"GI","Chronic"}'),
('MRCGP AKT', 'Rheumatoid arthritis',           'Early RA, DMARDs, monitoring',            '{"Rheumatology","Chronic"}'),

-- ══════════════════════════════════════════════════════
-- MRCEM Primary (Membership of Royal College of EM)
-- ══════════════════════════════════════════════════════
('MRCEM Primary', 'Acute coronary syndrome',       'STEMI, NSTEMI, triage, reperfusion',     '{"Cardiovascular","Acute"}'),
('MRCEM Primary', 'Arrhythmias',                   'AF, VT, VF, cardioversion',              '{"Cardiovascular","Acute","Arrhythmia"}'),
('MRCEM Primary', 'Trauma and shock',              'ATLS, haemorrhagic, distributive shock', '{"Acute","Trauma","Surgery"}'),
('MRCEM Primary', 'Head injury',                   'NICE CT criteria, GCS, management',      '{"Neurosurgery","Trauma","Acute"}'),
('MRCEM Primary', 'Sepsis',                        'Recognition, bundle, antibiotics',        '{"Acute","Infection"}'),
('MRCEM Primary', 'Anaphylaxis',                   'IM adrenaline, algorithm',               '{"Acute","Allergy"}'),
('MRCEM Primary', 'Pulmonary embolism',            'Wells, CTPA, thrombolysis',              '{"Respiratory","Acute"}'),
('MRCEM Primary', 'Stroke and TIA',                'Thrombolysis window, mimics',            '{"Neurology","Acute"}'),
('MRCEM Primary', 'Acute abdomen',                 'Surgical assessment, imaging',           '{"GI","Acute","Surgery"}'),
('MRCEM Primary', 'Burns',                         'TBSA, fluid resuscitation, referral',    '{"Surgery","Trauma"}'),
('MRCEM Primary', 'Poisoning and overdose',        'Toxidromes, specific antidotes',         '{"Acute","Pharmacology"}'),
('MRCEM Primary', 'Diabetic ketoacidosis',         'DKA protocol, fluid resus',              '{"Endocrine","Acute"}'),
('MRCEM Primary', 'Acute kidney injury',           'Triage, fluid management',               '{"Renal","Acute"}'),
('MRCEM Primary', 'Paediatric emergencies',        'PALS, febrile child, intussusception',   '{"Paediatrics","Acute"}'),
('MRCEM Primary', 'Psychiatric emergencies',       'Acute psychosis, self-harm, MHA',        '{"Psychiatry","Acute"}'),
('MRCEM Primary', 'Prescribing safety',            'Weight-based dosing, antidotes',         '{"Pharmacology"}'),
('MRCEM Primary', 'Medical ethics',                'Consent in emergency, capacity',         '{"Ethics"}'),
('MRCEM Primary', 'Safeguarding',                  'Domestic violence, child protection',    '{"Ethics","Safeguarding"}');
