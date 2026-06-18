-- ============================================================
-- PLACEHOLDER: replace with full UKMLA condition list
-- Source: https://www.gmc-uk.org/education/standards-guidance-and-curricula/standards-and-outcomes/outcomes-for-graduates/ukmla-content-map
-- ============================================================

insert into public.competencies (curriculum, code, name, category, description) values
  ('UKMLA', 'C1.1',  'Acute coronary syndrome',          'Cardiovascular',    'Management of ACS including STEMI and NSTEMI'),
  ('UKMLA', 'C1.2',  'Heart failure',                    'Cardiovascular',    'Acute and chronic heart failure assessment and management'),
  ('UKMLA', 'C1.3',  'Atrial fibrillation',              'Cardiovascular',    'Rate vs rhythm control, anticoagulation decisions'),
  ('UKMLA', 'R1.1',  'Pneumonia',                        'Respiratory',       'Community- and hospital-acquired pneumonia, CURB-65'),
  ('UKMLA', 'R1.2',  'Acute asthma',                     'Respiratory',       'Severity assessment and stepwise management'),
  ('UKMLA', 'R1.3',  'COPD exacerbation',                'Respiratory',       'Controlled oxygen therapy, nebulisers, NIV indications'),
  ('UKMLA', 'N1.1',  'Stroke and TIA',                   'Neurology',         'FAST recognition, thrombolysis criteria, secondary prevention'),
  ('UKMLA', 'N1.2',  'Seizures and epilepsy',            'Neurology',         'First seizure workup, status epilepticus management'),
  ('UKMLA', 'GI1.1', 'Upper GI bleed',                   'Gastroenterology',  'Rockall score, endoscopy timing, resuscitation'),
  ('UKMLA', 'GI1.2', 'Acute abdomen',                    'Gastroenterology',  'Differential diagnosis and surgical referral criteria'),
  ('UKMLA', 'E1.1',  'Diabetic ketoacidosis',            'Endocrinology',     'DKA protocol: fluids, insulin, potassium monitoring'),
  ('UKMLA', 'E1.2',  'Hypoglycaemia',                    'Endocrinology',     'Recognition and treatment in inpatient and community settings');
