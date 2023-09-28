import { Request, Response } from "express";
import Product from "../models/product";
import CambioHistorial from "../models/history";

import { PaginateOptions } from "mongoose";
interface Paginated {
  docs: any;
  totalDocs: number;
  totalPages: number;
  page?: number;
  limit?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  meta?: any;
}
/**
 * @route   POST /api/productos
 * @desc    Crea un nuevo producto si no existe otro con el mismo SKU.
 * @access  Público (puede ser accesible públicamente)
 *
 * @param   {Request} req - La solicitud HTTP que contiene los datos del nuevo producto en req.body.
 * @param   {Response} res - La respuesta HTTP que se enviará al cliente.
 *
 * @returns {Response} Un objeto JSON con un mensaje que indica si el producto se creó con éxito o si ya existe un producto con el mismo SKU, o si ocurrió un error.
 */
export const postProduct = async (req: Request, res: Response) => {
  // Extrae los datos del nuevo producto desde req.body
  const { body } = req;

  try {
    // Consulta si ya existe un producto con el mismo SKU en la base de datos
    const productoExistente = await Product.findOne({ sku: body.sku });

    // Verifica si ya existe un producto con el mismo SKU
    if (productoExistente) {
      return res.status(500).json({
        ok: false,
        msg: "Ya existe un producto con este SKU",
      });
    } else {
      // Si no existe un producto con el mismo SKU, crea el nuevo producto
      const newProduct = await Product.create(body);

      // Responde con un mensaje de éxito y el producto creado
      res.status(201).json({
        ok: true,
        msg: "Producto creado exitosamente",
        producto: newProduct,
      });
    }
  } catch (error) {
    // Si ocurre un error, registra el error en la consola y responde con un mensaje de error
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al crear el producto. Por favor, hable con el administrador.",
    });
  }
};
/**
 * @route   GET /api/productos
 * @desc    Obtiene productos paginados con opciones de búsqueda por palabra clave y filtrado por rango de precios.
 * @access  Público (puede ser accesible públicamente)
 *
 * @param   {Request} req - La solicitud HTTP que puede contener los siguientes parámetros de consulta:
 * @param   {number} req.query.limit - El número máximo de productos por página.
 * @param   {number} req.query.page - El número de página actual.
 * @param   {string} req.query.search - Una palabra clave para buscar en los campos name, sku y label.
 * @param   {number} req.query.minPrice - El precio mínimo para filtrar los productos.
 * @param   {number} req.query.maxPrice - El precio máximo para filtrar los productos.
 * @param   {Response} res - La respuesta HTTP que se enviará al cliente.
 *
 * @returns {Response} Un objeto JSON con productos paginados que coinciden con los criterios de búsqueda y filtrado.
 */
export const getProducts = async (req: Request, res: Response) => {
  const { limit, page, search, minPrice, maxPrice }: any = req.query;

  const options: PaginateOptions = {
    limit: parseInt(limit),
    page: parseInt(page)+1,
    sort: { _id: -1 },
  };
 
  try {
    let query: any = {}; // Consulta vacía por defecto

    // Si se proporciona una palabra clave en el parámetro search, construye la consulta para buscar productos
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Búsqueda insensible a mayúsculas y minúsculas
          { sku: { $regex: search, $options: "i" } },
          { labels: { $elemMatch: { $regex: search, $options: "i" } } }, // Búsqueda en el array de labels
        ],
      };
    }

    // Si se proporciona minPrice y/o maxPrice, agrega filtros de precio a la consulta
    if (minPrice || maxPrice) {
      query.price = {}; // Objeto de filtro para el campo de precio

      if (minPrice) {
        query.price.$gte = parseFloat(minPrice); // Precio mayor o igual a minPrice
      }

      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice); // Precio menor o igual a maxPrice
      }
    }

    // Utiliza el modelo Product para paginar los resultados de la consulta
    const products: Paginated = await Product.paginate(query, options);
   
    res.status(200).json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};
/**
 * @route   PUT /api/productos/edit
 * @desc    Actualiza un producto por su ID y guarda cambios en el historial si es necesario.
 * @access   Público (puede ser accesible públicamente)
 *
 * @param   {Request} req - La solicitud HTTP que contiene los datos del producto a actualizar en req.body.
 * @param   {Response} res - La respuesta HTTP que se enviará al cliente.
 *
 * @returns {Response} Un objeto JSON con un mensaje que indica si el producto se actualizó con éxito o si ocurrió un error.
 */
