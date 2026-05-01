# FarmEasy Frontend Application.

The frontend module is a high-performance React application bundled by Vite, designed for professional-grade user interactions.

## Technical Enhancements & Polish

- **Vite & Nginx Cloud Integration:** Designed a lightweight `Dockerfile` paired with an aggressive `nginx.conf`. The Nginx configuration employs a `try_files` directive to route all traffic seamlessly through `index.html`, eliminating 404 errors associated with React Router's client-side history API during cloud deployments.
- **Dynamic Endpoint Mapping:** Centralized API request mapping within `services/api.js`. Configured environment variables (`VITE_API_BASE`) to securely bind the frontend client directly to the Google Cloud Run backend instance URL.
- **UI/UX Refactoring & Feedback:**
  - Integrated `react-toastify` to deliver responsive, asynchronous visual feedback (Toast Notifications) for critical interactions like executing a rental agreement or requesting OTPs.
  - Refactored `index.css` to introduce robust visual hierarchy, including the `rented-item` class which dynamically restricts user click events (`pointer-events: none`) and grayscales inventory that is no longer available.
- **Admin Dashboard Constraints:** Enforced secure layout rendering constraints to strictly differentiate the administrative control panel from standard user perspectives.
