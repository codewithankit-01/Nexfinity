NEXFINITY — Premium Website
===========================

A luxury, futuristic one-page website for a website development studio.
Hand-written HTML, CSS and JavaScript, with a real-time Three.js 3D hero scene.

------------------------------------------------------------------
QUICK START
------------------------------------------------------------------
1. Open index.html in Chrome, Edge, Safari or Firefox.
   It works by simply double-clicking the file.

   For the smoothest local preview, run a tiny local server:
       cd nexfinity
       python -m http.server 8000
   Then open http://localhost:8000

2. Deploy: upload the contents of this folder to Netlify, Vercel,
   GitHub Pages, Hostinger/cPanel, etc. No build step required.

------------------------------------------------------------------
FILES
------------------------------------------------------------------
index.html
assets/css/style.css
assets/js/main.js
assets/js/three.min.js    (Three.js r128, MIT — bundled for offline 3D)
README.txt

------------------------------------------------------------------
WHAT'S INCLUDED
------------------------------------------------------------------
- Preloader with animated counter
- Custom cursor, magnetic buttons, scroll progress bar
- 3D WebGL hero: particle sphere, orbital rings, starfield, mouse parallax
- Scroll-triggered reveals, animated counters, 3D tilt card
- Service cards with cursor-follow spotlight
- Work showcase with four custom CSS/SVG covers
- Testimonial slider (auto-play, arrows, dots, swipe)
- Contact form with validation + success state
- Fully responsive (320px to 1920px+), reduced-motion support
- No horizontal scroll at any tested width
- Graceful fallback when WebGL is unavailable

------------------------------------------------------------------
MAKE IT YOURS
------------------------------------------------------------------
1. Brand name, headlines and copy:
   index.html

2. Colors and fonts:
   :root variables at the top of assets/css/style.css

3. Contact email and phone:
   Search for "hello@nexfinity.co" and "+91 98765 43210"
   (in index.html and inside the form handler in assets/js/main.js)

4. Stats:
   Search for data-count in index.html

5. Testimonials and projects:
   Sections #voices and #work in index.html

6. Social links:
   Replace every href="#" in the menu, contact and footer with your
   real Instagram / LinkedIn / Behance / Dribbble profile URLs.

7. Project budget options:
   <select id="budget"> in index.html

8. Page title, description, OG tags and favicon:
   <head> in index.html

------------------------------------------------------------------
CONTACT FORM
------------------------------------------------------------------
The form validates on the client and then opens the visitor's email app
with a pre-filled brief addressed to hello@nexfinity.co. No backend needed.

To collect submissions without opening a mail app, connect a service such
as Formspree, Getform or your own API inside the submit handler at the end
of the "Contact form" block in assets/js/main.js.

------------------------------------------------------------------
IMPORTANT — PLACEHOLDER CONTENT
------------------------------------------------------------------
The stats (120+, 40+, 6 yrs, 98%), client names, testimonials, project
names and contact details are sample content for presentation. Replace
them with your real information before publishing.

------------------------------------------------------------------
3D & PERFORMANCE
------------------------------------------------------------------
- Three.js is bundled locally, so the 3D scene runs offline.
- Google Fonts load from fonts.googleapis.com. For a 100% offline build,
  download the font files and self-host them (or remove the <link> tags).
- The particle count is reduced automatically on small screens.
- Animations respect prefers-reduced-motion and pause when the hero is
  out of view or the browser tab is hidden.
- If WebGL is unavailable, the canvas is hidden and the site still works.

------------------------------------------------------------------
CREDITS
------------------------------------------------------------------
Three.js — MIT License (threejs.org)
Space Grotesk, Instrument Serif, JetBrains Mono — Google Fonts (OFL)
All other code and artwork — original, created for NEXFINITY.
