import { Request, Response } from "express";
import prisma from "../prisma";
const midtransClient = require("midtrans-client");
import { requestBody } from "../types/reqBody";

export class OrderController {
  async createTransaction(req: Request<{}, {}, requestBody>, res: Response) {
    try {
      const userId = "15d455f7-9c74-4581-aca4-e1bb6a171b56"; // Contoh user ID
      const { total_price, final_price, ticketCart } = req.body;

      const expiredAt = new Date(Date.now() + 10 * 60000); // Expired in 10 minutes

      const { id } = await prisma.order.create({
        data: {
          userId: userId,
          total_price,
          final_price,
          expiredAt,
        },
      });

      await Promise.all(
        ticketCart.map(async (item) => {
          if (item.quantity > item.Ticket.seats) {
            throw new Error(
              `Insufficient seats for ticket ID: ${item.Ticket.id}`
            );
          }

          // Create order details
          await prisma.order_Details.create({
            data: {
              orderId: id,
              ticketId: item.Ticket.id,
              quantity: item.quantity,
              subtotal: item.quantity * item.Ticket.price,
            },
          });

          // Update ticket seats
          await prisma.ticket.update({
            data: { seats: { decrement: item.quantity } },
            where: { id: item.Ticket.id },
          });
        })
      );

      res.status(200).send({ message: "Transaction created", orderId: id });
    } catch (err) {
      console.error("Error creating order:", err);
      res
        .status(500)
        .send({ error: "An error occurred while creating the order" });
    }
  }

  // Get transaction details by ID
  async getOrderId(req: Request, res: Response) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: +req.params.id },
        select: {
          total_price: true,
          final_price: true,
          status: true,
          createdAt: true,
          expiredAt: true,
          Order_Details: {
            select: {
              quantity: true,
              subtotal: true,
              Ticket: {
                select: {
                  category: true,
                  desc: true,
                  price: true,
                  Event: {
                    select: {
                      event_name: true,
                      start_time: true,
                      end_time: true,
                      event_date: true,
                      location: true,
                      venue: true,
                      event_thumbnail: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      res.status(200).send({ result: order });
    } catch (err) {
      console.error("Error fetching transaction:", err);
      res.status(500).send({
        error: "An unknown error occurred while fetching the transaction",
      });
    }
  }

  // Generate Snap token for Midtrans
  async getSnapToken(req: Request, res: Response) {
    try {
      const { orderId, gross_amount } = req.body;
      const item_details = [];

      const checkTransaction = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, expiredAt: true },
      });
      if (checkTransaction?.status === "cancelled")
        throw "You cannot continue transaction, as your delaying transaction";

      const resMinutes =
        new Date(`${checkTransaction?.expiredAt}`).getTime() -
        new Date().getTime();

      const duration = Math.ceil(resMinutes / 60000);

      const ticketTransaction = await prisma.order_Details.findMany({
        where: { orderId: orderId },
        include: {
          Ticket: {
            select: {
              category: true,
            },
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: "7095300d-8c70-4cd8-9ba5-61e0b317291a" },
      });

      for (const item of ticketTransaction) {
        item_details.push({
          id: item.ticketId,
          name: item.Ticket.category,
          price: item.subtotal / item.quantity,
          quantity: item.quantity,
          category: item.Ticket.category,
        });
      }

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MID_SERVER_KEY,
      });

      const parameter = {
        transaction_details: {
          order_id: orderId.toString(),
          gross_amount: gross_amount,
        },
        customer_details: {
          first_name: user?.firstName,
          last_name: user?.lastName,
          email: user?.email,
        },
        item_details,
        page_expiry: {
          unit: "minutes",
          duration: duration,
        },
        expiry: {
          unit: "minutes",
          duration: duration,
        },
      };

      const order = await snap.createTransaction(parameter);
      console.log("Generated token:", order.token); // Log token
      res.status(200).send({ result: order.token });
    } catch (err) {
      console.log("Error generating token:", err);
      res
        .status(400)
        .send({ error: "An unknown error occurred while fetching the token" });
    }
  }

  async midtransWebHook(req: Request, res: Response) {
    try {
      const { transaction_status, order_id } = req.body;
      console.log("Order_ID :", +order_id);
      const statusOrder =
        transaction_status === "settlement"
          ? "success"
          : transaction_status === "pending"
          ? "pending"
          : "cancelled";

      if (statusOrder === "cancelled") {
        const tickets = await prisma.order_Details.findMany({
          where: { orderId: +order_id },
          select: {
            quantity: true,
            ticketId: true,
          },
        });

        for (const item of tickets) {
          await prisma.ticket.update({
            where: { id: item.ticketId },
            data: { seats: { increment: item.quantity } },
          });
        }
      }

      await prisma.order.update({
        where: { id: +order_id },
        data: {
          status: statusOrder,
        },
      });

      res.status(200).send({ message: "Success" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
