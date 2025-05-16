# PDF Viewer with Auto Scroll

This PDF viewer application includes auto-scrolling functionality for a smoother reading experience.

## Features

- PDF document viewing
- Auto-scrolling capability
- Responsive design
- Vercel-ready deployment

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder and copies necessary JSON files.

### `npm run verify-build`

Verifies the build output to ensure all necessary files are present.

## Deployment on Vercel

This project is configured for easy deployment on Vercel. See [DEPLOY.md](DEPLOY.md) for detailed instructions.

## Development Notes

When working with the source code:

1. Make sure to use the correct component name in src/App.js:
   ```javascript
   const App = () => {
     // Component code here
   }
   
   export default App;
   ```

2. The auto-scroll functionality is implemented in the `PDFAutoScroll.js` component.

## Learn More

For more information on how the auto-scroll works, see [how_auto_scroll_works.txt](how_auto_scroll_works.txt).

