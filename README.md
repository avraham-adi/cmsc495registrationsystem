# cmsc495registrationsystem

## CMSC 495 Group Delta Course Registration System

At this stage of development, the authentication and authorization layer has been fully implemented and validated, including stateless JWT-based authentication, first-login password rotation enforcement, a comprehensive password policy, and admin-level role restrictions. The system has been structured with a clear separation of concerns across controllers, services, middleware, and domain models, and is currently transitioning from a CLI-based prototype to a fully RESTful API.

---

AUTHORIZATION MATRIX

Public
• GET /api/health
• POST /api/auth/login

Authenticated (first-login allowed)
• GET /api/auth/me
• POST /api/auth/logout
• POST /api/auth/change-password

Admin-only
• POST /api/admin/users
• PATCH /api/admin/users/:id/role
• DELETE /api/admin/users/:id

First-login restriction
• First-login users may only access /api/auth/me, /api/auth/logout, and /api/auth/change-password until they change their password

Future ownership policies
• Self-only: requireSelf
• Self-or-admin: requireSelfOrAdmin
