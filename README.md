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

2. Take a look at `app-data.example.json` and fill in your data  
   (most fields are required).

3. Replace `/public/logo.svg` with your own logo.

4. Navigate to the `/scripts` directory.

5. Bootstrap the app:

   ```bash
   ./init.sh
   ```

6. Start locally:

   ```bash
   npm run web
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Configuration

Drop your images into:

```
/public/images/
```

Then map them inside your `app-data.json`.

### Recommended Image Ratios

- **S** – 4:3 (e.g. 256x192)
- **L** – define your preferred ratio

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Deployment

1. Create a `.env` file (see `.env.example`).

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
