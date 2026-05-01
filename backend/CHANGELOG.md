# Changelog

## [1.0.0] - Deployment Preparation & Logic Stabilization

### Added
- Created a robust `Dockerfile` for containerization using multi-stage builds (Maven and Eclipse Temurin JRE 17).
- Added formal JavaDoc documentation for complex transactional workflows within `AgreementService.java` to improve codebase readability and maintainability.

### Changed
- Updated the `application.yml` file to seamlessly integrate environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`), enabling resilient production database connections.
- Refactored `AgreementService.createAgreement()` to implement critical state-management triggers. It now encapsulates the logic to automatically toggle the availability of `Equipment` or `Land` to "Rented" immediately upon successful agreement finalization.

### Fixed
- Resolved compilation warnings by appending `@Builder.Default` to default-initialized fields (`createdAt`, `updatedAt`) across domain entities (`Trade`, `Equipment`, `Land`).
- Modified `pom.xml` to correctly configure the scope for `testcontainers-bom` within a `<dependencyManagement>` block, mitigating Maven scope warnings.
