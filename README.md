# AboutMe

AboutMe is my little portfolio app built with Expo and React Native Web.

Clone it, throw in your own data and images, run `./init.sh`, and there you go: projects, experience, tech stack, contact stuff, all sitting there like happy little trees on a calm digital canvas. Just a few soft clouds, a couple of brave colors, and your portfolio starts to live.

## Tech Stack

This thing runs on React Native Web with Expo. No wizard cave, no enchanted build forest, just a web app with a few happy little layers and enough room to put a mountain where you want one.

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

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

   Current baseline is Node `20.19.4` and npm `11.5.2`.

2. Run the initializer.

   ```bash
   ./init.sh
   ```

   On the first run it creates `.aboutme/`, `.aboutme/app-data.json`, `.aboutme/images/`, and `.env` if `.env.example` exists. It also seeds the default placeholder assets from the repo, so you do not have to paint the first little tree by hand. We start with a little bit of structure, then we can get wild in a controlled way.

3. Fill `.aboutme/app-data.json` with your stuff and replace the placeholder files in `.aboutme/images/` when you are ready.

4. Run the initializer again whenever you change data or images.

   ```bash
   ./init.sh
   ```

   The script is idempotent. Run it as often as you want. No mistakes here, just happy little rebuilds. Every pass lays down another calm little layer of paint. It syncs `.aboutme/app-data.json` into the ignored root `app-data.json` and regenerates:
   - `public/images/*`
   - generated logo and favicon assets
   - `public/site.webmanifest`
   - `public/robots.txt`
   - `public/sitemap.xml`
   - `nginx/site.conf`

   If you just want to peek without writing files:

   ```bash
   ./init.sh --dry-run
   ```

   Good for local checks and CI. Same decisions, no writes, just a quiet little rehearsal before the real brush hits the canvas.

5. Start the app.

   ```bash
   npm run web
   ```

## Configuration

Put your source images here:

```
.aboutme/images/
```

The repo already comes with these placeholders:

- `logo.svg`
- `bg.webp`
- `default_avatar.webp`
- `default_project.webp`

Point to the files you want in `.aboutme/app-data.json`, and let the generator do its thing. Maybe it needs a tree. Maybe it needs a mountain. Maybe it just needs your face in `default_avatar.webp`.

### Local Environment

If you need a local `.env`:

```bash
cp .env.example .env
```

`./init.sh` already creates `.env` when `.env.example` exists and `.env` is still missing.

`.aboutme/app-data.json` and `.aboutme/images/` are the single source of truth. Everything generated from them, like root `app-data.json`, public assets, and nginx config, is intentionally ignored by Git. Nice and tidy, like cleaning the brushes before the paint dries and giving the canvas one last friendly nod.

### Navigation & Content

Right now the app gives you a nice little set of pages. Nothing overcooked, just enough room for a tree here, a cloud there, and your work in the middle:

- a localized home page
- project list and detail pages
- experience page
- dedicated contact page
- menu/legal pages (imprint, privacy, terms, licenses)

### Recommended Image Ratios

- **S** – 4:3 (e.g. 256x192)
- **L** – whatever ratio makes sense for your work

## Deployment

1. Create a `.env` file if your deploy setup needs one.

   ```bash
   cp .env.example .env
   ```

2. Export the app.

   ```bash
   npm run export:web
   ```

   That writes the production build into `dist`, all neat and dry, like we set it out in the sun for a minute.

3. Deploy locally.

   ```bash
   npm run deploy:local
   ```

   That exports the app to `/var/www/html/`, where it can sit there peacefully and be a website. Sometimes a website just wants a quiet place to be.

4. Build and push the container.

   ```bash
   npm run deploy:web
   ```

   The container build only includes generated runtime assets and nginx config from the project root. Local source data like `.aboutme/`, `.env`, tests, and dev files stay out of the Docker build context. Nginx serves the app on port `8080` inside the container, just quietly doing its job like a happy little cloud drifting across the top of the scene.

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

If you want the full cleanup pass:

```bash
npm run cleanup
```

`cleanup` recreates `package-lock.json`, runs `expo-doctor`, Prettier, TypeScript, and ESLint fixes. It may need network access locally. Basically the repo gets a bath, a haircut, and a gentle little whisper that says, "let's put one more tree right here."

## License

**ALL RIGHTS RESERVED**

See `LICENSE.txt` for more information.

## Contact

**Wolf Budgenhagen**  
Email: info@nosys-productions.com  
Signal: https://signal.me/#eu/iPbKoW4uezUd1bRX8SHa-col_0NLmjNKI2hVZBdTuhUWyWW1eTlIn5c8YLo-IAKf

Project Link:  
https://github.com/budwol/AboutMe.App
