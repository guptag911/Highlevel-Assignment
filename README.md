# Voice AI Performance Optimizer

## Architecture
The application is built using a modern frontend-backend architecture:
- **Frontend**: Vue.js for a reactive, component-based user interface. It handles real-time data visualization, user interactions, and state management. The UI incorporates modern design principles using custom CSS with a focus on responsiveness, aesthetics (glassmorphism, gradients), and smooth animations.
- **Backend/API Integration**: The architecture is designed to interface with a Voice AI API, consuming data asynchronously and updating the UI reactively.

## "Team of One" Ownership
Acting as a "Team of One", I managed the entire product development lifecycle:
- **Product**: Defined the core requirements and feature scope, prioritizing real-time metrics visibility and an intuitive, comprehensive dashboard to solve the primary user need of monitoring AI performance.
- **Design**: Created a premium, sleek UI/UX. I focused on modern design trends (glassmorphism, dynamic gradients, readable typography) and micro-animations to deliver a highly engaging and polished experience without relying on bulky CSS frameworks.
- **Engineering**: Executed the frontend implementation using Vue.js. I structured the application for scalability, managed local state and data flow, and implemented the logic for processing and visualizing performance metrics.
- **QA**: Performed continuous manual testing throughout development. I ensured responsive behavior across different screen sizes, validated component states, checked cross-browser capability for CSS features, and verified that edge cases in data rendering were handled gracefully.

## Functional vs. Mocked Components

### Functional
- **User Interface & UX**: The dashboard layout, navigation menu, data visualization components, and all interactive elements are fully functional.
- **Reactivity & State**: The Vue.js application successfully manages and updates the UI based on state changes.
- **Design System**: All styling, responsive breakpoints, and animations are active and functional.

### Mocked
- **Real-time Voice AI API**: The live data feeding the performance metrics (such as active calls, success rates, latency, and agent statuses) is currently simulated using mocked data or timed intervals on the client side. It does not actively connect to a live Voice AI backend WebSocket or REST endpoint in this version.
- **Backend Infrastructure**: Database persistence and backend business logic are not implemented; the application relies on the frontend mock data layer.
- **Authentication/Authorization**: Login flows and user role management are placeholders and do not verify against a real identity provider.

## HighLevel Sandbox Integration

To install and run the Voice AI Performance Optimizer inside a HighLevel sandbox or agency account, follow these steps:

1. **Locate the Widget Script**: Open the `highlevel-widget/widget.js` file in this repository.
2. **Configure API URL**: Inside the script, find the `API_BASE_URL` constant near the top and update it to point to your deployed backend URL (e.g., `https://your-deployment-url.com/api`).
3. **Add to HighLevel**: 
   - Log in to your HighLevel agency or sub-account.
   - Navigate to **Settings** > **Custom Javascript / CSS**.
   - Copy the entire contents of the `widget.js` file and paste it into the custom tracking code / Head JS section.
4. **Save and Deploy**: Save the settings. When you load the HighLevel interface, a floating "Optimize Voice AI" button will appear in the bottom right corner.
5. **Run the Optimizer**: Click the button to launch the optimizer widget natively within your HighLevel dashboard and analyze your Voice AI Agent prompts.
