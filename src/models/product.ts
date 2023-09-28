import mongoose, { Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate  from 'mongoose-paginate-v2'; // Importa mongoose-paginate-v2

// Define una interfaz que representa el modelo de datos del producto
interface ProductModel extends Document {
  name: string;
  description: string;
  sku: string;
  image: string;
  labels: string[];
  price: number;
  stock: number;
}

// Define el esquema del producto
const ProductSchema = new Schema<ProductModel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  labels: [{
    type: String,
  }],
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  }
});

// Aplica la paginación a tu esquema
ProductSchema.plugin(mongoosePaginate);

// Crea el modelo de datos para Productos
const Product: any = mongoose.model<ProductModel>('Product', ProductSchema);

export default Product;