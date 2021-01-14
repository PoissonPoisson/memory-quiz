# About

This is a generic memory quiz server.
Which is an http server in TypeScript to **play quiz in local mode**. (No session management)

I wanted to create this project because I play a game with a lot of characters (+125) and I don't have a good memory to remember the names of the characters, so I created this project.

I have created two game modes by using my image directories :
* In the first game mode I show an image and 4 possibles item names answers and the goal is to find the right item name.

* In the seoncd game mode I show one item name and 4 possibles item images answers and the goal is to find the right item image.

To create a quiz, you just have to follow the specifications in [Create a quiz](#Create-a-quiz).

# Required

* Node.js (version 14.x LTS recommended)
* Internet (just to download the packages)
* Images folder ;)

# Installation and run

* Clone repository
```
> git clone https://github.com/PoissonPoisson/memory-quiz.git
```

* #### Create an environment variable file `.env` at the root of the project and insert data

| Variables | Data                         | Value                          | Default value |
|:----------|:-----------------------------|:-------------------------------|:--------------|
| PORT      | Server port                  | 0 - 65535                      | 5000          |
| RESOURCES | Path to resources directory  | An existing directory on your computer | -     |
| QUIZ_NAME | Title in browser tab         | An string                      | 'Memory Quiz' |
| ROUNDS    | Number of rounds in the quiz | 0 - Number of subdirectories   | 10            |
| NODE_ENV  | Runing mode                  | 'develop', 'production' or any | 'develop'     |

For exemple :
```
PORT=5000
RESOURCES=/home/images/quiz_images
QUIZ_NAME="My super quiz"
ROUNDS=10
NODE_ENV=develop
```

* Create an server data file `data.json` at the root of the project and copy example :
```json
{
  "bestScore": 0,
  "gameCounter": 0
}
```

* Install dependencies
```
> npm install
```

* Build server
```
> npm run build
```

* Start server
```
> npm start
```

In no production mode, you can start the server without build and start
```
> npm run start:dev
```

# Create a quiz

To create a quiz, you must have a directory that will contain all the elements of the quiz. (You have to put the path of this directory in the `.env` file in RESOURCE [here](####-Create-an-environment-variable-file-`.env`-at-the-root-of-the-project-and-insert-data).)

In this directory, you must have subdirectories that **respect the naming convention**: first letter in uppercase, full name and spaces replaced by underscore.

For exemple :
```
// Subdirectories valid name :
First_item
Item
Item2
My_Second_Item
SUBDIRECTORY

// Subdirectory invalid name :
First item
_item
item
.subdirectory
```

You must put **at least one image in the subdirectory**. The image must be in PNG, JPE, JPEG, GIF or WEBP format. There must be **no spaces in the name of the images**.

Now, you can create and play your own quiz ;)
