FROM python:3.10

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR ./app/recommendations

COPY poetry.lock pyproject.toml ./

RUN pip install poetry
RUN poetry config installer.max-workers 10
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi
RUN python -m nltk.downloader stopwords && python -m nltk.downloader punkt

COPY . ./

EXPOSE 9000