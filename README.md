<a name="readme-top"></a>

# AboutMe

AboutMe is a web app that emerged as a “by-product” of one of my projects.  
That’s why it is built with React Native Web.

It’s simple and straightforward: swap out a few images, fill in one file, and you’ll end up with a solid portfolio featuring information about projects, experience, tech stack, and contact details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Tech Stack

AboutMe is built with a React Native for Web setup powered by Expo.

### Core

- React 19
- React Native 0.81
- React Native Web
- Expo (SDK 54)
- Expo Router

### Tooling & Quality

- TypeScript
- ESLint
- Prettier
- Husky (Git hooks)
- Jest (jest-expo)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

   The project is currently aligned with Node `20.19.4` and npm `11.5.2`.

2. Run the initializer:

   ```bash
   ./init.sh
   ```

   On first run it creates `.aboutme/`, `.aboutme/app-data.json`, `.aboutme/images/`, and `.env` (from `.env.example` if present), then seeds placeholder assets from the repo defaults.

3. Adjust `.aboutme/app-data.json` and replace the placeholder files in `.aboutme/images/` when you want to use your own assets.

4. Run the initializer again whenever data or images change:

   ```bash
   ./init.sh
   ```

   The script is idempotent. It syncs `.aboutme/app-data.json` into the ignored root `app-data.json` and regenerates:
   - `public/images/*`
   - generated logo and favicon assets
   - `public/site.webmanifest`
   - `public/robots.txt`
   - `public/sitemap.xml`
   - `nginx/site.conf`

   Preview the same process without writing files:

   ```bash
   ./init.sh --dry-run
   ```

   Useful for local checks and CI validation. It runs through the same decisions, but does not create, overwrite, or regenerate files.

5. Start locally:

   ```bash
   npm run web
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Configuration

Drop your source images into:

```
.aboutme/images/
```

The repo already ships with these placeholders:

- `logo.svg`
- `bg.webp`
- `default_avatar.webp`
- `default_project.webp`

Reference the files you want to use inside `.aboutme/app-data.json`.

### Local Environment

Create a local env file when needed:

```bash
cp .env.example .env
```

`./init.sh` already creates `.env` automatically when `.env.example` exists and `.env` is still missing.

`.aboutme/app-data.json` and `.aboutme/images/` are the single source of truth. Generated files such as root `app-data.json`, public assets, and nginx config are intentionally ignored by Git.

### Navigation & Content

The app ships with:

- a localized home page
- project list and detail pages
- experience page
- dedicated contact page
- menu/legal pages (imprint, privacy, terms, licenses)

### Recommended Image Ratios

- **S** – 4:3 (e.g. 256x192)
- **L** – define your preferred ratio

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Deployment

1. Create a `.env` file if your deployment needs one:

   ```bash
   cp .env.example .env
   ```

2. Export the app:

   ```bash
   npm run export:web
   ```

   This generates the production build inside the `dist` directory.

3. Deploy locally:

   ```bash
   npm run deploy:local
   ```

   This exports the app to `/var/www/html/`.

4. Build and deploy to your registry:

   ```bash
   npm run deploy:web
   ```

   The container build only includes the generated runtime assets and nginx config from the project root. Local source data such as `.aboutme/`, `.env`, tests, and development files are excluded from the Docker build context. The bundled nginx serves the app on port `8080` inside the container.

### Quality Checks

- `npm run lint`
- `npm run test:deps`
- `npm run test:dry-run`
- `npm run test:unit`
- `npm run test:security`
- `npm run test:types`
- `npm run test:prettier`
- `npm run test:all`
- `./init.sh --dry-run`

For a full local maintenance pass there is also:

```bash
npm run cleanup
```

`cleanup` recreates `package-lock.json`, runs `expo-doctor`, Prettier, TypeScript, and ESLint fixes. It may require network access and working Git hook permissions in your local environment.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

**ALL RIGHTS RESERVED**

See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

**Wolf Budgenhagen**  
Email: info@nosys-productions.com  
Signal: https://signal.me/#eu/iPbKoW4uezUd1bRX8SHa-col_0NLmjNKI2hVZBdTuhUWyWW1eTlIn5c8YLo-IAKf

Project Link:  
https://github.com/budwol/AboutMe.App

<p align="right">(<a href="#readme-top">back to top</a>)</p>
