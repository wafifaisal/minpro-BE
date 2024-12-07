import { Request, Response } from "express";
import prisma from "../prisma";
import { EventCategory, Location } from "@prisma/client";
import { Prisma } from "@prisma/client";

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
          slug: true,
          date: true,
          Ticket: {
            select: {
              price: true,
            },
          },
          Organizer: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
      console.log("Fetched events:", events);
      res.status(200).send({ events });
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(400).send({ error: "Failed to fetch events" });
    }
  }

  async getEventSlug(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      const event = await prisma.event.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          event_name: true,
          description: true,
          category: true,
          location: true,
          date: true,
          event_thumbnail: true,
          event_preview: true,
          Ticket: {
            select: {
              id: true,
              category: true,
              price: true,
              seats: true,
            },
          },
          Organizer: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
      res.status(200).send({ event });
    } catch (err) {
      console.error("Error fetching event by slug:", err);
      res.status(400).send({ error: "Failed to fetch event" });
    }
  }
}
