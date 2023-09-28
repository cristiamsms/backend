import mongoose, { Schema, Document } from 'mongoose';

// Define una interfaz que representa el modelo de datos del historial de cambios
interface CambioHistorial extends Document {
  productId: any; // ID del producto al que se refiere este cambio
  fechaCambio: Date;
  precioAnterior: number;
  stockAnterior: number;
}

// Define el esquema del historial de cambios
const CambioHistorialSchema = new Schema<CambioHistorial>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Hace referencia al modelo Producto
    required: true,
  },
  fechaCambio: {
    type: Date,
    default: Date.now,
  },
  precioAnterior: {
    type: Number,
    required: true,
  },
  stockAnterior: {
    type: Number,
    required: true,
  },
});

// Crea el modelo de datos para CambioHistorial
const CambioHistorial = mongoose.model<CambioHistorial>('CambioHistorial', CambioHistorialSchema);

export default CambioHistorial;