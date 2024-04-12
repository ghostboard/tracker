# Tracking code

This is the [Ghostboard.io](https://ghostboard.io) script code that a Ghost blog needs to paste in order to track analytics views, scrolling (coming soon!) and clicks on text/images in a Ghost blog

## Browser compatibility 🌎

- 97.5% of browser share (April 2024)
  - Source: https://seedmanc.github.io/jscc/
- Noscript support

## Size 🏋️‍♀️

- Only **2.0 KB** (bundled over CDN)
- 10.5 times lighter than Google Analytics (21KB, April 2024)

## Performance ⚡️

- First-class worldwide CDN
- Supports HTTP/3, HTTP/2 and HTTP/1

## Getting started ✨

- [Start your free trial](https://ghostboard.io)
- Learn more in [How to setup Ghostboard in your Ghost blog](https://ghostboard.io/blog/how-to-setup-ghostboard/)
- Example code:

```html
<script async defer data-gbid="{YOUR_GHOSTBOARD_ID}" src="https://t.ghostboard.io/min.js"></script><noscript><img src="https://api.ghostboard.io/noscript/{YOUR_GHOSTBOARD_ID}/pixel.gif" alt="Ghostboard pixel" border="0" /></noscript>
```