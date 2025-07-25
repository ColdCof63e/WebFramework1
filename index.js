const mongoose = require("mongoose");
main().catch(err => console.log(err))

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/BlogExample')

        var blogSchema = new mongoose.Schema({
            title: String,
            author:String,
            body: String
        })

        const blog = mongoose.model("blogTable", blogSchema)

        const blogDocs = [{
            title: "Blog 4",
            author: "Author 4",
            body: "Story 4"
        }, 
        {
            title: "Blog 5",
            author: "Author 4",
            body: "Story 5"
        }, 
        {
            title: "Blog 6",
            author: "Author 6",
            body: "Story 36"
        }]

        for (const doc of blogDocs) {
            const blogIt = new blog(doc)
            await blogIt.save()
        }

        blog.find();

        const updatingOne = await blog.updateOne({title: "Blog 5"}, {$set: {author: "Author 5"}})
        console.log("Updated One Blog -> ", updatingOne)

        const deletingOne = await blog.deleteOne({title: "Blog 6"})
        console.log("Deleted Blog is -> ", deletingOne)
    } catch (error) {
        
    }
}