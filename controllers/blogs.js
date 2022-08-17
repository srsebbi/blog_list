const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({}).populate('user', { username: 1, name: 1 })

	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)

	if(blog) {
		response.json(blog.toJSON())
	} else {
		response.status(404).end()
	}
	// Blog.findById(request.params.id)
	// 	.then(blog => {
	// 		if(blog) {
	// 			response.json(blog)
	// 		} else {
	// 			response.status(404).end()
	// 		}
	// 	})
})

blogsRouter.post('/', async (request, response) => {
	const body = request.body

	const user = await User.findById(body.userId)

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		user: user._id
	})

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()
	response.status(201).json(savedBlog)
	// blog
	// 	.save()
	// 	.then(savedBlog => {
	// 		response.status(201).json(savedBlog)
	// 	})
	// 	.catch(error => next(error))
})

blogsRouter.delete('/:id', async (request, response) => {
	const blogToDelete = await Blog.findByIdAndRemove(request.params.id)
	console.log('delete', blogToDelete)
	response.status(204).end()
	// Blog.findByIdAndRemove(request.params.id)
	// 	.then(() => {
	// 		response.status(204).end()
	// 	})
	// 	.catch(error => next(error))
})

blogsRouter.put('/:id', async (request, response) => {
	const body = request.body

	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes
	}

	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
	response.json(updatedBlog)
	// .then(updatedBlog => {
	// 	response.json(updatedBlog)
	// })
	// .catch(error => next(error))
})

module.exports = blogsRouter