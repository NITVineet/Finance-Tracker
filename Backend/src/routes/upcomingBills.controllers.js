import { Router } from "express";
import {
    markPaid,
    listUpcoming,
    createBill,
    getBills,
    updateBill,
    deleteBill,
    getSingleBill,
    listBills
} from "../controllers/upcomingBills.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/api/bills")
    .post(createBill)
    .get(listBills);  

router.route("/api/bills/:id")
    .get(getSingleBill)
    .patch(updateBill)
    .delete(deleteBill);

router.route("/api/bills/:id/pay").patch(markPaid);
router.route("/api/bills/all").get(getBills);
router.route("/api/bills/upcoming").get(listUpcoming);

export default router;
