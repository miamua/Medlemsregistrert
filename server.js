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

//const db = client.db('club');

//Create Database
const db = client.db('testdb');
const membersCollection = db.collection('members');
//const testCollection = db.collection('members');

app.get('/memberlist', async (req, res) => {
    //members = await membersCollection.find({}).toArray();
    let selectedOption = req.query.sort;
    let members = "";
    console.log(selectedOption);
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
        name: member.name,
        email: member.email,
        phone: member.phone,
        date: member.date,
        message: member.message,

    });
});

//zoo> db.animals.deleteOne({animal: 'koala'})
app.post('/memberpage/:id/delete', async (req, res) => {
    //const member = await membersCollection.findOne({ _id: new ObjectId(req.params.id) });
    //await membersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
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




//app.post('/user', (req, res) => {
//res.redirect(`form.html?username=${req.body.username}&password=${req.body.password}`);
//});

app.listen(port, () => {
    console.log(`This server is running on port ${port}`)
});

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Some Club',
        message: 'This supposed to be a starting page',
    })
});



