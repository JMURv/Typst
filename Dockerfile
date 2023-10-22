FROM python:3.11-alpine

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR ./app/backend

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

COPY ./backend/poetry.lock ./backend/pyproject.toml ./

RUN pip install poetry
RUN poetry config installer.max-workers 10
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

COPY ./backend ./

EXPOSE 8000 8001