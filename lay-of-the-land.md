# Live API Web Console - Architecture Overview

## Core Components

### 1. Application Entry Points
- `src/index.tsx` - Main entry point that initializes the React application
- `src/App.tsx` - Root component that sets up routing and main layout
- `.env` - Configuration file for API keys and environment variables

### 2. Core Context & Hooks
- `contexts/LiveAPIContext.tsx` - Provides global state management for the Live API
- `hooks/use-live-api.ts` - Main hook that manages WebSocket connection and API state
  - Handles connection lifecycle (connect/disconnect)
  - Manages model and configuration state
  - Provides methods for interacting with the API

### 3. API Client
- `lib/genai-live-client.ts` - WebSocket client wrapper for the Live API
  - Manages WebSocket connection
  - Handles message serialization/deserialization
  - Emits events for API responses and state changes

### 4. Audio Handling (To be removed for text-only assistant)
- `lib/audio-streamer.ts` - Manages audio streaming and playback
- `lib/worklets/` - Web Audio API worklets for audio processing
- `lib/utils/audio-context.ts` - Audio context management

### 5. UI Components
- `components/` - Various React components for the UI
  - Chat interface
  - Settings panel
  - Media controls (camera, microphone)
  - Log viewer

## Data Flow

1. **Initialization**
   - App loads and initializes `LiveAPIProvider` with configuration
   - WebSocket connection is established when user interacts (e.g., clicks "Connect")

2. **Sending Messages**
   - User input is sent through the `GenAILiveClient`
   - Messages are serialized and sent over WebSocket

3. **Receiving Responses**
   - WebSocket receives server responses
   - `GenAILiveClient` parses and emits events
   - Components subscribe to these events to update the UI

## Key Dependencies

- `@google/genai` - Official Gemini API client library
- `react` - UI library
- `react-dom` - React rendering for the web
- `vega-embed` - For chart rendering (used in examples)
- `react-icons` - Icons for the UI

## State Management

- **Local Component State**: Used for UI-specific state
- **Context API**: Manages global application state (API connection, settings)
- **WebSocket State**: Connection status, message queues

## Configuration

Configuration is primarily done through:
- `.env` file for environment variables
- `LiveAPIProvider` props for runtime configuration
- User settings in the UI that modify the API client configuration

## Architecture Decisions

1. **WebSocket-based Communication**
   - Enables real-time, bidirectional communication
   - Supports streaming responses
   - Maintains persistent connection for lower latency

2. **Event-Driven Architecture**
   - Components subscribe to events they care about
   - Loose coupling between components
   - Easy to add new features that react to API events

3. **Modular Design**
   - Clear separation of concerns
   - Easy to remove or replace components
   - Reusable hooks and utilities
