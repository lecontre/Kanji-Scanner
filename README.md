# Kanji Finder & Flashcard Assistant

A mobile application built with React Native and Expo that helps users identify Japanese Kanji from images, understand their meanings, and create flashcards for learning.

## Features

- **Kanji Identification**: Capture or upload images to identify Japanese Kanji characters
- **Detailed Kanji Information**: View meanings, readings, stroke counts, JLPT levels, and example words
- **Flashcard Creation**: Convert identified Kanji into flashcards for studying
- **Offline Access**: Store and access flashcards offline
- **Synchronization**: Sync flashcards with cloud when online
- **Organization**: Organize flashcards by JLPT level, tags, or custom folders

## Tech Stack

- **Frontend**: React Native with Expo
- **UI/Styling**: React Native Paper (Material Design)
- **Backend**: Node.js with Express
- **Database**: MongoDB (backend) and SQLite (mobile)
- **AI**: Gemini-2.0-flash-lite for OCR and Kanji identification (simulated in development)
- **Storage**: AsyncStorage and SQLite for offline storage

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- MongoDB (for backend)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/kanji-finder.git
cd kanji-finder
```

2. Install frontend dependencies
```
npm install
```

3. Install backend dependencies
```
cd backend
npm install
cd ..
```

4. Create a `.env` file in the backend folder with your configuration:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/kanjiFinderDB
JWT_SECRET=your_jwt_secret
```

### Running the App

1. Start the backend server
```
cd backend
npm run server
```

2. Start the Expo development server
```
npm start
```

3. Use Expo Go app on your mobile device or emulator to run the application

## Project Structure

```
kanji-finder/
├── assets/             # Static assets
├── backend/            # Node.js backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── server.js       # Server entry point
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React Context
│   ├── database/       # SQLite database functions
│   ├── hooks/          # Custom hooks
│   ├── screens/        # App screens
│   ├── services/       # API and AI services
│   └── utils/          # Helper functions
└── App.js              # Main app component
```

## Styling

The application uses React Native Paper for consistent Material Design styling across all platforms. This provides:

- Material Design 3 components and theming
- Cross-platform visual consistency
- Ready-to-use UI components
- Simple theme customization

To learn more about styling in this app, see the [src/utils/theme.js](./src/utils/theme.js) file.

## Future Enhancements

- User authentication via social logins
- Handwritten Kanji recognition
- Spaced repetition learning algorithm
- Export/import flashcards
- Dark mode support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Expo team for their excellent tooling
- React Native community
- Gemini AI for OCR and language processing capabilities