export const editProduct = async (req: Request, res: Response) => {
  // Extrae los datos del producto desde req.body
  const { body } = req;

  try {
    // Consulta el producto actual en la base de datos por su ID
    const productoActual = await Product.findById(body._id);

    // Verifica si el producto actual existe
    if (!productoActual) {
      return res.status(404).json({ ok:false, msg: "Producto no encontrado" });
    }

    // Compara el stock y el precio del producto actual con los nuevos datos
    if (
      productoActual.stock !== body.stock ||
      productoActual.price !== body.price
    ) {
      // Si ha habido cambios en el stock o el precio, guarda la información en el historial
      const cambioHistorial = new CambioHistorial({
        productId: productoActual._id,
        precioAnterior: productoActual.price,
        stockAnterior: productoActual.stock,
      });

      await cambioHistorial.save();
    }

    // Realiza la actualización en la base de datos
    await Product.findByIdAndUpdate(body._id, body);

    // Responde con un mensaje de éxito
    res.status(201).json({
      ok: true,
      msg: "Producto actualizado exitosamente",
    });
  } catch (error) {
    // Si ocurre un error, registra el error en la consola y responde con un mensaje de error
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al actualizar el producto. Por favor, hable con el administrador.",
    });
  }
};
/**
 * @route   DELETE /api/productos/delete
 * @desc    Elimina un producto por su ID.
 * @access   Público (puede ser accesible públicamente)
 *
 * @param   {Request} req - La solicitud HTTP que contiene el ID del producto a eliminar en req.body.
 * @param   {Response} res - La respuesta HTTP que se enviará al cliente.
 *
 * @returns {Response} Un objeto JSON con un mensaje que indica si el producto fue eliminado con éxito o si ocurrió un error.
 */
export const deleteProduct = async (req: Request, res: Response) => {
  // Extrae el ID del producto a eliminar desde req.body
  const { id } = req.params;

  try {
    // Busca y elimina el producto en la base de datos por su ID
    await Product.findOneAndDelete({ _id: id });

    // Responde con un mensaje de éxito
    res.status(201).json({
      ok: true,
      msg: "Producto eliminado exitosamente",
    });
  } catch (error) {
    // Si ocurre un error, registra el error en la consola y responde con un mensaje de error
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al eliminar el producto. Por favor, hable con el administrador.",
    });
  }
};

/**
 * @route   GET /api/products/by/:id
 * @desc    Obtiene un producto por su ID.
 * @access  Público (puede ser accesible públicamente)
 *
 * @param   {string} id - ID del producto a obtener.
 *
 * @returns {object} Respuesta JSON con el producto o un mensaje de error.
 */
export const getProductbyid = async (req: Request, res: Response) => {
  // Extrae el ID del producto a obtener desde req.params
  const { id } = req.params;

  try {
    // Busca el producto en la base de datos por su ID
    const producto = await Product.findById(id);

    // Verifica si el producto actual existe
    if (!producto) {
      return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
    }

    // Responde con un mensaje de éxito y el producto
    res.status(201).json({
      ok: true,
      producto,
    });
  } catch (error) {
    // Si ocurre un error, registra el error en la consola y responde con un mensaje de error
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al obtener el producto. Por favor, hable con el administrador.",
    });
  }
};
/**
 * @route   GET /api/products/history/:id
 * @desc    Obtiene un historial de cambios del producto por su ID.
 * @access  Público (puede ser accesible públicamente)
 *
 * @param   {string} id - ID del producto para obtener el historial.
 *
 * @returns {object} Respuesta JSON con el el historial o un mensaje de error.
 */
export const getHistoryid = async (req: Request, res: Response) => {
  // Extrae el ID del producto a obtener desde req.params
  const { id } = req.params;

  try {
    // Busca el historial de cambios del producto en la base de datos por su ID
    const historial = await CambioHistorial.find({productId:id});


    // Responde con un mensaje de éxito y el historial del producto
    res.status(201).json({
      ok: true,
      historial,
    });
  } catch (error) {
    // Si ocurre un error, registra el error en la consola y responde con un mensaje de error
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al obtener el historial de cambios. Por favor, hable con el administrador.",
    });
  }
};
