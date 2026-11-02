# PRMSU Campus Explorer

A campus guide web app for **President Ramon Magsaysay State University (PRMSU)**.
Students and visitors can browse colleges, offices and facilities, see them on an
interactive map, and get directions. Administrators log in to add, edit and delete
the records.

Created for **Elec 3 - Technical Elective III (Software Development)**,
final project *"From Code to Cloud"*.

| | |
|---|---|
| **Live site** | https://prmsu-iba-campus-explorer.vercel.app |
| **Admin page** | https://prmsu-iba-campus-explorer.vercel.app/admin.html |
| **Repository** | https://github.com/YOUR-USERNAME/YOUR-REPO |

> This is an unofficial student project. It is not affiliated with or endorsed by PRMSU.
> Verify institutional details at the official PRMSU website.

## Features

- **Directory:** search departments and filter by category
- **Department pages:** description, programs, photos, contact details and a location map
- **Interactive map:** color-coded markers, search, legend, street/satellite toggle and directions
- **Admin dashboard:** secure login with full CRUD for departments, buildings and categories, plus image upload
- **Modern, responsive design** that works on desktop and phone

## Tech stack and why

| Layer | Choice | Why |
|---|---|---|
| Frontend | HTML, CSS, JavaScript (ES modules), Bootstrap 5 | Simple and fast, no build step, easy to host for free. Each page has its own script and shared code is split into small modules. |
| Backend | **Supabase** (backend-as-a-service) | Provides the API, authentication and file storage without running a server. The browser talks to it with the public `anon` key, and **Row Level Security** policies in the database decide who may read or write. |
| Database | **PostgreSQL** (via Supabase) | The data is relational: each department belongs to a category and a building, so foreign keys keep the records consistent. |
| Maps | Leaflet + OpenStreetMap | Free and needs no API key or billing account. Directions open as a plain Google Maps link. |
| Hosting | **Vercel** | Deploys straight from the GitHub repository with no build step, serves the site over HTTPS, and redeploys automatically on every push to `main`. |
| Version control | Git + GitHub | Commit history, feature branches and pull requests. |

### How the pieces connect

```
Browser (static HTML/JS on Vercel)
        |
        |  Supabase JS client + public anon key
        v
Supabase: Auth (admin login) + PostgreSQL (data) + Storage (images)
        ^
        |  Row Level Security: everyone can read, only admins can write
```

Because the content lives in Supabase and not in the code, adding a building or
department through the admin page shows up on the live site immediately, with no redeploy.

## Database design

- `categories`: id, category_name, description
- `buildings`: id, building_name, description, latitude, longitude
- `departments`: id, department_name, slug, category_id (FK), building_id (FK), description, programs, image, contact_email, contact_number, created_at, updated_at
- `department_images`: id, department_id (FK, cascade delete), image_path
- `admins`: user_id (FK to Supabase Auth). Only these users can write data.

**CRUD:** the public pages **read** data. The admin page **creates, updates and deletes**
departments, buildings and categories (see `js/admin/`). Images are uploaded to a
Supabase Storage bucket.

## Project structure

```
index.html  departments.html  department.html  map.html  admin.html
css/style.css          design system (colors, typography, components)
js/
  config.js            Supabase URL and anon key, map settings
  supabaseClient.js    Supabase client
  api.js               read queries for the public pages
  utils.js             helpers (escape HTML, slugify, ...)
  layout.js            shared navbar and footer
  components.js        department card
  mapHelpers.js        Leaflet helpers
  pages/               one script per page
  admin/               auth, image upload and CRUD modules
supabase/
  schema.sql           tables, security policies, storage bucket
  seed.sql             placeholder starter data
```

## Run locally

1. Clone the repository.
2. Create a project at [supabase.com](https://supabase.com). In **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. In **Authentication > Sign In / Providers**, turn off "Allow new users to sign up".
4. In **Authentication > Users**, click **Add user** and create the admin account. Then run in the SQL Editor:
   ```sql
   insert into admins(user_id) select id from auth.users where email = 'you@example.com';
   ```
5. In **Project Settings > API**, copy the **Project URL** and the **anon** key into `js/config.js`.
   The URL must be the project root only (for example `https://abcdxyz.supabase.co`).
   Never use the `service_role` key in this project.
6. Set `MAP_LAT` and `MAP_LNG` in `js/config.js` to the verified campus center.
7. ES modules need a web server (not `file://`). From the project folder run:
   ```
   python -m http.server
   ```
   then open `http://localhost:8000/index.html`. The admin page is `http://localhost:8000/admin.html`.

## Deployment steps (Vercel)

1. Push the project to a GitHub repository (the `main` branch).
2. Sign in at [vercel.com](https://vercel.com) with GitHub.
3. Click **Add New > Project**, then **Import** this repository.
4. Set **Framework Preset** to **Other**. Leave the **Build Command** and **Output Directory** empty and keep the **Root Directory** as `./`, because the site is plain static files.
5. Click **Deploy**. When it finishes, Vercel gives the site a URL ending in `.vercel.app`: https://prmsu-iba-campus-explorer.vercel.app
6. In Supabase, open **Authentication > URL Configuration** and set the **Site URL** to the live Vercel URL.
7. Open the live site, log in at `/admin.html`, and test create, edit and delete.

After this, every push to `main` redeploys the site automatically, so the live version always matches the repository.

## Using the admin page

1. Open `/admin.html` and log in with the admin account.
2. **Buildings:** add each building with its name and its latitude and longitude. To get the coordinates, right-click the spot on Google Maps and copy the two numbers (latitude first, then longitude). Use **Preview** to check the location.
3. **Categories:** add or rename categories. A category can only be deleted when no department uses it.
4. **Departments:** add a department, choose its category and building, and upload a main image and gallery images (JPG, PNG or WebP, up to 2 MB each).
5. A department appears on the map once it has a building, and the map legend is built from the categories of the mapped departments.

## Development workflow

- Built step by step in small commits with clear messages, starting from the repository setup and database schema and ending with deployment.
- Features were developed on separate branches and merged into `main` through pull requests:
  - `feature/campus-map`: interactive campus map
  - `feature/admin-crud`: admin login, image upload and CRUD
  - `feature/modern-design`: design system and responsive layout

## Security notes

- The `anon` key in `js/config.js` is public by design. Security comes from Row Level Security in `supabase/schema.sql`: anyone can read, but only users listed in `admins` can create, update or delete.
- Public signups are disabled, so only accounts created by the project owner can log in.
- Text from the database is escaped before it is shown on a page.
- The `service_role` key is never used or stored in this project.

## Known limitations

- Some sample records may still be placeholders until replaced through the admin page.
- Deleting a department removes its gallery records, but the image files stay in Supabase Storage.
- Map tiles come from OpenStreetMap and Esri, which are free but intended for light traffic.

## Credits

- Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, satellite tiles by Esri
- [Leaflet](https://leafletjs.com), [Bootstrap](https://getbootstrap.com), [Font Awesome](https://fontawesome.com), [Supabase](https://supabase.com)
