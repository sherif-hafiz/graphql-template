const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());

const events = [];

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`

    type Event {
        _id: ID!, 
        title: String!, 
        description: String!, 
        price: Float!, 
        date: String!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation { 
        createEvent(eventInput: EventInput): Event
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => events,
    createEvent: (args) => {
      console.log(args);
      const event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date().toISOString(),
      };
      console.log(event);
      events.push(event);

      return event;
    },
  },
  graphiql: true,
}));

mongoose.set('useNewUrlParser', true);
mongoose.createConnection(`mongodb://localhost:27017/${process.env.MONGO_DB}`)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB has started up');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
app.listen(3001);
