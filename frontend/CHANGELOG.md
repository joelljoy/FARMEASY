# Changelog

## [1.0.0] - UI Refinement & Interaction Logic

### Added
- Designed and integrated a production-ready `Dockerfile` and custom `nginx.conf` to effectively containerize and serve the React build.
- Established logic to recognize "Rented" properties from the API and restrict user interactions correspondingly.

### Changed
- Overhauled `index.css` to inject modern aesthetics, implementing consistent typography, responsive spacing, dynamic hover interactions, and robust visual hierarchies.
- Refactored `EquipmentPage.jsx` and `LandPage.jsx` to dynamically render a "Rented" overlay badge and disable "View & Contact" actions for inventory items flagged as rented. This ensures visual confirmation of item unavailability and prevents duplicate transactions.
