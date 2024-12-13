import { Request, Response } from "express";
import prisma from "../prisma";
import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import path from "path";
import fs from "fs";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const { password, confirmPassword, username, email } = req.body;
      if (password != confirmPassword) throw { message: "Password not Match!" };

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { first_name: username },
            { email }
          ]
        }
      });
      if (existingUser) throw { message: "Username or email has been used" };

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);

      const newUser = await prisma.user.create({
        data: { 
          email,
          password: hashPassword,
          first_name: username, // Using username as first_name since schema doesn't have username
          last_name: "",
          avatar: null,
          isVerify: false,
          ref_code: Math.random().toString(36).substring(7)
        },
      });

      const payload = { id: newUser.id };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
      const link = `http://localhost:3000/verify/${token}`;

      const handlebars = require("handlebars");
      const templatePath = path.join(__dirname, "../templates/verify.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({ username, link });

      // Send verification email using nodemailer directly
      const nodemailer = require("nodemailer");
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

      res.status(201).send({ message: "Register Successfully √" });
    } catch (err) {
      console.log(err);
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
            { first_name: data }
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
          message: "Login Successfully √",
          token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar
          }
        });
    } catch (err) {
      console.log(err);
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
      
      res.status(200).send({ message: "Verify Successfully √" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
