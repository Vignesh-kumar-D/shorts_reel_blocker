# Shorts & Reels Blocker: Fight Content Addiction 
![icon_128x128](https://github.com/user-attachments/assets/d54742f4-4352-4ec9-96bc-21c7cd3611e9)


## 🧠 Purpose
A Chrome extension designed to combat short-form content addiction by blocking YouTube Shorts and Instagram Reels. Take back control of your attention span and enjoy these platforms' valuable content without falling into the endless scroll of short-form videos.

## 🔗 Installation
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hddclpebfglijbmapdjminkkcafchkmb.svg)](https://chromewebstore.google.com/detail/shorts-reels-blocker/hddclpebfglijbmapdjminkkcafchkmb)

1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/shorts-reels-blocker/hddclpebfglijbmapdjminkkcafchkmb)
2. Click "Add to Chrome"
3. Enjoy a distraction-free browsing experience!

## 🎯 Features
- blocks YouTube Shorts section from homepage
- Removes Shorts from YouTube search results
- Blocks Instagram Reels tab and feed
- Gives option to unblock if required and block again
- Lightweight and performance-optimized
- Simple toggle controls
- Zero data collection
- Works offline

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Extension["Extension Components"]
        Pop["Popup Interface"]
        Background["Background Script"]
        Content["Content Scripts"]
    end

    subgraph Storage["Chrome Storage"]
        Settings["User Preferences"]
    end

    subgraph Sites["Target Sites"]
        YT["YouTube DOM"]
        IG["Instagram DOM"]
    end

    Pop -->|"Toggle State"| Storage
    Background -->|"Read Settings"| Storage
    Content -->|"Apply Blocks"| Sites
    Storage -->|"Update Rules"| Content

    classDef extension fill:#4285F4,stroke:#1A1A1A,stroke-width:2px,color:white
    classDef storage fill:#34A853,stroke:#1A1A1A,stroke-width:2px,color:white
    classDef sites fill:#EA4335,stroke:#1A1A1A,stroke-width:2px,color:white

    class Extension extension
    class Storage storage
    class Sites sites
```

## 💡 Why This Matters

### The Problem
- Short-form content is designed to be addictive
- Decreases attention span
- Reduces productivity
- Creates mindless scrolling habits

### The Solution
- Maintain access to valuable platform content
- Remove addictive short-form elements
- Improve focus and attention span
- Better time management

## 🛠️ Technical Implementation
- Vanilla JavaScript for performance
- Chrome Extension Manifest V3
- DOM manipulation for content blocking
- Chrome Storage API for preferences
- Event listeners for real-time updates

## 📸 Screenshots
**Hide shorts Enabled**

<img width="1279" alt="Screenshot 2025-01-05 at 12 37 25 AM" src="https://github.com/user-attachments/assets/6b2730c0-2323-4ca8-96fb-f5b7a45d3ad6" />

**Hide shorts disabled**
<img width="1280" alt="Screenshot 2025-01-05 at 12 38 43 AM" src="https://github.com/user-attachments/assets/75c1cbe5-35ce-4eb1-98e7-4f23ece65f22" />


## ⚙️ Local Development

### Prerequisites
- Chrome browser
- Basic understanding of Chrome Extension development

### Setup
1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## 🤝 Contributing
Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 Privacy Policy
- No user data collection
- No external server communication
- All preferences stored locally

## 🌟 Future Enhancements
- Custom blocking rules
- Time-based blocking
- Usage statistics (optional)
- Support for additional platforms

## 📜 License
[MIT](LICENSE)
