import { Request, Response } from "express";
import prisma from "../prisma";
import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { generateReferralCode } from "../utils/generateReffCode";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const { password, confirmPassword, firstName, lastName, email, ref_by } = req.body;
      if (password !== confirmPassword) throw { message: "Passwords do not match!" };

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });
      if (existingUser) throw { message: "Email has already been used" };

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);
      const ref_code = generateReferralCode(firstName)

      const newUser = await prisma.user.create({
        data: { 
          firstName,
          lastName,
          email,
          password: hashPassword,
          avatar: null,
          isVerify: false,
          ref_code,
          ref_by: null
        },
      });

      const payload = { id: newUser.id };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
      const link = `http://localhost:3000/verify/${token}`;

      const templatePath = path.join(__dirname, "../templates/verify.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({ firstName, link });

      // Send verification email using nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Blogger",
        html,
      });

      res.status(201).send({ message: "Registration Successful √" });
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const { data, password } = req.body;
      
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data },
            { password: data }
          ]
        }
      });

      if (!user) throw { message: "Account not found!" };
      if (!user.isVerify) throw { message: "Account is not verified!" };

      const isValidPass = await compare(password, user.password);
      if (!isValidPass) throw { message: "Incorrect Password" };

      const payload = { id: user.id };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 3600 * 1000, // 24 hours
          path: "/",
          secure: process.env.NODE_ENV === "production",
        })
        .send({
          message: "Login Successful √",
          token,
          data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          }
        });
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  }

  async verifyUser(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const verifiedUser = verify(token, process.env.JWT_KEY!) as { id: string };
      
      await prisma.user.update({
        data: { isVerify: true },
        where: { id: verifiedUser.id },
      });
      
      res.status(200).send({ message: "Verification Successful √" });
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  }
}

