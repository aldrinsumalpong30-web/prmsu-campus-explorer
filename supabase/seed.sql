-- PRMSU Campus Explorer: starter data. Safe to run more than once.
-- PLACEHOLDER DATA: fake coordinates, NOT real PRMSU locations.
-- Replace everything through the admin page (/admin.html).

insert into categories (category_name)
select v from (values
  ('Colleges and Academic Departments'),
  ('Administrative Offices'),
  ('Student Services'),
  ('Campus Facilities'),
  ('Other Important Locations')
) as t(v)
where not exists (select 1 from categories c where c.category_name = t.v);

insert into buildings (building_name, description, latitude, longitude)
select * from (values
  ('[PLACEHOLDER] Building A', 'Sample.', 15.000::double precision, 120.000::double precision),
  ('[PLACEHOLDER] Building B', 'Sample.', 15.001, 120.001)
) as t(n, d, la, lo)
where not exists (select 1 from buildings b where b.building_name = t.n);

insert into departments (department_name, slug, category_id, building_id, description, programs)
select '[PLACEHOLDER] Sample College', 'placeholder-sample-college',
  (select id from categories where category_name = 'Colleges and Academic Departments' limit 1),
  (select id from buildings  where building_name = '[PLACEHOLDER] Building A' limit 1),
  'Placeholder record. Replace with verified information.',
  E'Sample program 1\nSample program 2'
where not exists (select 1 from departments where slug = 'placeholder-sample-college');

insert into departments (department_name, slug, category_id, building_id, description, programs)
select '[PLACEHOLDER] Sample Registrar', 'placeholder-sample-registrar',
  (select id from categories where category_name = 'Administrative Offices' limit 1),
  (select id from buildings  where building_name = '[PLACEHOLDER] Building B' limit 1),
  'Placeholder record. Replace with verified information.',
  'Sample service'
where not exists (select 1 from departments where slug = 'placeholder-sample-registrar');
