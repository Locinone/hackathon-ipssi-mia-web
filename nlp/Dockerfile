FROM python:3.12

WORKDIR /app

COPY poetry.lock pyproject.toml ./

RUN curl -sSL https://install.python-poetry.org | python3 && \
    mv /root/.local/bin/poetry /usr/local/bin/

ENV PATH="/root/.local/bin:$PATH"

COPY . .

RUN poetry config virtualenvs.create false && \
    poetry install

EXPOSE 5010

CMD ["poetry", "run", "python", "src/nlp/app.py"]