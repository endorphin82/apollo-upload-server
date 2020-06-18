// TODO: https://github.com/apollographql/apollo-server/issues/3508
const {makeExecutableSchema} = require("graphql-tools");
const {createWriteStream} = require('fs');
const {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString} = require("graphql")
const {GraphQLServer} = require('graphql-yoga')
// const {ApolloServer} = require("apollo-server");
const {GraphQLUpload} = require('graphql-upload');
//

//
// const FileType = new GraphQLObjectType({
//   name: 'File',
//   fields: {
//     filename: {type: new GraphQLNonNull(GraphQLString)},
//     mimetype: {type: new GraphQLNonNull(GraphQLString)},
//     encoding: {type: new GraphQLNonNull(GraphQLString)}
//   }
// })
// const schema = new GraphQLSchema({
//   mutation: new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {
//       uploadFile: {
//         type: FileType,
//         args: {
//           file: {
//             type: new GraphQLNonNull(GraphQLUpload),
//           },
//         },
//         resolve: async (parent, {file}) => {
//           const {filename, mimetype, createReadStream} = await file;
//           const stream = createReadStream();
//
//           await new Promise((resolve, reject) => {
//             stream.on('error', error => {
//               unlink(path, () => {
//                 reject(error);
//               });
//             }).pipe(createWriteStream(filename))
//               .on('error', reject)
//               .on('finish', resolve)
//           });
//           console.log('-----------file written');
//           // Promisify the stream and store the file, then…
//           return file;
//         },
//       },
//     },
//   }),
//   query: new GraphQLObjectType({
//     name: 'Query',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve: () => "hi"
//       }
//     }
//   })
// });



// const storeUpload = ({stream, filename}) => {
//   return new Promise((resolve, reject) => {
//     return stream
//       .pipe(createWriteStream(filename))
//       .on("finish", () => resolve())
//       .on("error", reject)
//   })
// }


const typeDefs = `
  scalar Upload

 type File {
      name: String!
      type: String!
      size: String!
   }

  type Mutation {
    uploadFile(file: Upload!): File
  }

  type Query {
    hello: String
  }
`;


const resolvers = {
  Mutation: {
    uploadFile: async (parent, {file}) => {
      const {name, type, createReadStream} = await file;
      const stream = createReadStream();

      await new Promise((resolve, reject) => {
        stream.on('error', error => {
          unlink(path, () => {
            reject(error);
          });
        }).pipe(createWriteStream(name))
          .on('error', reject)
          .on('finish', resolve)
      });
      console.log('-----------file written');
      return file;
      // return file.then(file => {
      //
      //   return true;
      // })
    }
  },
  Query: {
    hello: () => "hi"
  }
};
const schema = makeExecutableSchema({typeDefs, resolvers});

const server = new GraphQLServer({
  schema
})
server.start(() => console.log('Server is running on http://localhost:4000'))

// new ApolloServer(schema)
//   .listen(() => console.log("Server is running on localhost:4000"));
