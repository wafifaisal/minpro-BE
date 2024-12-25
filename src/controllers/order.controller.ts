import { Request, Response } from "express";
import prisma from "../prisma";
const midtransClient = require("midtrans-client");

export class OrderController {
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = "28c71cea-a9b5-43ee-a1cc-dd05bc330385"; // Contoh user ID
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

      for (const item of ticketCart) {
        await prisma.order_Details.create({
          data: {
            orderId: id,
            ticketId: item.Ticket.id,
            quantity: item.quantity,
            subtotal: item.quantity * item.Ticket.price,
          },
        });

        await prisma.ticket.update({
          data: { seats: { decrement: item.quantity } },
          where: { id: item.Ticket.id },
        });
      }

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
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: `${process.env.MID_SERVER_KEY}`,
      });

      const parameters = {
        transaction_details: req.body,
      };

      const order = await snap.createTransaction(parameters);
      res.status(200).send({ result: order.token });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
