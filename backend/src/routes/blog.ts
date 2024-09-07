import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { createpostInput } from "@kp4092509/medium-common";



export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET:string
	},Variables:{
    userId:string
  }
}>();
blogRouter.use("/*",async (c,next)=>{
  const token = c.req.header("authorization") || ''
   try {
    const user =  await verify(token,c.env.JWT_SECRET)
   if(user){
    c.set("userId",user.id as string )
     await next()
   }else{
    c.status(403)
    return c.json({
      message:"You are not logged in"
    })
   }
   } catch (error) {
    c.status(403)
    return c.json({
      message:"You are not logged in"
    })
   }
})

//post the blog in post table with related author id
blogRouter.post("/",async (c)=>{
  const body = await c.req.json()
  const {success} = createpostInput.safeParse(body)
  if(!success){
    return c.json({
      message:"values not correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const authorId = c.get("userId")
  const blog= await prisma.post.create({
    data:{
      title:body.title,
      content:body.content,
      authorId: authorId  //extract the user id from middleware when we do authentication
    }
  })
    return c.json({
      id:blog.id
    })
  })
  //update the blog in post table with new data
  blogRouter.put("/",async (c)=>{
    const body = await c.req.json()
    const {success} = createpostInput.safeParse(body)
    if(!success){
      return c.json({
        message:"values not correct"
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blog= await prisma.post.update({
      where :{
        id : body.id
      },
      data:{
        title:body.title,
        content:body.content,
      }
    })
      return c.json({
        id:blog.id
      })
  })
  blogRouter.get("/bulk",async (c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blog = await prisma.post.findMany()
    return c.json({
      blog
    })
  })
  //get author related post
  blogRouter.get("/:id",async (c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const id = c.req.param("id")
    try {
      const blog= await prisma.post.findFirst({
        where :{
          id : id
        },
      })
        return c.json({
          blog
        })
    } catch (error) {
      c.status(411)
      return  c.json("error ocurred")
    }
  })
  //to do: add pagination

 