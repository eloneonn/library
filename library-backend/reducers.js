const { UserInputError, AuthenticationError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const jwt = require('jsonwebtoken')
const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')

const JWT_SECRET = 'AS2Doij13apoJDap8du23jPOD9823ujSd'

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
          var returnedBooks = await Book.find().populate('author')
          returnedBooks = args.author ? returnedBooks.filter(e => e.author.name === args.author) : returnedBooks // Optional filter by author
          returnedBooks = args.genre ? returnedBooks.filter(e => e.genres.find(g => g === args.genre)) : returnedBooks // Optional filter by genre
  
          return returnedBooks
      },
        allAuthors: async () => await Author.find(),
        me: async (root, args, context) => context.currentUser
    },
    Mutation: {
      createUser: async (root, args) => {
        const user = new User({...args})
        console.log(user);
        try {
          await user.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })    
        }
  
        return user
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
  
        if ( !user || args.password !== 'secret' ) {
          throw new UserInputError("wrong credentials")
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, JWT_SECRET) }
      },
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
    
        var returnedAuthor = await Author.findOne({name: args.author})
  
        if (!returnedAuthor) {
          const author = new Author({ name: args.author })
          try {
            returnedAuthor = await author.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })    
          }
        }
        
        const book = new Book({ ...args, author: returnedAuthor })
  
        try {
          var returnedBook = await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })  
        }

        await Author.findOneAndUpdate({ name: returnedAuthor.name }, { books: returnedAuthor.books.concat(returnedBook._id)})

        pubsub.publish('BOOK_ADDED', { bookAdded: book})

        return book
      },
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
  
        var author = await Author.findOne({ name: args.name })
        
        if (author) {
          try {
            await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo })
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })    
          }
        }
  
        return author
      }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
  }
  
module.exports = resolvers