# YAMAHA Motodesign — Website Setup

This is the official website for **YAMAHA Motodesign**, an authorized YAMAHA motorcycle dealer in Corinth, Greece.

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **CMS:** Airtable (headless, no backend required)
- **Hosting:** Static site (Netlify, Vercel, or GitHub Pages)
- **Languages:** English + Greek (bilingual)

## 📁 Project Structure

```
yamaha-motodesign/
├── index.html              # Homepage
├── inventory.html          # (To be built) Full motorcycle catalog
├── listing.html            # (To be built) Single bike detail page
├── about.html              # (To be built) About the dealer
├── contact.html            # (To be built) Contact form + map
│
├── css/
│   ├── main.css            # Design system + utilities
│   ├── navbar.css          # Glassmorphism navbar
│   └── hero.css            # Hero section animations
│
├── js/
│   ├── config.js           # Airtable + site configuration
│   ├── api.js              # Airtable API with pagination
│   ├── i18n.js             # Language switching system
│   └── main.js             # Homepage logic
│
├── lang/
│   ├── en.json             # English translations
│   └── gr.json             # Greek translations
│
└── assets/
    ├── logo-dark.svg       # (Placeholder needed)
    ├── logo-white.svg      # (Placeholder needed)
    ├── hero-bg.jpg         # (Placeholder needed)
    └── placeholder.jpg     # (Placeholder needed)
```

## ⚙️ Airtable Setup

### 1. Create Airtable Base

1. Go to [airtable.com](https://airtable.com) and create a new base called **YAMAHA Motodesign**
2. Create a table called **Motorcycles**

### 2. Add Required Fields

| Field Name | Type | Notes |
|------------|------|-------|
| `title_en` | Single line text | English title |
| `title_gr` | Single line text | Greek title |
| `brand` | Single line text | Default: "Yamaha" |
| `model` | Single line text | Model name |
| `category` | Single select | Options: Sport, Naked, Touring, Scooter, Adventure, etc. |
| `condition` | Single select | Options: New, Used, Demo |
| `year` | Number | Manufacturing year |
| `price` | Number | Price in EUR (0 = Contact for Price) |
| `mileage_km` | Number | Odometer reading |
| `engine_cc` | Number | Engine displacement |
| `color` | Single line text | Color name |
| `description_en` | Long text | English description |
| `description_gr` | Long text | Greek description |
| `Images` | Attachment | Upload motorcycle photos |
| `featured` | Checkbox | Show on homepage? |
| `available` | Checkbox | Currently in stock? |

### 3. Get API Credentials

1. Go to [airtable.com/account](https://airtable.com/account)
2. Create a **Personal Access Token** with:
   - Scope: `data.records:read`
   - Access: Only this base
3. Copy your **Base ID** from the API docs
4. Update `js/config.js`:

```javascript
export const AIRTABLE = {
  BASE_ID: 'appXXXXXXXXXXXXXX', // Your Base ID here
  TABLE_NAME: 'Motorcycles',
  API_KEY: 'patXXXXX.XXXXXXXX' // Your PAT here
};
```

## 🌐 Running Locally

Since this is a static site with ES6 modules, you need a local server (not just opening `index.html`):

### Option 1: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html` → **Open with Live Server**

### Option 2: Python
```bash
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option 3: Node.js
```bash
npx serve
```

## 🎨 Customization

### Colors
Edit `css/main.css` → `:root` section to change the color scheme.

### Languages
Edit `lang/en.json` and `lang/gr.json` to update UI strings.

### Contact Info
Update `js/config.js` → `SITE.contact` object.

## 🚢 Deployment

### Netlify (Recommended)
1. Drag and drop the project folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Done! Your site is live.

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
1. Push to GitHub
2. Go to **Settings** → **Pages**
3. Select branch and `/root` folder
4. Save

## 📧 Support

For technical support, contact the developer or refer to the Stage 1 & 2 planning documents in the `brain` directory.

---

**© 2026 YAMAHA Motodesign · Πατρών 60, Κόρινθος 20100, Greece**
