# 📥 Files Manager Challenge

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

This project is a full-stack application that demonstrates a file management system using NestJS for the backend and React for the frontend.

![rsz_2screenshot_from_2024-02-08_18-43-41](https://github.com/NiMusco/challenge-files/assets/12497746/7ed6518c-010a-4e4f-81a7-b6eaebcd871b)
![rsz_screenshot_from_2024-02-08_18-45-38(](https://github.com/NiMusco/challenge-files/assets/12497746/3b1cf3bc-de82-44e4-9d60-4611219d9fb2)

---

## :electric_plug: Installation

The project is set up to run with Docker Compose:

1. **Pre-requisites**: Ensure you have Docker and Docker Compose installed on your system.
2. Clone the repository to your local machine.
3. Navigate to the project root directory.
4. Copy the `.env.example` file to `.env` and adjust the environment variables as necessary.
5. Run `docker-compose up --build` to build and start the containers.

React frontend will be accessible at `http://localhost:${FRONTEND_PORT}`

NestJS API being at `http://localhost:${BACKEND_PORT}`

---

## :computer: Environment Configuration:

- **DB Configuration**: Customize DB user, password, and database name through the `.env` file.
- **Backend Configuration**: Set up database connection details, AWS credentials for file storage, and JWT secret for authentication.
- **Frontend Configuration**: Configure the API URL and S3 bucket URL for accessing services.

---

##### Other Considerations:

- The backend utilizes TypeORM for database interactions, providing an ORM layer for working with Postgres.
- The frontend leverages React for a dynamic and responsive user interface.

---

:wave: Bah-bye!
