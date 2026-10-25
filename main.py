from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import Products
from database import SessionLocal, engine
import database_models
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind=engine)



@app.get("/")
def greet():
    return "welcome"
greet()


products = [
    Products(id=1, name="Phone", description="A smartphone", price=699.99, quantity=50),
    Products(id=2, name="Laptop", description="A gaming laptop", price=999.99, quantity=30),
    Products(id=3, name="Pen", description="A blue ink pen", price=1.99, quantity=100),
    Products(id=4, name="Table", description="A plastic table", price=199.99, quantity=20),
]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def init_DB():
    db = SessionLocal()
    try:
        count = db.query(database_models.Products).count()
        if count == 0:
            for product in products:
                db.add(database_models.Products(**product.model_dump()))
            db.commit()
    finally:
        db.close()

init_DB()


@app.get("/products")
def get_all_prds(db: Session = Depends(get_db)):
    db_products = db.query(database_models.Products).all()
    return db_products



@app.get("/product/{id}")
def get_prd_by_id(id: int, db: Session = Depends(get_db)):
    db_products = db.query(database_models.Products).filter(database_models.Products.id == id).first()
    if db_products:
        return db_products
    return "Product not found. "



@app.post("/product")
def add_prd(product: Products, db: Session = Depends(get_db)):
    db.add(database_models.Products(**product.model_dump()))
    db.commit()
    return product


@app.put("/product")
def update_prd(id: int, product: Products, db: Session = Depends(get_db)):
        db_products = db.query(database_models.Products).filter(database_models.Products.id == id).first()
        if db_products is None:
            return "No product found. "

        setattr(db_products, "name", product.name)
        setattr(db_products, "description", product.description)
        setattr(db_products, "price", product.price)
        setattr(db_products, "quantity", product.quantity)
        db.commit()
        return "Product: updated. "



@app.delete("/product")
def del_prd(id: int, db: Session = Depends(get_db)):
    db_products = db.query(database_models.Products).filter(database_models.Products.id == id).first()

    if db_products:
        db.delete(db_products)
        db.commit()
        return {"message": "Product deleted successfully"}

    else:
        return {"message": "Product not found"}
