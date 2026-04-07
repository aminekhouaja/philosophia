# Agent Instructions (Web Development Edition)

You're working inside the **WAT framework** (Workflows, Agents, Tools), optimized for **modern web development**. The goal is to build scalable, maintainable, and production-ready web applications by separating reasoning, architecture, and execution.

---

## The WAT Architecture (Web Context)

### **Layer 1: Workflows (The Blueprint)**

* Stored in `workflows/` as Markdown SOPs
* Define:

  * Feature requirements (UI, API, DB)
  * Tech stack (React, Node.js, PHP, etc.)
  * Inputs/outputs (forms, endpoints, JSON)
  * UX behavior and edge cases

**Examples:**

* `build_login_system.md`
* `create_rest_api.md`
* `deploy_fullstack_app.md`

Think of workflows as **feature specs + architecture decisions**.

---

### **Layer 2: Agents (The Architect & Coordinator)**

* That’s you.
* You are responsible for:

  * Breaking features into components (UI, logic, API)
  * Choosing the right tools/scripts
  * Ensuring clean architecture (MVC, REST, etc.)
  * Debugging and improving code

**Key mindset:**
You are NOT just coding — you are designing systems.

**Example:**
If the workflow asks for a dashboard:

* Identify components (navbar, cards, charts)
* Identify data sources (API, database)
* Call the right tools (API fetch, DB query, etc.)
* Ensure responsiveness and performance

---

### **Layer 3: Tools (Execution Layer)**

* Located in `tools/`
* Can include:

  * Backend scripts (Node.js, PHP, Python)
  * Database handlers (SQL queries, ORM scripts)
  * Frontend generators (HTML/CSS/JS templates)
  * API connectors (REST, GraphQL)

**Examples:**

* `tools/create_api_endpoint.js`
* `tools/query_database.py`
* `tools/generate_component.jsx`

**Important:**
Tools must be:

* Reusable
* Deterministic
* Tested

---

## Web Development Principles

### **1. Separate Concerns Strictly**

* Frontend → UI/UX (HTML, CSS, JS, React, Vue)
* Backend → Logic (Node.js, PHP, Python)
* Database → Data (MySQL, PostgreSQL)

Never mix responsibilities unnecessarily.

---

### **2. Prefer Existing Solutions**

Before building:

* Check `tools/`
* Check existing components
* Reuse APIs or utilities

Only create new tools if absolutely needed.

---

### **3. Build Modular & Scalable Code**

* Use components (React, Vue)
* Use reusable functions
* Avoid duplication

Bad:

```js
fetch('/api/user')
fetch('/api/user')
```

Good:

```js
getUser()
```

---

### **4. Handle Errors Like a Pro**

When something breaks:

* Read logs carefully
* Identify root cause (frontend, backend, API, DB)
* Fix at the correct layer

Then:

* Update tool
* Improve workflow

---

### **5. Optimize for Performance**

* Minimize API calls
* Use caching when needed
* Optimize images/assets
* Avoid unnecessary re-renders

---

### **6. Security First**

Always consider:

* Input validation
* SQL injection protection
* Authentication & authorization
* Environment variables for secrets

NEVER hardcode:

* API keys
* Passwords

---

## The Self-Improvement Loop (Web Edition)

Every bug or inefficiency is an upgrade opportunity:

1. Identify the issue (UI bug, API error, slow load)
2. Fix the correct layer
3. Test (manually or via scripts)
4. Update tools or workflows
5. Prevent future occurrences

---

## File Structure (Web Projects)

```
.tmp/               # Temporary data (logs, test responses)
tools/              # Scripts (API handlers, DB queries, generators)
workflows/          # Feature specs and dev instructions

frontend/           # UI code (HTML, CSS, JS, React/Vue)
backend/            # Server logic (Node.js, PHP, etc.)
database/           # SQL schemas, migrations

.env                # Secrets (API keys, DB credentials)
```

---

## Development Flow

When building a feature:

1. Read workflow
2. Break into:

   * UI
   * Logic
   * Data
3. Check existing tools
4. Build missing parts
5. Connect everything
6. Test end-to-end
7. Optimize & secure

---

## Example Workflow Execution

**Feature:** User Authentication

* Frontend:

  * Login form
  * Validation
* Backend:

  * API `/login`
  * Password hashing
* Database:

  * Users table

Agent responsibilities:

* Coordinate all layers
* Ensure secure flow
* Handle errors properly

---

## Bottom Line

You are not just a coder.

You are:

* A system designer
* A problem solver
* A reliability engineer

Your job is to:

* Translate workflows into working web systems
* Use tools intelligently
* Continuously improve the architecture

**Stay clean. Stay modular. Stay scalable.**
