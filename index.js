// TODO: https://github.com/apollographql/apollo-server/issues/3508
// const {uploadMiddleWare} = require("./uploadMiddleware");
const {upload} = require("./upload");
const uploadController = require("./controllers/upload");
const multer = require("multer");
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const {makeExecutableSchema} = require("graphql-tools");
const {createWriteStream} = require('fs');
const {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString} = require("graphql")
const {GraphQLServer} = require('graphql-yoga')
const {ApolloServer} = require('apollo-server-express')
const express = require('express')

// const {ApolloServer} = require("apollo-server");
const {GraphQLUpload} = require('graphql-upload');
global.__basedir = __dirname;
const pathBase = '/';
const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};

// const storeUpload = ({stream, filename}) => {
//   return new Promise((resolve, reject) => {
//     return stream
//       .pipe(createWriteStream(filename))
//       .on("finish", () => resolve())
//       .on("error", reject)
//   })
// }

// console.log("uploadFile", uploadFile)
const typeDefs = `
  scalar Upload

 type File {
      filename: String!
      mimetype: String!
      encoding: String!
   }

  type Mutation {
    uploadFile(file: Upload!): Boolean
  }

  type Query {
    hello: String
  }
`;

// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, __basedir + "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
//   },
// });
app.use("*", cors(corsOptions));
const midLogger = (req, res, next) => {
  console.log("Hello from logger\n");
  next();
};
app.use("*", midLogger);

const resolvers = {
  Mutation: {
    uploadFile: async (parent, {file}) => {
      const {createReadStream, filename, mimetype, encoding} = await file;
      console.log('file', file)
      // console.log('path', path)
      if (!file) return false
      else if (file) {
        const readStream = createReadStream(filename)
        readStream
          .on('open', function () {
            readStream.pipe(res)
          })
          .pipe(
            fs.createWriteStream(
              path.join(__dirname, "uploads/", filename)
            )
          )
          .on("close", res => {
            console.log('close ', res)
          })
        // upload(file, res, (err) => {
        //   if (err) {
        //     console.log('err', err)
        //   }
        // })
        return true
      }
      // app.post('/', (req, res) => {
      //    console.log('app post')
      //    return upload(req, res, (err) => {
      //      if (err) {
      //        console.log('err', err)
      //        return false
      //      } else {
      //        if (file == undefined) {
      //          console.log('File undefined')
      //          return false
      //        } else {
      //          console.log('File uploaded', filename)
      //          return true
      //        }
      //      }
      //    })
      //  })

      // uploadFile.single("file")

      // console.log("uploadFile", upload);

    }
  },
  Query: {
    hello: () => "hi"
  }
};
const plugLogger = {
  // Fires whenever a GraphQL request is received from a client.
  requestDidStart(requestContext) {
    console.log('Request started! Query:\n' +
      requestContext.request.query)

    return {

      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      parsingDidStart(requestContext) {
        console.log('Parsing started!')
      }

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
    }
  }
}
const schema = makeExecutableSchema({typeDefs, resolvers});
const server = new ApolloServer({
  schema, plugins: [
    plugLogger
  ]
})
server.applyMiddleware({app, path: pathBase})


// app.use("*", uploadMiddleWare);
// app.use("*", uploadFile.single("file"), uploadController.uploadFiles);
// app.use("*", upload.single("file"));


// server.applyMiddleware({ app, path })
app.listen(
  {port: process.env.PORT || 4000},
  () =>
    console.log(
      `🚀 Server ready at: http://localhost:4000${server.graphqlPath}\n⭐️ See sample queries: http://pris.ly/e/js/graphql-apollo-server#using-the-graphql-api`
    )
)
//
// const server = new GraphQLServer({
//   schema
// })
// server.start(() => console.log('Server is running on http://localhost:4000'))

// new ApolloServer(schema)
//   .listen(() => console.log("Server is running on localhost:4000"));
