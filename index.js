// TODO: https://github.com/apollographql/apollo-server/issues/3508
// const {uploadMiddleWare} = require("./uploadMiddleware");
const {uploadFile} = require("./multerMiddleware");
const uploadController = require("./controllers/upload");
const multer = require("multer");
const cors = require('cors')
const {makeExecutableSchema} = require("graphql-tools");
const {createWriteStream} = require('fs');
const {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString} = require("graphql")
const {GraphQLServer} = require('graphql-yoga')
const {ApolloServer} = require('apollo-server-express')
const express = require('express')

// const {ApolloServer} = require("apollo-server");
const {GraphQLUpload} = require('graphql-upload');
global.__basedir = __dirname;
const path = '/';
const app = express();
const corsOptions = {
  origin: "http://localhost:300",
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
    uploadFile(file: Upload!): File
  }

  type Query {
    hello: String
  }
`;

// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, __basedir + "/resources/static/assets/uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
//   },
// });

const resolvers = {
  Mutation: {
    uploadFile: async (parent, {file}) => {
      const {filename, mimetype, encoding} = await file;
      // uploadFile.single("file")

      console.log("uploadFile", uploadFile);
      return true

      // const stream = createReadStream();
      //
      // // await new Promise((resolve, reject) => {
      // //   stream.on('error', error => {
      // //     unlink(path, () => {
      // //       reject(error);
      // //     });
      // //   }).pipe(createWriteStream(name))
      // //     .on('error', reject)
      // //     .on('finish', resolve)
      // // });
      // console.log('-----------file written');
      // return file;
      // return file.then(file => {
      //
      //   return true;
      // })
      // console.log('file', file)
    }
  },
  Query: {
    hello: () => "hi"
  }
};

const midLogger = (req, res, next) => {
  console.log("Hello from logger\n");
  next();
};

const schema = makeExecutableSchema({typeDefs, resolvers});
// const storag = multer({storage}).single("name")

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
const server = new ApolloServer({
  schema, plugins: [
    plugLogger
  ]
})
app.use("*", cors(corsOptions));
// app.use("*", uploadMiddleWare);
// app.use("*", uploadFile.single("file"), uploadController.uploadFiles);
app.use("*", uploadFile.single("file"));
// app.use("*", uploadFile.single("file"), (req, res) => {
//     res.json({
//       "name": req.file.filename,
//       "type": req.file.mimetype,
//       "size": req.file.size
//     })
//   }
// )
app.use("*", midLogger);
server.applyMiddleware({app, path})
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
