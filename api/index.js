const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const port = 8000;
const cors = require('cors');

const multer = require('multer');
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require('jsonwebtoken');

mongoose
  .connect('mongodb+srv://vivekvbgm:vivekvbgm@cluster0.4wtna9v.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to Mongo DB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB' + err);
  });

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});

const User = require('./models/user');
const Message = require('./models/message');

//endpoints for registration of the user
app.post('/register', (req, res) => {
  const { name, email, password, image } = req.body;

  //create a new user object
  const newUser = new User({ name, email, password, image });

  //save the user to the databse
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: 'User registered Successfullt' });
    })
    .catch((error) => {
      console.log('Error registering user', err);
      res.status(500).json({ message: 'Error registring the user' });
    });
});

//function to create token with a secret key and expiration time
const createrToken = (userId) => {
  //Set the token payload
  const payload = {
    userId: userId
  };

  //Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, 'QWUGAOH33FYS6asf8we36zdfw', {
    expiresIn: '1h'
  });

  return token;
};

//endpoint for loggin in of that particular user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(404)
      .json({ message: 'Email and the password are required' });
  }

  //check for that user in the databse
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: 'User not found' });
      }
      //compare the password
      if (user.password !== password) {
        return res.status(404).json({ message: 'Invalid password' });
      }

      const token = createrToken(user._id);
      res.status(200).json({ token });
    })
    .catch((err) => {
      console.log('Error in finding the user ', err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

//endpoint to access all the users except the user who's currently logged in!
app.get('/users/:userId', (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log('Error Retrieving Users', err);
      res.status(500).json({ message: 'Error retrieving users' });
    });
});

//endpoint to send a request to a user
app.post('/friend-request', async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
  console.log(req.body);

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId }
    });

    //update the sender's sentFriendRequset Array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId }
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoints to show all the friends request of a particular user
app.get('/friend-request/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the user id
    const user = await User.findById(userId)
      .populate('friendRequests', 'name email image')
      .lean();

    const friendRequests = user.friendRequests;
    res.json(friendRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//endpoint to accept a request of a perticular person
app.post('/friend-request/accept', async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: 'Friend Request accepted Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//endpoint to access all friends of the logged in user!
app.get('/accepted-friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      'friends',
      'name email image'
    );

    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Configure multer for handling file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files'); //Specify the desired destination folder
  },
  filename: function (req, file, cb) {
    //Generating a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() + 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// endpoint to post Messages and store it in the backend
app.post('/messages', upload.single('imageFile'), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;
    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === 'image' ? req.file.path : null
    });

    await newMessage.save();

    res.status(200).json({ message: 'Message sent Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'INternal Server Error' });
  }
});

//endpoint to get the userdetails to design the chat room header
app.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    //fetch the user data from the user Id
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//endpoint to fetch the messages btw two users in the chatRoom
app.get('/message/:senderId/:recepientId', async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId }
      ]
    }).populate('senderId', '_id name');

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Invalid Server Error' });
  }
});

//endpoint to delete the message!
app.post('/deleteMessages', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Invalid req.body' });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server' });
  }
});

//

app.get('/friend-requests/sent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('sentFriendRequests', 'name email image')
      .lean();

    const sentFriendRequests = user.sentFriendRequests;
    res.json(sentFriendRequests);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Internal Server' });
  }
});

app.get('/friends/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    User.findById(userId)
      .populate('friends')
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const friendIds = user.friends.map((friend) => friend._id);

        res.status(200).json(friendIds);
      });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'internal server error' });
  }
});
