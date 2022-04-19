/*
MVC (Model View Controller)

-> Model: Represent data in your code. Basically all database access (including fetch and write) are controlled by model.

-> View: Represents how the user sees your web project. This mostly contains the code which you want to show to the user on his UI.

-> Controller: Connect the model with views and all in-between logic is present here. This is mostly within the routes section.

*/

/*
    Databases are divided into 2 parts SQL (Eg: MySQL) and NoSQL (Eg: MongoDB).

    Install MySQL workbench (community version). This will help

*/

/*
    In case of doubts regarding mongodb nomenclature go to mondo db compass it explains a lot of naming conventions some are

    -> database is same as sql
    -> table(in SQL) = collection (in MongoDB)
    -> Document(in MongoDB) = data tuples (in SQL)

*/

/*
    -> In case you want to remove any module from node_module use the command: npm uninstall <module_name> --save
*/

/*
******************** Sessions And Cookies ************************

-> They are important concepts that will allow you to store data of the user's preferences in the user's computer itself (cookies) or in the server (sessions).

COOKIES:

-> REMEMBER: Every request is independent and will not have data of previous requests. When we redirect a new request is written which will not have data from previous request so. Logged in data cannot be implemented like this. Every render and redirect function will scrub the old request and create new request hence data will be lost.

-> We can use cookies now. We are setting the header for the response. Now the web browser will attach this cookie to itself and for all concecutive requests it will be attached. So this data will be present until the web browser is not closed.

-> Since cookie is stored on a user's browser we cannot use cookies to store sensetive data as it can be manipulated and is visible. So we normally tend to use sessions

SESSIONS:

-> When we use sessions for storing data we store it in the server but not as a server variable but it will be stored such that it will unique for every user. And data attached to it will be shared with every request made from the host. It will exist until the session is not destroyed, which normally happens when we log out. 

-> What we will be doing is saving the user information in session (i.e server) and saving the id of this session in cookies. The id of session will be masked by the library (express-session) to give only a particular hash-value. So even if someone manipulates it, it will be difficult to guess what other session id is present since a session is created by the user when he logs in and destroys it when he logs out. 

// Check features on: https://www.npmjs.com/package/express-session

-> Normally we tend to store the sessions data in database and not in memory because a large number of people may access the server at the same time resulting in overflow of server memory. What we can do is save it in a table/collection called session and then retreive it from the database. We use mongodb-connect-session library to do this.

// https://www.npmjs.com/package/connect-mongodb-session

-> We will be using express-session library to play around with sessions.

-> We will be using bcryptjs to hash / encode the password so that it is not visible even in the server. Once hashed it cannot be deencrypted again. So we will using the same library to compare the password while authentication.

*/

/*
**************************** Adding Authentication ******************************

-> Concealing some features in your app to only logged in users so that data is not manipulated by stray users is called authentication.


    User --------------------------->Cookies
      |                                A
      |                                |
      |                                |
1.(Login Request)   5.(Session ID is stored in cookies which is used in 
      |                     concecutive requests to access session.)
      |                                |
      |                                |
      V                                V
    Server ------3.(Creates)------> Session
      |                                |
      |                                |
2.(Validation)                 4.(Stores in DB)
      |                                |
      |                                |
      V                                V
    Database<-----------------Required User data


-> Route protection is an important method that is used to restrict users to enter into pages by manipulating the url

For example: In our app, add product page is restricted to only logged in user but to restrict user from entering into this page by manually altering the url, we have to use route protection.

**********************Security**************************

1. CSRF - Cross Site Request Forgery

-> In these cases, a fake site will be created which will impersonate the front end of your application.

-> From this site, we may get a post request to our server through some form, like, for example, some order for a product which the user didn't order. Since most of this happens at back end of that site it is invisible to the user. (Since he doesn't know that he is on a fake site)

-> Since he is logged in, session will be in motion, his request will be accepted by the server. This had caused a lot of problems for flipkart during the early days. 

-> It can be solved using CSRF tokens which will not allow any other views except the views you have defined to contact your server. In simple words no one can impersonate this token even if they have impersonated your views as it will be unique to our views. Our server will check this token and if valid will respond. 

-> For every request, that has some important contact with server, we can assign a csrf token. At server level will just cross verify the token if it matches it will respond or else fail. A new token is created for each page render.

// https://www.npmjs.com/package/csurf

*************************** Adding Error Messages by passing data when we redirect *********************************

-> One way to solve this problem is by storing the error message temporarily in the session

-> It is simplified by using a library : connect-flash
*/

/*
-> Though node and express are server side languages but it doesn't support a mailing server. Mailing server is different from an actual server.

-> We use a 3rd party mail servers.

Node Server ----- Mail server ----> User
<your code>       <3rd party>      <cust>
*/
/*
**************************Validation**************************************


                      User Input
                          |
                          |
                          |
                          V
                Validate on client side 
 (risky since user can disable validation features but improves user experience)  
                          |
                          |
                          V
                Validate on Server side
  (Most important form of validation since this is perfect between database and client and is not visible as well)
                          |
                          |
                          |
                          V
                        Server
                          |
                          |
                          V
                      Database
  (Mongodb has built in validations but if server side validation is strong not needed)

-> Once we perform server side validation, we must not allow reloading of page in case of error with correct messages. Terrible user experience

-> Check the documentation for express-validator https://express-validator.github.io/docs/
*/
