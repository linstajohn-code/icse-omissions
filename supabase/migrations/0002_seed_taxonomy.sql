-- ============================================================
-- 0002_seed_taxonomy.sql — Seed subjects for all classes
-- Run after 0001_init.sql
-- ============================================================

insert into subjects (class_id, code, name, slug, subject_group) values
  -- Class 9
  (9,  '01',  'English',                'english',                'I'),
  (9,  '—',   'Second Languages',       'second-languages',       'I'),
  (9,  '50',  'History & Civics',       'history-and-civics',     'I'),
  (9,  '50',  'Geography',              'geography',              'I'),
  (9,  '51',  'Mathematics',            'mathematics',            'I'),
  (9,  '52',  'Physics',                'physics',                'I'),
  (9,  '52',  'Chemistry',              'chemistry',              'I'),
  (9,  '52',  'Biology',                'biology',                'I'),
  (9,  '53',  'Economics',              'economics',              'II'),
  (9,  '58',  'Commercial Studies',     'commercial-studies',     'II'),
  (9,  '82',  'Environmental Science',  'environmental-science',  'II'),
  (9,  '86',  'Computer Applications',  'computer-applications',  'III'),
  (9,  '87',  'Economic Applications',  'economic-applications',  'III'),
  (9,  '88',  'Commercial Applications','commercial-applications','III'),
  (9,  '91',  'Performing Arts',        'performing-arts',        'III'),
  (9,  '72',  'Physical Education',     'physical-education',     'III'),
  (9,  '84',  'Yoga',                   'yoga',                   'III'),
  -- Class 10
  (10, '01',  'English',                'english',                'I'),
  (10, '—',   'Second Languages',       'second-languages',       'I'),
  (10, '50',  'History & Civics',       'history-and-civics',     'I'),
  (10, '50',  'Geography',              'geography',              'I'),
  (10, '51',  'Mathematics',            'mathematics',            'I'),
  (10, '52',  'Physics',                'physics',                'I'),
  (10, '52',  'Chemistry',              'chemistry',              'I'),
  (10, '52',  'Biology',                'biology',                'I'),
  (10, '53',  'Economics',              'economics',              'II'),
  (10, '58',  'Commercial Studies',     'commercial-studies',     'II'),
  (10, '82',  'Environmental Science',  'environmental-science',  'II'),
  (10, '86',  'Computer Applications',  'computer-applications',  'III'),
  (10, '87',  'Economic Applications',  'economic-applications',  'III'),
  (10, '88',  'Commercial Applications','commercial-applications','III'),
  (10, '91',  'Performing Arts',        'performing-arts',        'III'),
  (10, '72',  'Physical Education',     'physical-education',     'III'),
  (10, '84',  'Yoga',                   'yoga',                   'III')
on conflict (class_id, slug) do nothing;
