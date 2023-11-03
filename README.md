## This is a fullstack project written with DRF and Next.js
### About:
Full-powered dating application.

Working example: https://typst.ru

```
Signin credentials:

Email: test_email5@mail.ru
Password: 794613825Zx
```
___
### Stack:

- Database:
  - PostgresSQL

- Backend:
  - Django Rest Framework
  - Django-Channels
  - Redis
  - Celery
  - Fast API (recommendation system, separate container)
  - Gunicorn/Daphne

- Frontend:
  - Next.js 14
  - Next-Auth
  - TailwindCSS

- Deploy:
  - Docker/Docker-compose
  - NGINX
___
### Features:

- JWT authentication
- Live notifications and chat with WebSockets
- AI-powered recommendation system
- Swipes and users grid
- Switch between light and dark theme in one click
- Compatibility percentage for users
- i18n eng & rus
- Phone compatible
- Base SEO
- Backend tested