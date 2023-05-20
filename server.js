import { MongoClient, ObjectId } from "mongodb";
import express from "express";

const app = express();
const port = 3999;

app.set('views', './views');
app.set('view engine', 'ejs')

app.use(express.urlencoded());
app.use(express.static('public'));

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();

//Create Database and collection
const db = client.db('clubdb');
const membersCollection = db.collection('members');

app.get('/memberlist', async (req, res) => {
    await membersCollection.find({}).toArray();
    let selectedOption = req.query.sort;
    let members = "";
    
    switch (selectedOption) {
        case 'Ascending':
            members = await membersCollection.find({}).sort({ name: 1 }).toArray();
            res.render('memberlist', {
                members,
                title: 'All members',
            });
            break;
        case 'Descending':
            members = await membersCollection.find({}).sort({ name: -1 }).toArray();
            res.render('memberlist', {
                members,
                title: 'All members',
            });
            break;
        default:
            members = await membersCollection.find({}).toArray();
            res.render('memberlist', {
                members,
                title: 'All members',
            });
            break;
    }

});



app.get('/memberpage/:id', async (req, res) => {
    const member = await membersCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.render('memberpage', {
        title: member.name,
        name: member.name,
        email: member.email,
        phone: member.phone,
        created_at: member.created_at,
        message: member.message,
        id: member._id,

    });
});

app.post('/memberpage/:id/delete', async (req, res) => {
    await membersCollection.deleteOne(({ _id: new ObjectId(req.params.id) }));
    console.log('THIS IS DELETE')
    res.redirect('/memberlist')
});


app.get('/memberlist/form', (req, res) => {
    res.render('form');
});


app.post("/memberlist/form", async (req, res) => {

  const newUser = {
    name: req.body.name.toLowerCase(),
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
    created_at: new Date(),
  };
  await membersCollection.insertOne(newUser);
  res.redirect("/memberlist");
});

app.get('/memberpage/:id/edit', async (req, res) => {
    const member = await membersCollection.findOne(({ _id: new ObjectId(req.params.id) }));
    res.render('edit', 
    { member,
    title: "Edit" });
});

app.post('/memberpage/:id/edit', async (req, res) => {
    const {name, email, phone, message } = req.body;
    const memberId = req.params.id;
    
  const result = await membersCollection.updateOne(
    { _id: new ObjectId(memberId) },
    {
      $set: {
        name: name,
        email: email,
        phone: phone,
        message: message
      }
    }
  );
  res.redirect(`/memberpage/${memberId}`);
  /*
  if (result.modifiedCount === 1) {
    res.redirect(`/memberpage/${memberId}`);
  } else {
    res.status(500).send('Failed to update member');
  }
  */
});


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Topspin Titans',
        motto: `"Rise to the top with us"`,
        description: 'Our club is a community of passionate table tennis players who love the strategic, fast-paced nature of the game. We focus on both improving our technique and building lasting friendships.'
    })
});

app.get('/register', async (req, res) => {
    res.render('form',{
        title: 'Register'
    });
});

app.get('/contact', async (req, res) => {
    res.render('contact',{
        title: 'Contact us'
    });
});

app.listen(port, () => {
    console.log(`This server is running on port ${port}`)
});
