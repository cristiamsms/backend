import { Router } from "express";
import { deleteProduct, editProduct, getHistoryid, getProductbyid, getProducts, postProduct } from "../controllers/products";


const router = Router();

router.get("/", getProducts);
router.get("/by/:id", getProductbyid);
router.get("/history/:id", getHistoryid);
router.post("/", postProduct);
router.put("/edit/", editProduct);
router.delete("/delete/:id", deleteProduct);


export default router;
