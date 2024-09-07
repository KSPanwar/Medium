import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput } from "@kp4092509/medium-common";

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET:string
	}
}>();

userRouter.post("/signup",async (c)=>{
  const body = await c.req.json()
  const {success}=signinInput.safeParse(body)
  if(!success){
    c.status(411)
    return c.json({
      message:"Input not correct"
    })
  }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    try {
      const user = await prisma.user.create({
        data:{
          email :body.email,
          password:body.password,
          name:body.name
        }
      })
      const jwt = await sign({id:user.id},c.env.JWT_SECRET)
      return c.json({jwt})
    } catch (error) {
      c.status(411)
      return c.text("Invalid")
    }
  })
  
  userRouter.post("/signin",async (c)=>{
    const body = await c.req.json()
    const {success}=signinInput.safeParse(body)
    if(!success){
      return c.json({
        message:"Wrong input"
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    try {
      const user = await prisma.user.findFirst({
        where: {
          email:body.email,
          password:body.password
        }
      })
      if(!user){
        c.status(403)
        return c.text("UnAuthorized")
      }
      const jwt = await sign({id:user.id},c.env.JWT_SECRET)
      return c.json({jwt})
    } catch (error) {
      c.status(411)
      return c.text("Invalid")
    }
  })