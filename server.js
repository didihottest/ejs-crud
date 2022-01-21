const express = require('express')
const app = express()
const fs = require('fs')
const { uuid } = require('uuidv4');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const isLoggedIn = require('./middleware/authMiddleware')

app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', './public/views')
// untuk share file secara public
app.use(express.static(__dirname + '/public'))
// middleware untuk parsing body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', isLoggedIn, (req, res) => {
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)
  res.render('main', {
    pageTitle: "Main",
    data: dataParsed
  })
})

app.get('/add', isLoggedIn, (req, res) => {
  res.render('add.ejs', {
    pageTitle: "Add",
  })
})
// edit cara post

app.post('/add', (req, res) => {
  const { nama, hoby } = req.body
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)
  const newHoby = {
    id: uuid(),
    nama,
    hoby
  }
  dataParsed.push(newHoby)
  fs.writeFileSync('./data/data.json', JSON.stringify(dataParsed, null, 4))
  res.redirect('/')
})

app.get('/edit', isLoggedIn, (req, res) => {
  const { id } = req.query
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)

  const dataToEdit = dataParsed.find((item) => {
    return item.id = id
  })
  res.render('edit.ejs', {
    pageTitle: "Edit",
    data: dataToEdit
  })
})

// edit cara post

app.post('/edit', (req, res) => {
  const { id } = req.query
  const { nama, hoby } = req.body
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)

  const dataToEditIndex = dataParsed.findIndex((item) => {
    return item.id = id
  })
  const dataToEdit = {
    id: id,
    nama: nama,
    hoby: hoby
  }

  dataParsed[dataToEditIndex] = dataToEdit
  fs.writeFileSync('./data/data.json', JSON.stringify(dataParsed, null, 4))
  res.redirect('/')
})

// edit cara put

app.put('/edit', (req, res) => {
  console.log('====================================');
  console.log("masuk");
  console.log('====================================');
  const { id } = req.query
  const { nama, hoby } = req.body
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)

  const dataToEditIndex = dataParsed.findIndex((item) => {
    return item.id = id
  })
  const dataToEdit = {
    id: id,
    nama: nama,
    hoby: hoby
  }

  dataParsed[dataToEditIndex] = dataToEdit
  fs.writeFileSync('./data/data.json', JSON.stringify(dataParsed, null, 4))
  res.json({
    message: "Berhasil"
  })
  // res.redirect('/')
})


app.post('/delete', (req, res) => {
  const { id } = req.query
  const data = fs.readFileSync('./data/data.json', 'utf-8')
  const dataParsed = JSON.parse(data)

  const deletedList = dataParsed.filter((item) => {
    return item.id != id
  })
  fs.writeFileSync('./data/data.json', JSON.stringify(deletedList, null, 4))
  res.redirect('/')
})

app.get('/login', (req, res) => {
  const { status } = req.query
  res.render('login', {
    status
  })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const data = JSON.parse(fs.readFileSync('./data/user.json', 'utf-8'))
  const userMatch = data.find((item) => item.email == email)

  // if userMatch === null atau userMatch === undefined atau userMatch === false
  if (!userMatch) {
    res.redirect('/login?status=emailnotfound')
  } else {
    if (password === userMatch.password) {
      const token = jwt.sign({ //ngunci data (in this case email & user)
        email: userMatch.email,
        id: userMatch.id
      }, 'secret', {
        // expiresIn: 60 * 60 * 24 // 1 hari satuan detik
        expiresIn: 86400 // 1 hari
        // 60 detik dikali 60 detik = 3600 detik = 1 jam
        // 1 jam dikali 24 = 1 hari
      })

      // res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 })// max age satu hari
      res.cookie('jwt', token, { maxAge: 86400000 })// max age satu hari (satuan milisecon)
      res.redirect('/')
    } else {
      res.redirect('/login?status=wrongpassword')
    }
  }
})


app.get('/set-cookies', (req, res) => {
  // cara vanilla
  // res.setHeader('Set-Cookie', 'userId=1')
  // cara modul cookieParser
  res.cookie('userId', 1)
  res.cookie('username', "Didi", { maxAge: 1000 * 60 * 60 * 24 })
  // max age cookie gunanya untuk masa waktu cookie di dalam browser
  // kalau waktunya habis maka cookie nya akan menghilang
  res.json({
    message: "anda mendapat cookie"
  })
})

app.get('/get-cookies', (req, res) => {
  console.log(req.cookies)
  res.json({ cookies: req.cookies })
})

app.post('/logout', (req, res) => {
  res.cookie('jwt', '', { maxAge: 5000 })
  res.redirect('/login')
})



const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})