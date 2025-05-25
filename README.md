# React TypeScript Chat UI

A modern, responsive chat user interface built with React, TypeScript, and Vite. This application provides a clean and intuitive chat experience with real-time messaging simulation.

## Features

- 🎨 **Modern Design** - Clean, responsive UI that works on desktop and mobile
- ⚡ **TypeScript** - Full type safety and enhanced developer experience
- 💬 **Real-time Chat** - Simulated bot responses with typing indicators
- 📱 **Responsive** - Optimized for all screen sizes
- ♿ **Accessible** - ARIA labels and keyboard navigation support
- 🎯 **Component-based** - Modular architecture with reusable components

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library
- **CSS3** - Modern CSS with animations and transitions

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatContainer.tsx    # Main chat container
│   ├── MessageList.tsx      # Message list display
│   ├── Message.tsx          # Individual message
│   └── MessageInput.tsx     # Message input field
├── types/              # TypeScript type definitions
│   └── chat.ts             # Chat-related interfaces
└── styles/             # Component styles
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Component Overview

### ChatContainer
The main container component that manages the overall chat state and orchestrates communication between child components.

### MessageList
Displays the list of messages with automatic scrolling and empty state handling.

### Message
Individual message component with support for user/bot messages and typing indicators.

### MessageInput
Text input component with send functionality, auto-resize, and accessibility features.

## Customization

The chat UI is fully customizable through CSS variables and component props. You can easily:

- Change color schemes by updating CSS custom properties
- Modify message bubble styles
- Add new message types
- Integrate with real chat APIs
- Add file upload functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
