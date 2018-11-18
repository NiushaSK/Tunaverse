// Datenbank initialisieren
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('data.db',(error)=>{
		if(error){
			console.error(error.message);
		}else{
			console.log('Connected to the database.');
}});

// Express.js Webserver
const express = require('express');
const app = express();

// Body-Parser: wertet POST-Formulare aus
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// EJS Template Engine
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// Sessionvariablen
const session = require('express-session');
app.use(session({
	secret: 'example',
	resave: false,
	saveUninitialized: true
}));

// Passwort Verschlüsselung
const passwordHash = require('password-hash');

// EJS Template Engine
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');


app.use(express.static(__dirname + "/css"));


// Webserver starten http://localhost:3000
app.listen(3000, function(){
	console.log("listening on 3000");
});

//CSS Sheet initialisieren
app.use(express.static(__dirname + "/stylings"));

app.use(express.static(__dirname + "/js"));


// ====================================================



app.get('/homepage2', function(req, res) {
  res.render('homepage2');
});



app.get('/success', (req, res) => {
	res.render('success');
});

app.get('/login', (req, res) => {
	res.render('login');
});
//Zeig die Seite an wo man sich registrieren kann (das registration.ejs file)
app.get('/signup', (req, res)=>{
	res.render('signup');
});

//fuehre die registrierung durch
app.post('/registrierung', (req,res)=>{
	//ABfrage von user input und abspeichern in variablen
	const user = req.body["user"];
  var email = req.body["email"];
	var pw = req.body["password"];
  var money = 100;

//einfuegen des user inputs in die Datenbank
//Achtet auf die Anfuehrungszeichen!
	db.run(`INSERT INTO user (name, email, password, money) VALUES ('${user}', '${email}', '${pw}', '${money}')`,(error)=>{
		if(error){
			console.error(error.message);
		}
	});
	//Auf die login seite umleiten (durch redirect wird das app.get login aufgerufen)
	//durch res.render wird nur das ejs file geladen (im browser wird die URL dann nicht geaendert)
	res.redirect('login');
});


// Aufgabe: Formular 'index.html' auswerten
app.post('/anmelden', function(req, res){
	//Die eingabe aus dem body des requests (login.ejs file)
	const user = req.body["user"];
	var password = req.body["password"];
	db.get(`SELECT * FROM user WHERE name='${user}'`,(error,row)=>{
		//gibt es einen Eintrag in der Datenbank mit dem Usernamen der
		//in der Variable user gespeichert ist
		if(row != undefined){
			//Wenn ja, schau ob das Password richtig ist
			if(password == row.password){
				//hat geklappt
				// Sessionvariable setzen
				req.session['user'] = user;
				res.redirect('/profile');
			}else{
				//hat nicht gklappt, weil Password falsch
				res.render('error');
			}
		}else{
			//hat es nicht geklappt, weil kein User mit dem namen
			res.render('error');
		}
		//Falls ein Fehler auftritt in der Abfrage, gebe ihn aus
		if(error){
				console.error(error.message);
		}
	});

});
app.get('/profile', function(req, res){
	if (!req.session['user']){
		res.redirect('/login');
	}
	else{
		const user = req.session['user'];
    db.get(`SELECT * FROM user WHERE name='${user}'`,(error,row)=>{
    var money = row.money;
    var email = row.email;
		res.render('profile', {'user': user, 'money': money, 'email': email});
	});
}
});

app.get('/logout', function (req, res){
	delete req.session['user'];
	res.redirect('/login');
});

app.get('/editprofile', function (req, res){
  res.render('editprofile');
});

app.post('/edit', function (req, res){
  const user = req.session['user'];
  db.get(`SELECT * FROM user WHERE name='${user}'`,(error,row)=>{
  var new_email = req.body["new_email"];
	var password = req.body["password"];
  var new_password = req.body["new_password"];
  if(password == row.password && new_password.length > 0 && new_email.length > 0){
  db.run(`UPDATE user SET password='${new_password}' WHERE name='${user}'`,(error)=>{
  db.run(`UPDATE user SET email='${new_email}' WHERE name='${user}'`,(error)=>{
    req.session.user = user;
    req.session.save( function (err) {
      res.redirect('/success');
    });
    });
    });
  }else if(password == row.password && new_password.length > 0 && new_email.length==0){
  db.run(`UPDATE user SET password='${new_password}' WHERE name='${user}'`,(error)=>{
    req.session.user = user;
    req.session.save( function (err) {
      res.redirect('/success');
    });
    });
  }else if(password == row.password && new_password.length==0 && new_email.length > 0){
  db.run(`UPDATE user SET email='${new_email}' WHERE name='${user}'`,(error)=>{
    req.session.user = user;
    req.session.save( function (err) {
      res.redirect('/success');
    });
    });
  }else{
    res.render('editerror');
  }
  });
});


app.get('/shop', (req, res) => {
	const sql = `SELECT fish.name, fish.age, fish.race, fish.size, fish.price FROM fish LEFT JOIN user ON fish.userid=user.userid WHERE fish.userid IS NULL`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			res.render('fish', {'rows':  rows || []});
		}
	})
});

app.get('/owned_fish', function(req, res) {

	const sql = `SELECT fish.name, fish.age, fish.race, fish.size, fish.price FROM fish LEFT JOIN user ON fish.userid=user.userid WHERE fish.userid=1`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			res.render('fish', {'rows':  rows || []});
		}
	})
});

app.get('/fish_details', (req, res) => {
	const sql = `SELECT fish.name, fish.age, fish.race, fish.size, fish.price FROM fish LEFT JOIN user ON fish.userid=user.userid WHERE fish.userid=1`;
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err){
			console.log(err.message);
		}
		else{
			console.log(rows);
			res.render('fish', {'rows':  rows || []});
		}
	})
});

// Aufgabe: Formular 'index.html' auswerten
