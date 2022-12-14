const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.substring(7)
	}
	return null
}

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

	response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)

	if(blog) {
		response.json(blog.toJSON())
	} else {
		response.status(404).end()
	}
})

blogsRouter.post('/', async (request, response) => {
	const body = request.body
	const token = getTokenFrom(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	if(!decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}

	const user = await User.findById(decodedToken.id)
	console.log('user backend', user)
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		user: user._id
	})

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	console.log('saved blog', savedBlog)
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
	const token = getTokenFrom(request)
	const blog = await Blog.findById(request.params.id)
	const decodedToken = jwt.verify(token, process.env.SECRET)

	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}

	const user = await User.findById(decodedToken.id)
	console.log('user', user.id.toString())
	console.log('blog', blog.user.toString())
	if (blog.user.toString() === user.id.toString()) {
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} else {
		response.status(401).json({ error: 'User unauthorized' })
	}

})

blogsRouter.put('/:id', async (request, response) => {
	const body = request.body
	const token = getTokenFrom(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	if(!decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}
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