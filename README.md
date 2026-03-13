# ProPixel

ProPixel is an AI-accelerated proposal platform designed to streamline the creation of high-polish, professional service proposals. By leveraging a proprietary modular block library and an intelligent RFP analysis engine, ProPixel ensures every proposal is strategically aligned, brand-consistent, and delivered with extreme speed.

## 🚀 Key Features

- **AI-Driven RFP Ingestion**: Automatically extract scope, goals, industry context, and complexity from uploaded PDF and DOCX files.
- **Intelligent Block Recommendations**: Maps RFP requirements to your modular content library with AI-provided reasoning.
- **HubSpot Integration**: Real-time synchronization of Companies, Clients, and Proposals (Deals) with HubSpot CRM.
- **Style Palette System**: Brand-consistent theming for all proposals with a configurable color and typography engine.
- **High-Fidelity PDF Export**: Professional document generation using Puppeteer with intelligent page-break logic.
- **Client Web-View**: Interactive, shareable proposal links with engagement tracking (view time and scroll depth).
- **Win/Loss Analysis**: Capture outcome data to optimize future AI recommendations and pricing strategy.
- **Comprehensive Admin Suite**: Dedicated modules for managing Modular Blocks, Team Members, Style Palettes, and HubSpot field mapping.
- **Strategic Dashboard**: Real-time analytics on win rates and proposal performance.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Pages)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **AI**: [OpenAI](https://openai.com/) (GPT-4o)
- **CRM Integration**: [HubSpot API](https://developers.hubspot.com/)
- **PDF Generation**: [Puppeteer](https://pptr.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

## 🏁 Getting Started Localy

### 1. Prerequisites
- Node.js (>= 24.0.0)
- PostgreSQL database

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and populate it with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/propixel"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# HubSpot
HUBSPOT_ACCESS_TOKEN="your-hubspot-token"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-4o"
```

### 4. Database Setup
Initialize the database, sync the schema, and generate the Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Seeding Data
Populate the database with initial configurations and default style palettes:

```bash
npx prisma db seed
```

### 6. Run the Application
Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🧪 Running Tests
ProPixel utilizes Jest for unit and integration testing:

```bash
npm test
```

## 📄 License
Privately owned by ProPixel. All rights reserved.
