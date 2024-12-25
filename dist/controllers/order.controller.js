"use strict";
// import { Request, Response } from "express";
// import prisma from "../prisma";
// import axios from "axios";
// export class OrderController {
//   async createOrder(req: Request, res: Response) {
//     try {
//       const { total_price } = req.body;
//       function addMinutes(date: Date, minutes: number) {
//         date.setMinutes(date.getMinutes() + minutes);
//         return date;
//       }
//       const date = new Date();
//       const newDate = addMinutes(date, 10);
//       const order = await prisma.order.create({
//         data: { total_price, userId: req.user?.id!, expiredAt: newDate },
//       });
//       const body = {
//         transaction_details: {
//           order_id: order.id,
//           gross_amount: total_price,
//         },
//         expiry: {
//           unit: "minutes",
//           duration: 10,
//         },
//       };
//       const { data } = await axios.post(
//         "https://app.sandbox.midtrans.com/snap/v1/transactions",
//         body,
//         {
//           headers: {
//             Authorization:
//               "Basic U0ItTWlkLXNlcnZlci16X1lYU2szR2dKM21QVm04S0lyYVZkYVQK",
//           },
//         }
//       );
//       await prisma.order.update({
//         data: { redirect_url: data.redirect_url },
//         where: { id: order.id },
//       });
//       res.status(201).send({
//         message: "Order Created",
//         data,
//         order,
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(400).send(err);
//     }
//   }
//   async updateStatus(req: Request, res: Response) {
//     try {
//       const { transaction_status, order_id } = req.body;
//       if (transaction_status == "settlement") {
//         await prisma.order.update({
//           data: { status: "Paid" },
//           where: { id: +order_id },
//         });
//       }
//       res.status(200).send({ message: "Order updated" });
//     } catch (err) {
//       console.log(err);
//       res.status(400).send(err);
//     }
//   }
// }
