# Inventory Management App

A full-stack inventory management application for maintaining a product catalog and tracking product quantities. The React frontend connects to a FastAPI backend backed by PostgreSQL.

## Features

- View, search, and sort products
- Add, edit, and delete products
- Track product descriptions, prices, and quantities
- See stock status for each product
- Responsive inventory dashboard

## Tech stack

- **Frontend:** React, Axios
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL

## Project structure

```text
.
├── database.py
├── database_models.py
├── main.py
├── models.py
├── requirements.txt
└── frontend/
    ├── package.json
    └── src/
```

## Requirements

- Python 3.10 or newer
- Node.js and npm
- PostgreSQL

## Run the backend

Create and activate a Python virtual environment, then install the backend dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a PostgreSQL database, then configure its SQLAlchemy connection URL in the environment. Keep your actual database credentials private:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://USER:PASSWORD@localhost:5432/DATABASE_NAME"
```

Start the API:

```powershell
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`; interactive API documentation is at `http://localhost:8000/docs`.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000`. The development server proxies API requests to `http://localhost:8000`. To use a different API URL, set `REACT_APP_API_URL` before starting the frontend.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/products` | List all products |
| `GET` | `/product/{id}` | Get a product by ID |
| `POST` | `/product` | Create a product |
| `PUT` | `/product?id={id}` | Update a product |
| `DELETE` | `/product?id={id}` | Delete a product |

Product requests use the fields `id`, `name`, `description`, `price`, and `quantity`.
