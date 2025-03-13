FROM python:3.13.2-bullseye

WORKDIR /app

COPY poetry.lock pyproject.toml ./

RUN curl -sSL https://install.python-poetry.org | python3

COPY . .

ENV PATH="/root/.local/bin:$PATH"

RUN poetry config virtualenvs.create false && \
    poetry install

EXPOSE 5050

CMD ["poetry", "run", "python", "src/backend_fer/app.py"]