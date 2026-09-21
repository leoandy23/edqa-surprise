# edqa-surprise

Static GitHub Pages project for Eymi.

## Structure

```text
edqa-surprise/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   ├── audio/
│   │   └── solo-por-vos.mp3
│   └── images/
│       ├── snoopy.png
│       └── us.jpg
└── .nojekyll
```

## Performance changes

- Images and audio are no longer embedded as Base64.
- Snoopy PNG was resized and optimized while preserving transparency.
- The browser can cache each static asset independently.
- The 5 MB song is not downloaded during initial page load.
- Music begins streaming only after the first user interaction.
- The loader waits only for the lightweight visual assets.
- Relative paths work under GitHub Pages project URLs such as:
  `https://leoandy23.github.io/edqa-surprise/`

## Deploy updates

Copy these files into the root of your existing repository, then run:

```bash
git add .
git commit -m "Optimize static assets and add romantic loader"
git push origin main
```

GitHub Pages will redeploy automatically from `main`.
