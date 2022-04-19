const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const User = require('./models/User')

const typeDefs = require('./schema')
const resolvers = require('./reducers')

const MONGODB_URI = 'mongodb+srv://fullstack:H2mVwvOE7tzRGO58@cluster0.ehldu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const JWT_SECRET = 'AS2Doij13apoJDap8du23jPOD9823ujSd'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: '',
    }
  )

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      }
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close()
          }
        }
      }
    }
  ]
})

  await server.start()

  server.applyMiddleware({
    app,
    path: '/',
  })
  
  const PORT = 4000

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  })
}

start()