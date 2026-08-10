# **Project Development Plan: Isoko Talents**

**Program:** Bachelor of Software Engineering (BSE)

 **Course:** Pre-Capstone Project Research Proposal 

**Methodology:** Agile/Scrum (Two-week Sprints)

 **Architecture:** Three-Tier (React/Vite, Node.js/Express, PostgreSQL)

## **Part 1: Strategic Phasing & Sprints**

### **Phase 1: Infrastructure & Architecture Setup (Sprint 1\)**

* **Client Tier:** Initialize a React single-page application using Vite to ensure a highly responsive, mobile-first user interface. Architect this frontend using TypeScript and Redux to maintain predictable state management and strict unidirectional data flow.  
* **Application Tier:** Set up a Node.js and Express REST API to handle core business logic and routing.  
* **Data Tier:** Provision a PostgreSQL database and configure the Sequelize Object-Relational Mapping (ORM) to handle schema migrations and model relationships.  
* **DevOps & CI/CD:** Establish a robust continuous integration and deployment pipeline using GitHub Actions to automate linting, testing, building, and deployment processes. Containerize the entire application stack using Docker and Docker Compose to guarantee consistent development and production environments.

### **Phase 2: Authentication & Core Data Models (Sprint 2\)**

* **Authentication:** Implement stateless authentication using JSON Web Tokens (JWT) combined with bcrypt password hashing.  
* **Authorization:** Create distinct, role-based access controls for the four primary system actors: workers, clients, mentors, and administrators.  
* **Database Schema:** Define and migrate the foundational relational database schema, including tables for `Users`, `Gigs`, `Matches`, `Skills`, `Reviews`, and `Transactions`.  
* **User Profiles:** Build out basic user profiles that capture the user's bio, geolocation, and specific skill categories.

### **Phase 3: Skill Verification & Mentorship (Sprint 3\)**

* **Task Submission:** Develop a category-specific submission workflow that allows workers to upload micro-task evidence via files, links, and supporting notes.  
* **Anti-Collusion Routing:** Program an algorithm that automatically routes submitted skill tasks to available mentors within the matching category, preventing workers from selecting their own reviewers.  
* **Messaging:** Construct a lightweight, in-app mentorship messaging layer to facilitate direct communication and guidance between new workers and their assigned mentors.

### **Phase 4: Gig Marketplace & Matching Engine (Sprint 4\)**

* **Gig Posting:** Build the client-facing interface for posting gigs, ensuring it captures the gig title, description, budget, required skill category, and specific location.  
* **Matching Module:** Develop the core Matching Service module within the Application Tier to process incoming gig requests.  
* **Ranking Algorithm:** Engineer the matching algorithm to rank candidate workers by computing a weighted combination of their accumulated trust score and their Haversine distance from the gig's location.

### **Phase 5: Simulated Payments & Reputation System (Sprint 5\)**

* **Payment Service:** Develop a module to handle the simulated mobile-money transaction lifecycle.  
* **Mock Integration:** Design this simulation to mirror the exact request and response contracts of real regional providers (e.g., MTN Mobile Money), carefully recording initiation, confirmation, and failure statuses without moving real funds.  
* **Review System:** Implement a two-way rating and review mechanism that automatically triggers once a gig is marked complete by the involved parties.  
* **Dynamic Trust Scores:** Route the data from these completed reviews back into the user's profile to continuously update their portable trust score.

### **Phase 6: Admin Moderation & Pilot Testing (Sprint 6\)**

* **Moderation Tools:** Build administrative moderation tools allowing system admins to review flagged accounts, manage disputed gigs, and monitor platform-wide activity.  
* **Pilot Testing:** Conduct structured pilot testing with a representative group of urban workers and clients to evaluate technical performance and user adoption metrics.  
* **Compliance Audit:** Audit the system's data handling processes to ensure strict compliance with Rwanda's Law No. 058/2021 regarding personal data and privacy protection.

## **Part 2: Step-by-Step Coding Blueprint**

### **Step 1: Project Initialization & Containerization**

* **Initialize the Monorepo:** Create a root directory containing two main folders: `client/` and `server/`.  
* **Configure Docker Compose:** Write a `docker-compose.yml` at the root level to define three services: the Vite frontend, the Express API, and the PostgreSQL database.  
* **Dockerfiles:** Create individual `Dockerfile` configurations inside the `client/` and `server/` directories to dictate how each environment is built.

### **Step 2: Database & ORM Setup (Data Tier)**

* **Initialize Sequelize:** Inside the `server/` directory, install `sequelize`, `pg`, and `pg-hstore`, then run the Sequelize CLI initialization to generate `models/`, `config/`, and `migrations/` folders.  
* **Configure the Connection:** Update the Sequelize config to connect to the PostgreSQL Docker container instance.  
* **Generate Models & Migrations:** Use the CLI to create the core models: `User`, `Gig`, `Match`, `Skill`, `SkillTask`, `Transaction`, and `Review`.  
* **Define Associations:** Explicitly map the relationships in the model files (e.g., establishing the join table `UserSkill` and the one-to-many relationships between `Match` and `Transaction`).

### **Step 3: Backend API Construction (Application Tier)**

* **Server Setup:** Initialize an Express server, configure standard middleware (CORS, JSON body parsing), and connect to the Sequelize instance.  
* **Authentication Flow:** Build the registration and login endpoints. Implement `bcrypt` to hash passwords before database insertion, and generate a signed JWT to return to the client.  
* **Role-Based Middleware:** Create custom Express middleware to verify the JWT on protected routes and restrict access based on the user's role.  
* **Build Core Services:**  
  * **Matching Service:** Accept a gig's location and required skill category, pull candidate workers, apply the Haversine distance formula, and rank them against their trust score.  
  * **Payment Service:** Simulate the mobile money workflow (initiate, confirm, fail) by writing transactional records to the database.

### **Step 4: Frontend Development (Client Tier)**

* **Initialize Application:** Run Vite to scaffold the React project. Set up Redux to manage the global state for user authentication, live gigs, and dynamic trust scores.  
* **Component Architecture:** Break down the UI into functional components:  
  * **Authentication:** Login and registration forms.  
  * **Dashboard:** Role-specific landing pages.  
  * **Marketplace:** Forms for clients to post gigs and feeds for workers to browse opportunities.  
  * **Verification:** An upload interface for workers to submit micro-task evidence.  
  * **Mentorship:** A chat interface for direct messaging.  
* **API Integration:** Use an HTTP client (like Axios) to connect the React components to the Express backend, ensuring the JWT is attached to the authorization header.

### **Step 5: CI/CD Pipeline & Deployment**

* **Automated Testing:** Write unit and integration tests for the riskiest components, specifically the Matching Service and the Payment Service.  
* **GitHub Actions:** Create a `.github/workflows/` configuration to define the CI/CD pipeline. Configure the workflow to automatically trigger linting, testing, and container building upon every code commit.

