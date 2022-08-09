const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	const reducer = (sum, item) => {
		return sum + item.likes
	}

	return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
	const reducer = (prev, next) => {
		return Math.max(prev, next.likes)
	}

	return blogs.reduce(reducer, 0)
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog
}