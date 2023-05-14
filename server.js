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

//Create Database
const db = client.db('testdb');
const membersCollection = db.collection('members');
//const testCollection = db.collection('members');

app.get('/memberlist', async (req, res) => {
    //members = await membersCollection.find({}).toArray();
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
        date: member.date,
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

app.post('/memberlist/form', async (req, res) => {
    await membersCollection.insertOne(req.body);
    res.redirect('/memberlist');
});

app.get('/memberpage/:id/edit', async (req, res) => {
    const member = await membersCollection.findOne(({ _id: new ObjectId(req.params.id) }));
    res.render('edit', { member });
});

app.post('/memberpage/:id/edit', async (req, res) => {
    const {name, email, phone, date, message } = req.body;
    const memberId = req.params.id;
    
  const result = await membersCollection.updateOne(
    { _id: new ObjectId(memberId) },
    {
      $set: {
        name: name,
        email: email,
        phone: phone,
        date: date,
        message: message
      }
    }
  );

  if (result.modifiedCount === 1) {
    res.redirect(`/memberpage/${memberId}`);
  } else {
    res.status(500).send('Failed to update member');
  }
});


app.listen(port, () => {
    console.log(`This server is running on port ${port}`)
});

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Court Crushers',
        motto: 'Smash the competition, dominate the court.',
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


