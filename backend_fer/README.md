# Backend FER

This repository contains the backend code for the FER (Facial Emotion Recognition) project developed during the IPSSI hackathon.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the necessary dependencies, run the following command:

On linux
```bash
pip install poetry
poetry install
poetry run src/backend_fer/app.py
```
on docker
```bash
docker build -t backend_fer_image .
docker run -p 5000:5000 backend_fer_image
```