# 🎯 Mantra Block - Website Blocker Extension

A lightweight, privacy-focused browser extension that blocks distracting websites and helps you stay mindful with personal mantras.

## Features

- **Smart Website Blocking**: Maintain a customizable blacklist of distracting websites
- **Personal Mantras**: Set custom reminders to refocus when you encounter blocked sites
- **Default Protections**: Pre-configured blocklist includes common social media platforms
- **Easy Management**: Simple settings page to add/remove sites and mantras
- **Privacy First**: All data stored locally in your browser, no external tracking
- **Cross-Browser**: Works on Chrome, Firefox, Edge, and other Chromium-based browsers

## Installation

### Chrome / Edge / Brave / Other Chromium Browsers

1. Clone or download this repository
   ```bash
   git clone https://github.com/yourusername/mantra_block.git
   ```

2. Open your browser and go to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Navigate to the `mantra_block` folder and select it

6. The extension will now appear in your extensions list

### Firefox

1. Clone or download this repository

2. Go to `about:debugging#/runtime/this-firefox` in the address bar

3. Click **Load Temporary Add-on**

4. Select any file from the `mantra_block` folder

5. The extension will be loaded (temporarily - it will be removed on browser restart)

For permanent installation on Firefox, you would need to package and sign the extension through Mozilla's Add-ons platform.

## Usage

### Setting Up Mantras

1. Click the **Mantra Block** icon in your browser toolbar
2. Click **Open Settings** to access the full settings page
3. In the "Your Mantras" section, enter a personal mantra (e.g., "I am focused on my goals")
4. Click **Add Mantra** to save it
5. You can add multiple mantras - you'll see one of them when visiting blocked sites

> **Important**: You must enter at least one mantra before the extension will be fully functional. When you first access the settings page, you're required to manually enter mantras.

### Customizing Blocked Websites

1. Open **Settings** from the extension popup
2. In the "Blocked Websites" section, enter a domain name (e.g., `facebook.com`)
3. Click **Add Site** to add it to your blocklist
4. Remove sites by clicking the **Delete** button next to them

**Default Blocked Sites:**
- facebook.com
- instagram.com
- tiktok.com
- reddit.com
- youtube.com
- twitter.com
- x.com
- twitch.tv

### When You Visit a Blocked Site

1. An overlay appears showing your configured mantras
2. You can either:
   - **Type your mantra** in the text field and click "Continue"
   - **Click a suggested mantra** to quickly enter it
3. Your mantra must exactly match one you set in the settings page
4. After entering the correct mantra, you can proceed to the website

> **Note**: The form does not allow pasting to encourage mindful entry of your mantra.

### Resetting to Defaults

1. Open **Settings**
2. In the "Reset Extension" section, click **Reset to Defaults**
3. Confirm when prompted - this will restore the default mantras and blocklist

## Project Structure

```
mantra_block/
├── manifest.json                 # Extension configuration
├── src/
│   ├── background.js             # Service worker for tab monitoring
│   ├── content.js                # Script that runs on blocked sites
│   ├── popup.html                # Quick access popup
│   ├── popup.js                  # Popup functionality
│   ├── options.html              # Settings page
│   ├── options.js                # Settings page functionality
│   ├── styles/
│   │   ├── overlay.css           # Blocked site overlay styling
│   │   ├── popup.css             # Popup styling
│   │   └── options.css           # Settings page styling
│   └── utils/
│       └── storage.js            # Storage management utilities
└── icons/                        # Extension icons (placeholder)
```

## How It Works

1. **Storage**: All mantras and blocked sites are stored in your browser's local storage
2. **URL Monitoring**: The background service worker monitors all tab updates
3. **Content Script**: When you navigate to a URL, the content script checks if it's blocked
4. **Overlay**: If blocked, a full-page overlay appears with a mantra entry form
5. **Verification**: Your entered mantra is verified against stored mantras
6. **Access**: After successful entry, the overlay is removed and you can access the site

## Technology Stack

- **Manifest V3**: Latest browser extension standard
- **Chrome Storage API**: Local data persistence
- **Content Scripts**: DOM manipulation and interaction
- **Background Service Workers**: Tab monitoring and event handling

## Data & Privacy

- ✅ All data is stored locally in your browser
- ✅ No data is sent to external servers
- ✅ No tracking or analytics
- ✅ Completely private and under your control
- ✅ Delete all data anytime through browser settings

## Customization

### Changing Default Mantras

Edit `src/utils/storage.js` and modify the `DEFAULT_MANTRAS` array:

```javascript
const DEFAULT_MANTRAS = [
  'I am focused on my goals.',
  'This moment is precious.',
  'I choose productivity.',
  // Add your own...
];
```

### Changing Default Blocked Sites

Edit `src/utils/storage.js` and modify the `DEFAULT_BLACKLIST` array:

```javascript
const DEFAULT_BLACKLIST = [
  'facebook.com',
  'instagram.com',
  // Add your own...
];
```

## Troubleshooting

### Overlay doesn't appear when visiting a blocked site
- Ensure you've added at least one mantra in the settings
- Try refreshing the page
- Check that the domain is correctly formatted (e.g., `example.com` not `https://example.com`)

### "Mantra not recognized" message
- Your entered mantra must **exactly match** one in your settings (case-insensitive)
- Make sure there are no extra spaces at the beginning or end
- Check the suggested mantras in the overlay

### Settings don't save
- Check your browser's storage permissions
- Try clearing the site data and resetting to defaults
- Restart the browser

### Extension not loading
- Ensure **Developer mode** is enabled
- Verify you selected the correct folder containing `manifest.json`
- Check for any errors in the browser's extension management page

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Remember**: The goal of Mantra Block is to help you stay mindful and focused. Use it as a tool to recenter yourself and reconnect with your goals. 🧘‍♀️✨
