FROM python:3.12-slim

WORKDIR /app

COPY poetry.lock pyproject.toml ./

RUN curl -sSL https://install.python-poetry.org | python3

ENV PATH="/root/.local/bin:$PATH"

COPY . .

RUN poetry config virtualenvs.create false && \
    poetry install

EXPOSE 5010

CMD ["poetry", "run", "python", "src/backend_fer/app.py"]