# trivial YOU

A fun, interactive quiz app built with React and Vite. Users answer questions by swiping cards left (No) or right (Yes) on mobile, or using buttons on desktop.

## Features

- 📱 **Swipeable Cards** - Intuitive swipe gestures on mobile devices
- 🖱️ **Desktop Support** - Button controls and drag functionality for desktop users
- 📊 **Google Sheets Integration** - Fetch questions dynamically from Google Sheets
- 🎨 **Beautiful UI** - Smooth animations and modern design
- 📈 **Progress Tracking** - Shows current question number and total count
- 💾 **Answer Collection** - Stores all user responses for later processing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Google Sheets Setup (Optional)

The app works with mock data by default. To use Google Sheets:

1. **Create a Google Sheet** with your questions
   - Format: Put questions in Column A, starting from row 2
   - Row 1 can be a header (e.g., "Question")

2. **Make the sheet public**
   - Click Share > Change to "Anyone with the link can view"

3. **Enable Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials (API Key)

4. **Configure environment variables**
   - Add your API key to `.env`: `VITE_GOOGLE_SHEETS_API_KEY=your_api_key`
   - Add your sheet ID to `.env`: `VITE_GOOGLE_SHEET_ID=your_sheet_id`
   - The sheet ID is in the URL: `docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

## Project Structure

```
src/
├── components/
│   ├── QuestionCard.jsx      # Swipeable card component
│   └── QuestionCard.css       # Card styling
├── services/
│   └── googleSheets.js        # Google Sheets API integration
├── App.jsx                    # Main app component
├── App.css                    # App styling
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Usage

### Mobile

- Swipe cards **right** to answer "Yes"
- Swipe cards **left** to answer "No"
- The card will show visual feedback as you drag

### Desktop

- Click the **green "✓ Yes"** button or **red "✗ No"** button
- Or drag the card left/right with your mouse

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Future Enhancements

- Results page with horoscope/personality analysis
- More complex answer types (multiple choice, rating scales)
- Animation improvements
- Result sharing functionality
- Backend integration for storing results

## License

MIT
