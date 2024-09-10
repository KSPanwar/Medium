import { Appbar } from "../components/Appbar"
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton"
import { useBlogs } from "../hooks"

export const Blogs = () =>{
    const {loading,blogs} = useBlogs()
    if(loading){
        return <div>
            <BlogSkeleton></BlogSkeleton>
            <BlogSkeleton></BlogSkeleton>
            <BlogSkeleton></BlogSkeleton>
        </div>
    }
    return <div>
        <Appbar></Appbar>
         <div className="flex justify-center">
        <div className="">
        {blogs.map(blog => (
                        <BlogCard
                            id={blog.id} // Ensure each BlogCard has a unique key
                            authorname={blog.author.name || 'Unknown Author'}
                            title={blog.title}
                            content={blog.content}
                            publishedDate={"7 Sep 2024"} // Consider using actual date
                        />
                    ))}
        
    </div>
    </div>
    </div>
}