import { Request, Response } from "express";

import { PrismaClient, Prisma } from "@prisma/client";
import { cloudinaryUpload } from "../services/cloudinary";

const prisma = new PrismaClient();

export class EventController {
  async getEvent(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const filter: Prisma.EventWhereInput = {};
      if (search) {
        filter.event_name = { contains: search as string, mode: "insensitive" };
      }
      const events = await prisma.event.findMany({
        where: filter,
        select: {
          id: true,
          category: true,
          event_name: true,
          event_thumbnail: true,
          event_preview: true,
          start_time: true,
          end_time: true,
          event_date: true,
          venue: true,
          location: true,
          Ticket: {
            select: {
              id: true,
              category: true,
              desc: true,
              price: true,
              seats: true,
            },
          },
          Organizer: {
            select: {
              organizer_name: true,
              avatar: true,
            },
          },
        },
      });
      // console.log("Fetched events:", events);
      res.status(200).send({ events });
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(400).send({ error: "Failed to fetch events" });
    }
  }

  async getEventbyID(req: Request, res: Response) {
    try {
      console.log(req.params.id);
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          event_name: true,
          description: true,
          category: true,
          location: true,
          start_time: true,
          end_time: true,
          event_date: true,
          event_thumbnail: true,
          event_preview: true,
          venue: true,
          Ticket: {
            select: {
              id: true,
              category: true,
              desc: true,
              price: true,
              seats: true,
              Order_Details: {
                select: {
                  id: true,
                  quantity: true,
                },
              },
            },
          },
          Organizer: {
            select: {
              organizer_name: true,
              avatar: true,
            },
          },
        },
      });
      res.status(200).send({ result: event });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      if (!req.file) throw { message: "thumbnail empty" };
      const { secure_url } = await cloudinaryUpload(req.file, "event");

      const {
        event_name,
        description,
        location,
        venue,
        start_time,
        end_time,
        event_date,
        event_type,
        category,
        event_preview,
      } = req.body;

      const { id } = await prisma.event.create({
        data: {
          event_name,
          event_thumbnail: secure_url,
          description,
          venue,
          location,
          start_time,
          end_time,
          event_type,
          category,
          event_date,
          event_preview,
        },
      });

      res.status(200).send({ message: "event created", event_id: id });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
