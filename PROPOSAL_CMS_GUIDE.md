# Proposal CMS Guide for a Web Agency

This document outlines common acceptance criteria, a recommended structure, and technology platform guidance for a web-based CMS that creates proposals with reusable content.

## Goals and Scope
- Streamline proposal creation with reusable, approved content blocks.
- Ensure consistent branding, pricing, and legal language across proposals.
- Support collaboration, approvals, and versioning.
- Provide export-ready outputs (PDF, web link, or client portal view).
- Maintain security, auditability, and role-based access control.

## Assumptions
- Primary users are sales, account, and production leads.
- Proposal content must be reusable, searchable, and permissioned.
- The CMS will integrate with CRM/PM tools or receive data via import.

## Common Acceptance Criteria
### Functional
- Users can log in.
- Users can create proposals from templates and reusable content blocks.
- Users can organize reusable content into categories and tags.
- Users can search and filter content blocks by category, tag, and keyword.
- Users can assemble a proposal by selecting and ordering content blocks.
- Users can edit proposal-specific overrides without changing the source block.
- Users can create and manage proposal templates with default sections.
- Users can add pricing tables and line items with totals and discounts.
- Users can attach files and embed media or external links.
- Users can export proposals to PDF and share a web link.
- Users can track proposal status (draft, review, approved, sent, signed).
- Users can password protect proposals.
- Users can create links specific to certain viewers to track proposal views.
- Users can track time on page and scroll depth on a per session basis.
- Users can attach Pandadoc links to the proposal for Next Steps.
- Users can create a deal in HubSpot and attach this proposal link and pandadoc links to it.

### Collaboration and Approvals
- Users can comment on specific proposal sections.
- Proposals can be routed for approval based on role or deal size.
- Approvers can accept or request changes with an audit trail.
- Users can view revision history for proposals and content blocks.

### Permissions and Security
- Role-based access control for creating, editing, approving, and publishing.
- Sensitive pricing or legal blocks can be restricted by role.
- All changes are logged with user, timestamp, and change details.
- Data is encrypted in transit and at rest.

### Performance and Reliability
- Search results return within 2 seconds for common queries.
- Proposal export completes within 30 seconds for typical proposals.
- System uptime target of 99.9% for business hours.
- Data backups and restore procedures are documented and tested.

### Usability
- New users can create a proposal within 15 minutes of first login.
- UI provides clear section structure and preview before export.
- Templates and reusable blocks include usage guidance.

## Recommended CMS Structure
### Core Entities
- Proposal
- Template
- Section
- Content Block
- Pricing Table / Line Item
- Media / Attachment
- Tag / Category
- User / Role

### Example Information Architecture
- Proposals
  - Active Proposals
  - Archived Proposals
- Templates
  - Website Build
  - Retainer
  - Discovery
- Content Library
  - Services
  - Process
  - Case Studies
  - Legal
  - Pricing

### Content Block Types
- Rich text
- Image with caption
- Case study summary
- Process timeline
- Pricing table
- CTA / Next steps
- Legal / Terms

### Workflow
1. Create proposal from template.
2. Select and arrange content blocks.
3. Edit proposal-specific copy or pricing.
4. Submit for approval.
5. Export or share with client.

## Technology Platform Recommendations
### CMS Options
- Headless CMS (preferred): Contentful, Sanity, Strapi, or Directus.
  - Benefits: structured content, reusable blocks, strong APIs.
  - Tradeoffs: requires custom front-end build.
- Traditional CMS: WordPress with custom post types.
  - Benefits: faster setup, larger plugin ecosystem.
  - Tradeoffs: may be less structured, harder to enforce reuse rules.

### Suggested Stack (Modern)
- Front-end: Next.js or Remix for proposal builder and preview.
- Back-end: Node.js (NestJS) or Python (Django) for business logic.
- Database: PostgreSQL for relational data and JSON fields.
- Search: Meilisearch or Elasticsearch for fast content retrieval.
- Storage: S3-compatible object storage for attachments.
- Auth: Auth0 or built-in with SSO support.

### Integrations
- CRM: HubSpot or Salesforce for client and deal data.
- eSign: DocuSign or Dropbox Sign for approvals.
- Analytics: GA4 or PostHog for usage tracking.

## Non-Functional Requirements
- Accessibility: WCAG 2.1 AA compliance for the editor UI.
- Internationalization: multi-currency and locale support.
- Compliance: GDPR-ready data controls and retention policies.
- Auditability: full history and change diffs for key fields.

## Implementation Notes
- Start with a minimal block library and expand over time.
- Create a standardized taxonomy early to avoid content sprawl.
- Provide template governance to prevent ad-hoc structure drift.
- Define a pricing model and approval matrix upfront.

## Success Metrics
- Proposal creation time reduced by 30-50%.
- Reuse rate of content blocks above 50%.
- Reduction in proposal errors or inconsistencies.
- Increased win rate from higher proposal quality.

## Open Questions
- What CRM is the source of truth?
- Are proposals internal-only or client-accessible?
- Do you need multi-tenant support for multiple brands?
- What legal or compliance requirements apply?

## HubSpot Integration
- Ability to attach this proposal website to a deal

## Component List
- Reference
- Example projects
- Hosting setup
- Technology recommendations
- Monthly maintenance / support
