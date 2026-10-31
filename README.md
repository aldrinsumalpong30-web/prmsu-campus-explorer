# PRMSU Campus Explorer

A web app that helps students and visitors find colleges, offices and facilities
on the PRMSU campus and get directions to them.

Created for **Elec 3 - Technical Elective III (Software Development)**,
final project "From Code to Cloud".

## Planned features

- Searchable department directory
- Interactive campus map
- Department detail pages
- Admin page to create, edit and delete records

## Tech stack (planned)

- HTML, CSS (Bootstrap) and JavaScript
- Supabase (PostgreSQL database, authentication, image storage)
- Leaflet + OpenStreetMap for maps
- Git and GitHub for version control

## Database setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql` (tables, security rules, image bucket).
3. Run `supabase/seed.sql` to load placeholder starter data.

All sample data is **placeholder** (fake coordinates). Replace it through the admin page.

> Work in progress. Full documentation will be added as the project is built.
