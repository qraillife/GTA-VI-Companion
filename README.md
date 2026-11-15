# GTA VI Companion

An unofficial GTA VI mobile-first fan app with a regional countdown, information, image gallery, trailer playback, and launch checklist.

## Publishing
Upload **all files and both folders** (`assets`, `icons`, `media`) to the root of a GitHub repository and enable GitHub Pages. If you already published an earlier version, replace `index.html`, `styles.css`, `app.js`, `service-worker.js`, `manifest.webmanifest`, `README.md` and the icon and asset images. Refresh Safari, or remove/re-add the home-screen shortcut if its icon remains cached.

## Official screenshots
Rockstar publishes downloadable screenshots at https://www.rockstargames.com/VI/media/screenshots and artwork at https://www.rockstargames.com/VI/media/artwork-wallpapers. To show those actual photos inside your copy of the app, add photos from the official downloads to `assets/` using the file names `vice-city.jpg`, `jason-lucia.jpg`, and `screenshot-01.jpg` through `screenshot-06.jpg`. **Those Rockstar photos aren't included in this ZIP**, because the official archive couldn't be retrieved during this build. Missing images display an included, clearly illustrative fallback instead of empty cards. Respect the rights associated with republishing third-party media.

## Trailers
Trailer 1 and 2 are embedded using their public YouTube players. You may provide local authorized video files in `media/trailer-1.mp4`, `media/trailer-2.mp4`, `media/extended-look.mp4`, after which the app chooses the local files automatically. The Extended Look may require age verification using the online player. This app does not circumvent those restrictions. Official video library: https://www.rockstargames.com/VI/media/videos.

## Notes
The countdown updates every second and uses the selected IANA timezone. This app is not affiliated with Rockstar Games.
