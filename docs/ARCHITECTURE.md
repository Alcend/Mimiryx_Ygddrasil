# System Architecture

## 1. PRESERVE THE EXISTING ARCHITECTURE
Do not rewrite functioning systems simply because another implementation looks cleaner. Prefer the smallest correct change over a large rewrite. Before introducing a new subsystem, determine whether an existing abstraction already solves most of the problem. Do not create duplicate API clients, state managers, utility libraries, or database services.

## 2. DATABASE SAFETY & DATA INTEGRITY
Before changing database schema: inspect current schema, identify dependencies, design migration, consider existing data and rollback, apply migration, verify records, and test affected operations.
When one user action modifies multiple related entities, reason about atomicity. Use transactions or recoverable job stages where appropriate.

## 3. STATE MANAGEMENT
Every async action should explicitly consider: idle, loading, success, empty, error, retrying, cancelled.
Do not let async operations accidentally produce blank screens, stale data, double submissions, or infinite spinners.

## 4. NO UNCONTROLLED AUTONOMY
Autonomous behavior must remain bounded. Never create infinite loops, unbounded research, unbounded retries, unbounded crawling, or unbounded API requests. Every autonomous operation needs maximum attempts, maximum duration, and maximum resource usage limits.

## 5. CONFIGURATION OVER HARD-CODING
Values likely to change should be configurable (e.g., model, API version, retry limits, timeouts, cache TTL, concurrency). Do not scatter magic numbers throughout the application.

## 6. MIGRATION SAFETY
Any schema migration must be forward-safe, understandable, reversible where practical, and tested. Never casually delete data.
